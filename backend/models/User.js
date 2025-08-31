
import mongoose  from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
      profilePicture: { type: String },
      lastLogin: { type: Date },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      passwordResetToken: { type: String },
      passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);



const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;