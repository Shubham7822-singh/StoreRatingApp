import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 60 },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"] 
    },
    password: { type: String, required: true, minlength: 6 },
    address: { type: String, maxlength: 400 },
    role: { 
      type: String, 
      enum: ["admin", "user", "owner"], // 🔥 fixed to match controller & frontend
      default: "user" 
    }
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model("User", UserSchema);
