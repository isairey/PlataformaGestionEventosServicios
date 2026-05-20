import { StatusCodes } from "http-status-codes";
import Review from "../models/reviewModel.js";
import Event from "../models/eventModel.js";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";

// Create Review
export const createReview = async (req, res) => {
  const { eventId } = req.body;
  const { userId } = req.user;

  // Check if user has already reviewed this event
  const existingReview = await Review.findOne({ user: userId, eventId });
  if (existingReview) {
    throw new BadRequestError("You have already reviewed this event");
  }

  // Create review with user ID
  req.body.user = userId;
  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

// Get All Reviews (Public)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('user', 'fullName avatar')
      .populate('eventId', 'title')
      .sort('-createdAt')
      .limit(9); // Optional: limit the number of reviews shown

    res.status(StatusCodes.OK).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error fetching reviews',
      error: error.message,
    });
  }
};

// Get Single Review
export const getSingleReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "fullName")
    .populate("eventId", "title");

  if (!review) {
    throw new NotFoundError(`No review found with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

// Update Review
export const updateReview = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  const review = await Review.findById(id);
  if (!review) {
    throw new NotFoundError(`No review found with id ${id}`);
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== userId && role !== "admin") {
    throw new UnauthorizedError("Not authorized to update this review");
  }

  const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ review: updatedReview });
};

// Delete Review
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  const review = await Review.findById(id);
  if (!review) {
    throw new NotFoundError(`No review found with id ${id}`);
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== userId && role !== "admin") {
    throw new UnauthorizedError("Not authorized to delete this review");
  }

  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Review deleted successfully" });
};

// Get Reviews by Event
export const getEventReviews = async (req, res) => {
  const { eventId } = req.params;

  const reviews = await Review.find({ eventId })
    .populate("user", "fullName")
    .sort("-createdAt");

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user.userId })
    .populate('eventId', 'title')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ reviews });
};
