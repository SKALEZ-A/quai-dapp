import express from "express";
import cors from "cors";
import pino from "pino";

const app = express();
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  logger.info({ port }, "API server listening");
});
