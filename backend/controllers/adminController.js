import User from "../models/User.js";
import Store from "../models/Store.js";
import Rating from "../models/Rating.js";
import bcrypt from "bcryptjs"; // ✅ consistent

// ➕ Admin Add User
const addUser = async (req, res) => {
  try {
    // ✅ only admin can add users
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can add users." });
    }

    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ only allow valid roles
    if (!["user", "admin", "storeOwner"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'user', 'admin', or 'storeOwner'",
      });
    }

    // ✅ check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully by Admin",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error in addUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📊 Admin Dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();

    res.status(200).json({
      message: "Admin Dashboard Stats",
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    console.error("Error in getDashboard:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 👥 Get All Users (with store + rating info if storeOwner)
const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    let filter = {};

    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (address) filter.address = new RegExp(address, "i");
    if (role) filter.role = role;

    let users = await User.find(filter).select("-password");

    const usersWithRatings = await Promise.all(
      users.map(async (user) => {
        if (user.role === "storeOwner") {
          const store = await Store.findOne({ ownerId: user._id });
          if (store) {
            const ratings = await Rating.find({ storeId: store._id });
            const avgRating =
              ratings.length > 0
                ? (
                    ratings.reduce((sum, r) => sum + r.value, 0) /
                    ratings.length
                  ).toFixed(2)
                : 0;
            return {
              ...user.toObject(),
              store: {
                name: store.name,
                address: store.address,
                averageRating: avgRating,
              },
            };
          }
        }
        return user;
      })
    );

    res.status(200).json(usersWithRatings);
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🏪 Get All Stores
const getAllStores = async (req, res) => {
  try {
    const { name, email, address } = req.query;
    let filter = {};

    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (address) filter.address = new RegExp(address, "i");

    const stores = await Store.find(filter).populate("ownerId", "name email");

    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ storeId: store._id });
        const avgRating =
          ratings.length > 0
            ? (
                ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
              ).toFixed(2)
            : 0;

        return {
          ...store.toObject(),
          averageRating: avgRating,
        };
      })
    );

    res.status(200).json(storesWithRatings);
  } catch (error) {
    console.error("Error in getAllStores:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getDashboard, getAllUsers, getAllStores, addUser };
