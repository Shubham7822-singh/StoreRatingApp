// controllers/storeController.js
import Rating from "../models/Rating.js";
import Store from "../models/Store.js";

// ============================
// ✅ Get all stores
// ============================
const getStores = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter = { name: new RegExp(search, "i") }; // case-insensitive search
    }

    // include store owner info
    const stores = await Store.find(filter).populate("ownerId", "name email");

    const data = await Promise.all(
      stores.map(async (s) => {
        const ratings = await Rating.find({ store: s._id });
        const avg = ratings.length
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        let userRating = null;
        if (req.user) {
          const found = await Rating.findOne({
            store: s._id,
            user: req.user.id,
          });
          userRating = found ? found.rating : null;
        }

        return { ...s._doc, avgRating: avg, myRating: userRating };
      })
    );

    res.json(data);
  } catch (err) {
    console.error("❌ getStores error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ============================
// ✅ Add a new store (Admin only)
// ============================
const addStore = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add stores" });
    }

    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    console.error("❌ addStore error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ============================
// ✅ Add or update rating for a store
// ============================
const addRating = async (req, res) => {
  try {
    const { rating } = req.body;

    let rate = await Rating.findOne({
      store: req.params.id,
      user: req.user.id,
    });

    if (rate) {
      rate.rating = rating;
      await rate.save();
    } else {
      rate = new Rating({
        store: req.params.id,
        user: req.user.id,
        rating,
      });
      await rate.save();
    }

    // recalc avg rating
    const ratings = await Rating.find({ store: req.params.id });
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return res.json({
      message: rate ? "Rating updated" : "Rating submitted",
      avgRating,
      myRating: rate.rating,
    });
  } catch (err) {
    console.error("❌ addRating error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ============================
// ✅ Store Owner Dashboard
// ============================
const getOwnerDashboard = async (req, res) => {
  try {
    // 🔑 Fix: role should be "storeOwner"
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    // get stores owned by this user
    const stores = await Store.find({ ownerId: req.user.id });
    const totalStores = stores.length;

    let totalRatings = 0;
    let allRatings = [];
    let users = [];

    for (const store of stores) {
      const ratings = await Rating.find({ store: store._id }).populate(
        "user",
        "name email"
      );
      totalRatings += ratings.length;
      allRatings.push(...ratings);

      ratings.forEach((r) => {
        users.push({
          _id: r.user._id,
          name: r.user.name,
          email: r.user.email,
          rating: r.rating,
        });
      });
    }

    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    res.json({
      totalStores,
      totalRatings,
      avgRating,
      users,
    });
  } catch (err) {
    console.error("❌ getOwnerDashboard error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================
// ✅ Exports
// ============================
export { getStores, addStore, addRating, getOwnerDashboard };
