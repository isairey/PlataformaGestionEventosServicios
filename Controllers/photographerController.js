import { StatusCodes } from "http-status-codes";
import Photographer from "../models/PhotographerModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------- add photographer -------------------------------
export const addPhotographer = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, experience, availability } = req.body;
    const photo = req.file ? path.join("uploads", req.file.filename) : "uploads/default-avatar.png";

    const existingPhotographer = await Photographer.findOne({ email });
    if (existingPhotographer) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Photographer with this email already exists" });
    }

    const photographer = new Photographer({
      fullName,
      email,
      phoneNumber,
      experience,
      availability,
      image: photo,
    });

    await photographer.save();
    res.status(StatusCodes.CREATED).json({ msg: "Photographer added successfully", photographer });
  } catch (error) {
    console.error("Error adding photographer:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error adding photographer", error: error.message });
  }
};

// ----------------------- fetch all photographers -------------------------------
export const getAllPhotographers = async (req, res) => {
    try {
      const photographers = await Photographer.find(); // Fetch all photographers
      res.status(StatusCodes.OK).json({ photographers });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Error retrieving photographers",
        error: error.message,
      });
    }
};

// ----------------------- delete photographer by ID -------------------------------
export const deletePhotographer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the photographer by ID
    const photographer = await Photographer.findById(id);
    if (!photographer) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Photographer not found" });
    }

    // Delete the image file from the server (if not using a default avatar)
    if (photographer.image && photographer.image !== "uploads/default-avatar.png") {
      const imagePath = path.join(__dirname, "..", photographer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Remove the image file
      }
    }

    // Remove photographer from the database
    await Photographer.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({ msg: "Photographer deleted successfully" });
  } catch (error) {
    console.error("Error deleting photographer:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      msg: "Error deleting photographer", 
      error: error.message 
    });
  }
};

// ----------------------- Update Photographer -------------------------------
export const updatePhotographer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, experience, availability } = req.body;

    // Find the existing photographer
    let photographer = await Photographer.findById(id);
    if (!photographer) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Photographer not found" });
    }

    // Handle image update
    let updatedImage = photographer.image; // Keep the existing image by default
    if (req.file) {
      updatedImage = path.join("uploads", req.file.filename);

      // Delete old image if it's not the default
      if (photographer.image !== "uploads/default-avatar.png") {
        const oldImagePath = path.join(__dirname, "..", photographer.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Update photographer details
    photographer.fullName = fullName || photographer.fullName;
    photographer.email = email || photographer.email;
    photographer.phoneNumber = phoneNumber || photographer.phoneNumber;
    photographer.experience = experience || photographer.experience;
    photographer.availability = availability ?? photographer.availability; // Keep existing value if not provided
    photographer.image = updatedImage;

    // Save updated photographer
    await photographer.save();

    res.status(StatusCodes.OK).json({ msg: "Photographer updated successfully", photographer });
  } catch (error) {
    console.error("Error updating photographer:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error updating photographer", error: error.message });
  }
};

