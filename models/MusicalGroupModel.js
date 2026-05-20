import mongoose from "mongoose";

const MusicalGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide group name"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Please provide item description"],
      trim: true,
      maxlength: 200,
    },
    genre: {
      type: String,
      required: [true, "Please provide genre"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    price: {
      type: Number,
      required: [true, "Please provide price per plate"],
      min: 0,
    },
    members:{ 
      type: [String],
      default: [],
    },
    contactEmail: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    contactPhone: {
      type: String,
      required: [true, "Please provide contact phone number"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    availableForEvents: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      default: "uploads/default-band-image.png",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MusicalGroup", MusicalGroupSchema);
