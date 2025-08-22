import express from 'express'
// import {getOwnerStores} from '../controllers/ownerController.js'
import {protect} from '../middleware/authMiddleware.js'

const router = express.Router();

// Owner-specific routes
// router.get("/stores", protect, getOwnerStores);

export default router; // ✅
