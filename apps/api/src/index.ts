import express from "express";
import cors from "cors";
import pino from "pino";
import postsRouter from "./routes/posts";
import engagementsRouter from "./routes/engagements";
import domainsRouter from "./routes/domains";
import profilesRouter from "./routes/profiles";
import followsRouter from "./routes/follows";
import healthRouter from "./routes/health";
import checkDataRouter from "./routes/check-data";
import { mountGraphQL } from "./graphql/server";

const app = express();
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

const defaultAllowed = ["http://localhost:3000", "http://127.0.0.1:3000"];
const envAllowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
const allowed = envAllowed.length > 0 ? envAllowed : defaultAllowed;

console.log("🔧 CORS Configuration:", {
  environment: process.env.NODE_ENV,
  allowedOrigins: allowed,
  hasCustomOrigins: envAllowed.length > 0
});
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowed.length === 0) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't send stack traces in production
  const errorResponse = {
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production') {
    (errorResponse as any).stack = err.stack;
  }

  res.status(500).json(errorResponse);
});

app.use("/health", healthRouter);
app.use("/posts", postsRouter);
app.use("/engagements", engagementsRouter);
app.use("/domains", domainsRouter);
app.use("/profiles", profilesRouter);
app.use("/follows", followsRouter);
app.use("/check", checkDataRouter);

const port = Number(process.env.PORT || 4000);

// Graceful shutdown handlers
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // Don't exit immediately, let the process handle it gracefully
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the process handle it gracefully
});

mountGraphQL(app).then(() => {
  const server = app.listen(port, () => {
    logger.info({ port }, "API server listening");
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('✅ Server closed gracefully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}).catch((error) => {
  console.error('🚨 Failed to start server:', error);
  process.exit(1);
});
