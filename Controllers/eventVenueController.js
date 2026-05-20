import EventVenue from "../models/EventVenueModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createVenue = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) =>
        path.join("uploads", file.filename)
      );
    }

    const venue = await EventVenue.create(req.body);
    res.status(StatusCodes.CREATED).json({
      msg: "Venue created successfully",
      venue,
    });
  } catch (error) {
    // If something goes wrong and we uploaded files, clean them up
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create venue",
      error: error.message,
    });
  }
};

export const getAllVenues = async (req, res) => {
  try {
    const venues = await EventVenue.find({})
      .populate("createdBy", "name email role")
      .populate("reviews.user", "name")
      .sort("-createdAt");
    res.status(StatusCodes.OK).json({ venues });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch venues",
      error: error.message,
    });
  }
};

export const getVenuesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const venues = await EventVenue.find({ availableFor: type })
      .populate("createdBy", "name email role")
      .populate("reviews.user", "name")
      .sort("-createdAt");
    res.status(StatusCodes.OK).json({ venues });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch venues",
      error: error.message,
    });
  }
};

export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      // Delete old images if they exist and they're not the default
      const currentVenue = await EventVenue.findById(id);
      if (currentVenue.images) {
        currentVenue.images.forEach((image) => {
          if (
            image !== "uploads/default-venue.png" &&
            fs.existsSync(path.join(__dirname, "..", image))
          ) {
            fs.unlinkSync(path.join(__dirname, "..", image));
          }
        });
      }
      req.body.images = req.files.map((file) =>
        path.join("uploads", file.filename)
      );
    }

    const updatedVenue = await EventVenue.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email role")
      .populate("reviews.user", "name");

    if (!updatedVenue) {
      throw new NotFoundError("Venue not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Venue updated successfully",
      venue: updatedVenue,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update venue",
      error: error.message,
    });
  }
};

export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await EventVenue.findById(id);
    if (!venue) {
      throw new NotFoundError("Venue not found");
    }

    // Delete associated images
    if (venue.images) {
      venue.images.forEach((image) => {
        if (
          image !== "uploads/default-venue.png" &&
          fs.existsSync(path.join(__dirname, "..", image))
        ) {
          fs.unlinkSync(path.join(__dirname, "..", image));
        }
      });
    }

    await EventVenue.findByIdAndDelete(id);
    res.status(StatusCodes.OK).json({ msg: "Venue deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete venue",
      error: error.message,
    });
  }
};

export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const venue = await EventVenue.findById(id);
    if (!venue) {
      throw new NotFoundError("Venue not found");
    }

    // Check if user has already reviewed
    const existingReview = venue.reviews.find(
      (review) => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "You have already reviewed this venue",
      });
    }

    venue.reviews.push({
      user: req.user.userId,
      rating,
      comment,
    });

    await venue.save();
    res.status(StatusCodes.OK).json({
      msg: "Review added successfully",
      venue,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to add review",
      error: error.message,
    });
  }
};
