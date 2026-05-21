import { Router } from "express";
import fs from "fs";
import path from "path";
import { adminRequired } from "../middleware/auth.js";

const router = Router();

// Ensure the uploads directory exists inside the React client's public folder
const UPLOADS_DIR = path.join(process.cwd(), "..", "client", "public", "uploads");
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Failed to create uploads directory (expected in read-only serverless environments like Vercel):", e.message);
}

router.post("/", adminRequired, async (req, res, next) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ message: "Filename and base64Data are required" });
    }

    // Strip Data URI prefix if present (e.g. "data:image/jpeg;base64,...")
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let dataBuffer;
    
    if (matches && matches.length === 3) {
      dataBuffer = Buffer.from(matches[2], "base64");
    } else {
      dataBuffer = Buffer.from(base64Data, "base64");
    }

    // Clean filename and make it unique with a timestamp to prevent overwrites
    const ext = path.extname(filename) || ".png";
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}_${Date.now()}${ext}`;
    
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    // Save image directly to the React public assets folder
    fs.writeFileSync(filePath, dataBuffer);
    
    // Return relative CDN-compatible URL path
    const servedUrl = `/uploads/${uniqueFilename}`;
    res.json({ imageUrl: servedUrl });
  } catch (e) {
    next(e);
  }
});

export default router;
