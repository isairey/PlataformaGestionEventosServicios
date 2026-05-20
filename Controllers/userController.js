import { StatusCodes } from "http-status-codes";
import User from "../models/UserModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Package from "../models/EventPackageModel.js";
import MenuItem from "../models/MenuItemModel.js";
import Decoration from "../models/EventDecorationModel.js";
import Photographer from "../models/PhotographerModel.js";
import Venue from "../models/EventVenueModel.js";
import MusicalGroup from "../models/MusicalGroupModel.js";
import Staff from "../models/staffModel.js";
import Event from "../models/eventModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ user });
};

export const getApplicationStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const packages = await Package.countDocuments();
    const menuItems = await MenuItem.countDocuments();
    const photographers = await Photographer.countDocuments();
    const venues = await Venue.countDocuments();
    const decorations = await Decoration.countDocuments();
    const musicalGroup = await MusicalGroup.countDocuments();
    const staff = await Staff.countDocuments();
    const orders = await Event.countDocuments();

    res.status(StatusCodes.OK).json({
      stats: {
        users,
        packages,
        menuItems,
        photographers,
        venues,
        musicalGroup,
        staff,
        decorations,
        orders,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error fetching application stats",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const obj = { ...req.body };
    delete obj.password; // Don't allow password updates through this route

    // Handle role updates - only admin can update roles
    if (obj.role) {
      if (req.user.role !== "admin") {
        delete obj.role; // Remove role from update if user is not admin
      } else {
        // Validate role value even for admin
        if (!["user", "admin", "organizer"].includes(obj.role)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            msg: "Invalid role specified",
          });
        }
      }
    }

    // Handle file upload
    if (req.file) {
      // Delete old avatar if it exists and it's not the default
      const currentUser = await User.findById(req.user.userId);
      if (
        currentUser.avatar &&
        currentUser.avatar !== "uploads/default-avatar.png" &&
        fs.existsSync(path.join(__dirname, "..", currentUser.avatar))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", currentUser.avatar));
      }

      // Save new avatar path
      obj.avatar = path.join("uploads", req.file.filename);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, obj, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    res.status(StatusCodes.OK).json({
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // If something goes wrong and we uploaded a file, clean it up
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error updating user",
      error: error.message,
    });
  }
};

// Controller to get all users
export const getAllUsers = async (req, res) => {
  try {
    // Query all users from the database
    const users = await User.find();

    // Return users in the response
    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    // Return error if something goes wrong
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to retrieve users",
      error: error.message,
    });
  }
};

// Controller to delete a user
export const deleteUser = async (req, res) => {
  try {
    // Check if user is trying to delete their own account
    if (req.params.id === req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "You cannot delete your own account",
      });
    }

    // Find the user first to check their role
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    // Prevent deletion of admin users
    if (userToDelete.role === "admin") {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "Admin accounts cannot be deleted",
      });
    }

    // Delete user and their avatar
    if (
      userToDelete.avatar &&
      fs.existsSync(path.join(__dirname, "..", userToDelete.avatar))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", userToDelete.avatar));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(StatusCodes.OK).json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to delete user",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params; // Get the user ID from the request parameters

  try {
    // Query the user by ID from the database
    const user = await User.findById(id);

    // Check if the user was found
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    // Return user details in the response
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    // Return error if something goes wrong (e.g., invalid ID format)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to retrieve user",
      error: error.message,
    });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error updating user",
      error: error.message,
    });
  }
};

export const adminAddUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, location, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      location,
      role: role || "user", // Default to 'user' if role not specified
    });

    // Remove password from response
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    res.status(StatusCodes.CREATED).json({
      msg: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error creating user",
      error: error.message,
    });
  }
};
