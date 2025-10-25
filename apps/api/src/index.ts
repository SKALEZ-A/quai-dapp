import express from "express";
import cors from "cors";
import pino from "pino";
import postsRouter from "./routes/posts";
import engagementsRouter from "./routes/engagements";
import domainsRouter from "./routes/domains";
import profilesRouter from "./routes/profiles-mock";
import healthRouter from "./routes/health";
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
  console.error('🚨 API Error:', err.message);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

app.use("/health", healthRouter);
app.use("/posts", postsRouter);
app.use("/engagements", engagementsRouter);
app.use("/domains", domainsRouter);
app.use("/profiles", profilesRouter);

const port = Number(process.env.PORT || 4000);
mountGraphQL(app).then(() => {
  app.listen(port, () => {
    logger.info({ port }, "API server listening");
  });
});
