import mongoose from "mongoose";

const EventDecorationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide decoration package name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      required: [true, "Please provide decoration description"],
      trim: true,
      maxlength: 1000,
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
    theme: {
      type: String,
      required: [true, "Please provide decoration theme"],
      trim: true,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    pricePerDay: {
      type: Number,
      required: [true, "Please provide price per day"],
      min: 0,
    },
    setupTime: {
      type: Number, // in hours
      required: [true, "Please provide setup time"],
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: ["uploads/default-decoration.png"],
    },
    colorScheme: {
      primary: {
        type: String,
        required: [true, "Please provide primary color"],
      },
      secondary: {
        type: String,
        default: "",
      },
      accent: {
        type: String,
        default: "",
      },
    },
    dimensions: {
      minSpace: {
        type: String, // in square feet
        required: [true, "Please provide minimum space requirement"],
        min: 0,
      },
      maxSpace: {
        type: String, // in square feet
        default: 0,
      },
    },
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      unavailableDates: [
        {
          startDate: Date,
          endDate: Date,
          reason: String,
        },
      ],
    },
    specialRequirements: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        images: {
          type: [String],
          default: [],
        },
      },
    ],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Calculate average rating when reviews are modified
EventDecorationSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    this.rating =
      this.reviews.reduce((sum, review) => sum + review.rating, 0) /
      this.reviews.length;
  }
  next();
});

// Validate space dimensions
EventDecorationSchema.pre("save", function (next) {
  if (
    this.dimensions.maxSpace > 0 &&
    this.dimensions.maxSpace < this.dimensions.minSpace
  ) {
    next(
      new Error("Maximum space must be greater than or equal to minimum space")
    );
  }
  next();
});

// Validate unavailable dates
EventDecorationSchema.pre("save", function (next) {
  this.availability.unavailableDates.forEach((date) => {
    if (date.endDate < date.startDate) {
      next(new Error("End date must be greater than or equal to start date"));
    }
  });
  next();
});

export default mongoose.model("EventDecoration", EventDecorationSchema);
