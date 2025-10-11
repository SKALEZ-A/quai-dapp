import { Router } from "express";
import { testIPFSConnection } from "../services/ipfs";
import { prisma } from "../db/client";

const router = Router();

// Health check endpoint
router.get("/", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test IPFS connection
    const ipfsTest = await testIPFSConnection();
    
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: "healthy",
        ipfs: ipfsTest.success ? "healthy" : "unhealthy",
        ...(ipfsTest.error && { ipfsError: ipfsTest.error }),
        ...(ipfsTest.cid && { testCid: ipfsTest.cid })
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// IPFS-specific health check
router.get("/ipfs", async (req, res) => {
  try {
    const result = await testIPFSConnection();
    
    if (result.success) {
      res.json({
        status: "healthy",
        message: "IPFS connection successful",
        testCid: result.cid,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: "unhealthy",
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
