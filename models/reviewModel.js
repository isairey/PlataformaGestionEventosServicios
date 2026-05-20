import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a review comment"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    eventId: {
      type: mongoose.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    replies: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Update ratings after saving review
reviewSchema.post("save", async function () {
  const Review = this.constructor;

  // Calculate average rating for event
  const eventRatings = await Review.aggregate([
    { $match: { eventId: this.eventId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  // Update event rating
  await mongoose
    .model("Event")
    .findByIdAndUpdate(this.eventId, {
      rating: eventRatings[0]?.avgRating || 0,
    });
});

export default mongoose.model("Review", reviewSchema);
