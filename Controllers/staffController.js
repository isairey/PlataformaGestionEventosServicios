import Staff from "../models/staffModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//--------------------- create staff member ---------------------------
export const createStaff = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

    // Handle image upload if present
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    // Create the staff member
    const staff = await Staff.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: "Staff member created successfully",
      staff,
    });
  } catch (error) {
    // If something goes wrong and we uploaded a file, clean it up
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create staff member",
      error: error.message,
    });
  }
};

//--------------------- get all staff members ---------------------------
export const getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find({}).sort("-createdAt");
    res.status(StatusCodes.OK).json({ staffList });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch staff members",
      error: error.message,
    });
  }
};

//--------------------- get staff member by Id ---------------------------
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);

    if (!staff) {
      throw new NotFoundError("Staff member not found");
    }

    res.status(StatusCodes.OK).json({ staff });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch staff member",
      error: error.message,
    });
  }
};

//--------------------- update staff member by Id ---------------------------
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle image upload if present
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    // Update the staff member
    const updatedStaff = await Staff.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStaff) {
      throw new NotFoundError("Staff member not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Staff member updated successfully",
      staff: updatedStaff,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update staff member",
      error: error.message,
    });
  }
};

//--------------------- delete staff member by Id ---------------------------
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndDelete(id);

    if (!staff) {
      throw new NotFoundError("Staff member not found");
    }

    res.status(StatusCodes.OK).json({ msg: "Staff member deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete staff member",
      error: error.message,
    });
  }
};
