import Rating from '../models/Rating.js'
import Store from '../models/Store.js'

// Dashboard for owner
const getOwnerDashboard = async (req, res) => {
  try {
    const stores = await Store.find({ owner: req.user.id });
    const ratings = await Rating.find({ store: { $in: stores.map(s => s._id) } });

    res.json({
      totalStores: stores.length,
      totalRatings: ratings.length,
      avgRating: ratings.length
        ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
        : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new store
const addStore = async (req, res) => {
  try {
    const { name, address } = req.body;
    const store = new Store({ name, address, owner: req.user.id });
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      req.body,
      { new: true }
    );
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete store
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {getOwnerDashboard, addStore, updateStore, deleteStore}
