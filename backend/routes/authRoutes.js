import express from "express";
import {signup,login,updatePassword, getUserProfile} from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup); // ✅ match frontend
router.post("/login", login);
router.put("/:id/password", authenticate, updatePassword); // ✅ RESTful naming
router.get("/:id", authenticate, getUserProfile)


export default router;
