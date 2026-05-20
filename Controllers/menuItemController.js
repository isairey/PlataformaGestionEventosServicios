import MenuItem from "../models/MenuItemModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createMenuItem = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

    // Convert ingredients and dietaryInfo to arrays if they're strings
    if (typeof req.body.ingredients === "string") {
      req.body.ingredients = req.body.ingredients
        .split(",")
        .map((item) => item.trim());
    }
    if (typeof req.body.dietaryInfo === "string") {
      req.body.dietaryInfo = req.body.dietaryInfo
        .split(",")
        .map((item) => item.trim());
    }

    // Handle image upload
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    const menuItem = await MenuItem.create(req.body);
    res.status(StatusCodes.CREATED).json({
      msg: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    // If something goes wrong and we uploaded a file, clean it up
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create menu item",
      error: error.message,
    });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({}).sort("-createdAt");
    res.status(StatusCodes.OK).json({ menuItems });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.find({ category }).sort("-createdAt");
    res.status(StatusCodes.OK).json({ menuItems });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Convert ingredients and dietaryInfo to arrays if they're strings
    if (typeof req.body.ingredients === "string") {
      req.body.ingredients = req.body.ingredients
        .split(",")
        .map((item) => item.trim());
    }
    if (typeof req.body.dietaryInfo === "string") {
      req.body.dietaryInfo = req.body.dietaryInfo
        .split(",")
        .map((item) => item.trim());
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      throw new NotFoundError("Menu item not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Menu item updated successfully",
      menuItem: updatedItem,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update menu item",
      error: error.message,
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }

    res.status(StatusCodes.OK).json({ msg: "Menu item deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete menu item",
      error: error.message,
    });
  }
};
