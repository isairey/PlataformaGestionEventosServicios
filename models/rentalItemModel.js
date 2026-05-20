import mongoose from "mongoose";

const RentalItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide rental item name"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "Please provide category"],
      enum: ["Equipment", "Furniture", "Decor", "Other"],
    },
    rentalPrice: {
      type: Number,
      required: [true, "Please provide rental price"],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, "Please provide rental duration"],
      min: 1,
    },
    rentalStartDate: {
      type: Date,
      required: [true, "Please provide rental start date"],
    },
    availability: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Virtual field to check if rental has expired
RentalItemSchema.virtual("isExpired").get(function () {
  if (!this.rentalStartDate || !this.duration) return false;
  const rentalEndDate = new Date(this.rentalStartDate);
  rentalEndDate.setDate(rentalEndDate.getDate() + this.duration);
  return rentalEndDate < new Date();
});

// Ensure virtuals are included in JSON responses
RentalItemSchema.set("toJSON", { virtuals: true });
RentalItemSchema.set("toObject", { virtuals: true });

// Remove sensitive fields from JSON responses
RentalItemSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model("RentalItem", RentalItemSchema);