import MusicalGroup from "../models/MusicalGroupModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//--------------------- create musical group ---------------------------
export const createMusicalGroup = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

     // Convert ingredients and dietaryInfo to arrays if they're strings
     if (typeof req.body.members === "string") {
      req.body.members = req.body.members
        .split(",")
        .map((item) => item.trim());
    }

    // Handle image upload
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    // Create the musical group
    const musicalGroup = await MusicalGroup.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: "Musical group created successfully",
      musicalGroup,
    });
  } catch (error) {
    // If something goes wrong and we uploaded a file, clean it up
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create musical group",
      error: error.message,
    });
  }
};

//--------------------- get all musical group ---------------------------
export const getAllMusicalGroups = async (req, res) => {
  try {
    const musicalGroups = await MusicalGroup.find({}).sort("-createdAt");
    res.status(StatusCodes.OK).json({ musicalGroups });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch musical groups",
      error: error.message,
    });
  }
};

//--------------------- get musical group by Id ---------------------------
export const getMusicalGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const musicalGroup = await MusicalGroup.findById(id);

    if (!musicalGroup) {
      throw new NotFoundError("Musical group not found");
    }

    res.status(StatusCodes.OK).json({ musicalGroup });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch musical group",
      error: error.message,
    });
  }
};

//--------------------- update musical group by Id ---------------------------
export const updateMusicalGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle image upload if present
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    // Update the musical group
    const updatedGroup = await MusicalGroup.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedGroup) {
      throw new NotFoundError("Musical group not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Musical group updated successfully",
      musicalGroup: updatedGroup,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update musical group",
      error: error.message,
    });
  }
};

//--------------------- delete musical group by Id ---------------------------
export const deleteMusicalGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const musicalGroup = await MusicalGroup.findByIdAndDelete(id);

    if (!musicalGroup) {
      throw new NotFoundError("Musical group not found");
    }

    res.status(StatusCodes.OK).json({ msg: "Musical group deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete musical group",
      error: error.message,
    });
  }
};
