import express from "express";
import {
  getStores,
  addStore,
  addRating,
  getOwnerDashboard,
} from "../controllers/storeController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public: anyone can view stores (if logged in, they'll see their own rating)
router.get("/", getStores);

// ✅ Admin only: add new store
router.post("/", protect, adminOnly, addStore);

// ✅ Any logged-in user: add or update rating
router.post("/:id/rating", protect, addRating);

// ✅ Store Owner Dashboard
router.get("/owner/dashboard", protect, getOwnerDashboard);

export default router;
