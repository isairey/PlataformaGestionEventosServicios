import mongoose from "mongoose";

const EventPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide package name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      required: [true, "Please provide package description"],
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      required: [true, "Please provide event type"],
      enum: [
        "Wedding",
        "Birthday",
        "Corporate",
        "Anniversary",
        "Graduation",
        "Other",
      ],
    },
    pricePerPerson: {
      type: Number,
      required: [true, "Please provide price per person"],
      min: 0,
    },
    minimumGuests: {
      type: Number,
      required: [true, "Please provide minimum number of guests"],
      min: 1,
    },
    maximumGuests: {
      type: Number,
      required: [true, "Please provide maximum number of guests"],
      min: 1,
    },
    menuItems: [
      {
        type: mongoose.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
    ],
    services: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "uploads/default-package.png",
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

// Validate that maximumGuests is greater than minimumGuests
EventPackageSchema.pre("save", function (next) {
  if (this.maximumGuests < this.minimumGuests) {
    next(
      new Error(
        "Maximum guests must be greater than or equal to minimum guests"
      )
    );
  }
  next();
});

export default mongoose.model("EventPackage", EventPackageSchema);
