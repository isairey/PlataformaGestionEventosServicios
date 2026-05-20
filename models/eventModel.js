import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Event type is required"],
      enum: [
        "Wedding",
        "Birthday",
        "Corporate",
        "Anniversary",
        "Graduation",
        "Other",
      ],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      start: {
        type: String,
        required: [true, "Start time is required"],
      },
      end: {
        type: String,
        required: [true, "End time is required"],
      },
    },
    venue: {
      type: mongoose.Types.ObjectId,
      ref: "EventVenue",
      required: [true, "Venue is required"],
    },
    package: {
      type: mongoose.Types.ObjectId,
      ref: "EventPackage",
    },
    client: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Client information is required"],
    },
    guests: {
      count: {
        type: Number,
        required: [true, "Guest count is required"],
        min: [1, "Minimum one guest required"],
      },
      list: [
        {
          name: String,
          email: String,
          phone: String,
          status: {
            type: String,
            enum: ["pending", "confirmed", "declined"],
            default: "pending",
          },
        },
      ],
    },
    services: {
      decoration: {
        type: mongoose.Types.ObjectId,
        ref: "Decoration",
      },
      photographer: {
        type: mongoose.Types.ObjectId,
        ref: "Photographer",
      },
      musicalGroup: {
        type: mongoose.Types.ObjectId,
        ref: "MusicalGroup",
      },
    },
    staff: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Staff",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    totalCost: {
      type: Number,
      required: true,
    },
    payment: {
      status: {
        type: String,
        enum: ["pending", "partial", "completed"],
        default: "pending",
      },
      amount: {
        type: Number,
        default: 0,
      },
      history: [
        {
          amount: Number,
          date: Date,
          method: String,
          status: String,
          transactionId: String,
        },
      ],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
eventSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "eventId",
});

// Pre-save middleware to validate dates
eventSchema.pre("save", function (next) {
  if (this.date < new Date()) {
    const err = new Error("Event date cannot be in the past");
    next(err);
  }
  next();
});

export default mongoose.model("Event", eventSchema);
