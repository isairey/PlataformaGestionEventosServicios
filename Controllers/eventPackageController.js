import EventPackage from "../models/EventPackageModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createEventPackage = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

    // Handle image upload
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    const eventPackage = await EventPackage.create(req.body);
    res.status(StatusCodes.CREATED).json({
      msg: "Event package created successfully",
      eventPackage,
    });
  } catch (error) {
    // If something goes wrong and we uploaded a file, clean it up
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create event package",
      error: error.message,
    });
  }
};

export const getAllEventPackages = async (req, res) => {
  try {
    const eventPackages = await EventPackage.find({})
      .populate("menuItems")
      .populate("createdBy", "name email role")
      .sort("-createdAt");
    res.status(StatusCodes.OK).json({ eventPackages });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch event packages",
      error: error.message,
    });
  }
};

export const getEventPackagesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const eventPackages = await EventPackage.find({ type })
      .populate("menuItems")
      .populate("createdBy", "name email role")
      .sort("-createdAt");
    res.status(StatusCodes.OK).json({ eventPackages });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch event packages",
      error: error.message,
    });
  }
};

export const updateEventPackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle image upload
    if (req.file) {
      // Delete old image if it exists and it's not the default
      const currentPackage = await EventPackage.findById(id);
      if (
        currentPackage.image &&
        currentPackage.image !== "uploads/default-package.png" &&
        fs.existsSync(path.join(__dirname, "..", currentPackage.image))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", currentPackage.image));
      }
      req.body.image = path.join("uploads", req.file.filename);
    }

    const updatedPackage = await EventPackage.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("menuItems");

    if (!updatedPackage) {
      throw new NotFoundError("Event package not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Event package updated successfully",
      eventPackage: updatedPackage,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update event package",
      error: error.message,
    });
  }
};

export const deleteEventPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const eventPackage = await EventPackage.findById(id);
    if (!eventPackage) {
      throw new NotFoundError("Event package not found");
    }

    // Delete the image if it exists and it's not the default
    if (
      eventPackage.image &&
      eventPackage.image !== "uploads/default-package.png" &&
      fs.existsSync(path.join(__dirname, "..", eventPackage.image))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", eventPackage.image));
    }

    await EventPackage.findByIdAndDelete(id);
    res
      .status(StatusCodes.OK)
      .json({ msg: "Event package deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete event package",
      error: error.message,
    });
  }
};
