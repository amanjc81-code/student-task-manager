import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret";

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.userId = payload.sub;
  next();
}

export async function adminRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const user = await User.findById(payload.sub);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admin role required" });
    }
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(500).json({ message: "Server error during admin verification" });
  }
}
