import express from "express";
import {
  getDashboard,
  getAllStores,
  getAllUsers,
  addUser
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboard);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/stores", protect, adminOnly, getAllStores);

// ✅ FIX: keep this consistent with frontend
router.post("/users", protect, adminOnly, addUser);

export default router;
