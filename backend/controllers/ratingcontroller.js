import Rating from "../models/Rating.js";
import mongoose from "mongoose"

const addOrUpdateRating = async (req, res) => {
  const { userId, storeId, rating } = req.body;

  try {
    const existingRating = await Rating.findOne({ storeId, userId });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.status(200).json(existingRating);
    }

    const newRating = new Rating({ storeId, userId, rating });
    await newRating.save();
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStoreRatings = async (req, res) => {
  const { storeId } = req.params;

  try {
    const ratings = await Rating.find({ storeId }).populate("userId", "name");
    res.status(200).json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAverageRating = async (req, res) => {
  const { storeId } = req.params;

  try {
    const result = await Rating.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      { $group: { _id: "$storeId", avgRating: { $avg: "$rating" } } },
    ]);
    res.status(200).json({ avgRating: result[0]?.avgRating || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {addOrUpdateRating, getStoreRatings, getAverageRating}