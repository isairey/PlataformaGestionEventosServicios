import EventDecoration from "../models/EventDecorationModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createDecoration = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    req.body.createdBy = req.user.userId;

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) =>
        path.join("uploads", file.filename)
      );
    }

    const decoration = await EventDecoration.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: "Decoration package created successfully",
      decoration,
    });
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create decoration package",
      error: error.message,
    });
  }
};

export const getAllDecorations = async (req, res) => {
  try {
    const decorations = await EventDecoration.find({})
      .populate("createdBy", "name email role")
      .populate("reviews.user", "name")
      .sort("-createdAt");
    res.status(StatusCodes.OK).json({ decorations });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch decorations",
      error: error.message,
    });
  }
};

export const getDecorationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const decorations = await EventDecoration.find({ type })
      .populate("createdBy", "name email role")
      .populate("reviews.user", "name")
      .sort("-createdAt");
    res.status(StatusCodes.OK).json({ decorations });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch decorations",
      error: error.message,
    });
  }
};

export const updateDecoration = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      // Delete old images
      const currentDecoration = await EventDecoration.findById(id);
      if (currentDecoration.images) {
        currentDecoration.images.forEach((image) => {
          if (
            image !== "uploads/default-decoration.png" &&
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

    const updatedDecoration = await EventDecoration.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email role")
      .populate("reviews.user", "name");

    if (!updatedDecoration) {
      throw new NotFoundError("Decoration package not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Decoration package updated successfully",
      decoration: updatedDecoration,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update decoration package",
      error: error.message,
    });
  }
};

export const deleteDecoration = async (req, res) => {
  try {
    const { id } = req.params;

    const decoration = await EventDecoration.findById(id);
    if (!decoration) {
      throw new NotFoundError("Decoration package not found");
    }

    // Delete associated images
    if (decoration.images) {
      decoration.images.forEach((image) => {
        if (
          image !== "uploads/default-decoration.png" &&
          fs.existsSync(path.join(__dirname, "..", image))
        ) {
          fs.unlinkSync(path.join(__dirname, "..", image));
        }
      });
    }

    await EventDecoration.findByIdAndDelete(id);
    res
      .status(StatusCodes.OK)
      .json({ msg: "Decoration package deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete decoration package",
      error: error.message,
    });
  }
};

export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const decoration = await EventDecoration.findById(id);
    if (!decoration) {
      throw new NotFoundError("Decoration package not found");
    }

    // Check if user has already reviewed
    const existingReview = decoration.reviews.find(
      (review) => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "You have already reviewed this decoration package",
      });
    }

    // Handle review images
    let reviewImages = [];
    if (req.files && req.files.length > 0) {
      reviewImages = req.files.map((file) =>
        path.join("uploads", file.filename)
      );
    }

    decoration.reviews.push({
      user: req.user.userId,
      rating,
      comment,
      images: reviewImages,
    });

    await decoration.save();
    res.status(StatusCodes.OK).json({
      msg: "Review added successfully",
      decoration,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to add review",
      error: error.message,
    });
  }
};
