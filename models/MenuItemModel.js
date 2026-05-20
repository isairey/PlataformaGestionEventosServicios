import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide item name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      required: [true, "Please provide item description"],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "Please provide category"],
      enum: [
        "Appetizers",
        "Main Course",
        "Desserts",
        "Beverages",
        "Snacks",
        "Salads",
      ],
    },
    pricePerPlate: {
      type: Number,
      required: [true, "Please provide price per plate"],
      min: 0,
    },
    dietaryInfo: {
      type: [String],
      enum: [
        "Vegetarian",
        "Vegan",
        "Gluten-Free",
        "Halal",
        "Kosher",
        "Nut-Free",
      ],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "uploads/default-food.png",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", MenuItemSchema);
