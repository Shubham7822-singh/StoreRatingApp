import mongoose from "mongoose";
const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  address: { type: String, maxlength: 400 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Store", StoreSchema);
