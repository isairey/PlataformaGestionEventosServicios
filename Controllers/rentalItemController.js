import RentalItem from "../models/rentalItemModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//--------------------- Create Rental Item ---------------------------
export const createRentalItem = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

    // Handle image upload if present
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    // Create the rental item
    const rentalItem = await RentalItem.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: "Rental item created successfully",
      rentalItem,
    });
  } catch (error) {
    // Clean up uploaded file if creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create rental item",
      error: error.message,
    });
  }
};

//--------------------- Get All Rental Items ---------------------------
export const getAllRentalItems = async (req, res) => {
  try {
    const rentalItems = await RentalItem.find({}).sort("-createdAt");
    res.status(StatusCodes.OK).json({ rentalItems });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch rental items",
      error: error.message,
    });
  }
};

//--------------------- Get Rental Item by ID ---------------------------
export const getRentalItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const rentalItem = await RentalItem.findById(id);

    if (!rentalItem) {
      throw new NotFoundError("Rental item not found");
    }

    res.status(StatusCodes.OK).json({ rentalItem });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch rental item",
      error: error.message,
    });
  }
};

//--------------------- Update Rental Item by ID ---------------------------
export const updateRentalItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle image upload if present
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    // Update the rental item
    const updatedRentalItem = await RentalItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRentalItem) {
      throw new NotFoundError("Rental item not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Rental item updated successfully",
      rentalItem: updatedRentalItem,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update rental item",
      error: error.message,
    });
  }
};

//--------------------- Delete Rental Item by ID ---------------------------
export const deleteRentalItem = async (req, res) => {
  try {
    const { id } = req.params;
    const rentalItem = await RentalItem.findByIdAndDelete(id);

    if (!rentalItem) {
      throw new NotFoundError("Rental item not found");
    }

    // Optionally, delete the associated image file
    if (rentalItem.image) {
      const imagePath = path.join(__dirname, "..", rentalItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(StatusCodes.OK).json({ msg: "Rental item deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete rental item",
      error: error.message,
    });
  }
};