import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import Event from "../models/eventModel.js";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";
import { Decoration, Photographer, MusicalGroup } from "../models/index.js";

// Create Event
export const createEvent = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const event = await Event.create(req.body);
  res.status(StatusCodes.CREATED).json({ event });
};

// Get All Events (Admin)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("venue", "name location")
      .populate("package", "name pricePerPerson")
      .populate("client", "name email")
      .populate({
        path: "services.decoration",
        model: Decoration,
        select: "name",
      })
      .populate({
        path: "services.photographer",
        model: Photographer,
        select: "fullName",
      })
      .populate({
        path: "services.musicalGroup",
        model: MusicalGroup,
        select: "name",
      })
      .sort("-createdAt");

    console.log("Found events:", events);

    if (!events) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "No events found" });
    }

    res.status(StatusCodes.OK).json({ events, count: events.length });
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error fetching events",
      error: error.message,
    });
  }
};

// Get Single Event
export const getSingleEvent = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("venue", "name location")
    .populate("package", "name pricePerPerson")
    .populate("client", "fullName email")
    .populate("services.decoration", "name")
    .populate("services.photographer", "fullName")
    .populate("services.musicalGroup", "name")
    .populate("staff", "fullName role")
    .populate({
      path: "reviews",
      populate: { path: "user", select: "fullName" },
    });

  if (!event) {
    throw new NotFoundError(`No event with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ event });
};

// Update Event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    throw new NotFoundError(`No event with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ event });
};

// Delete Event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByIdAndDelete(id);

  if (!event) {
    throw new NotFoundError(`No event with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ msg: "Event deleted successfully" });
};

// Get User Events
export const getUserEvents = async (req, res) => {
  try {
    console.log("User ID:", req.user.userId);

    const events = await Event.find({ client: req.user.userId })
      .populate("venue", "name location")
      .populate("package", "name pricePerPerson")
      .populate({
        path: "services.decoration",
        model: Decoration,
        select: "name",
      })
      .populate({
        path: "services.photographer",
        model: Photographer,
        select: "fullName",
      })
      .populate({
        path: "services.musicalGroup",
        model: MusicalGroup,
        select: "name",
      })
      .sort("-createdAt");

    console.log("Found events:", events);

    if (!events) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "No events found" });
    }

    res.status(StatusCodes.OK).json({ events, count: events.length });
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error fetching events",
      error: error.message,
    });
  }
};

// Update Event Status
export const updateEventStatus = async (req, res) => {
  const { id: eventId } = req.params;
  const { status } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { new: true, runValidators: true }
    );

    if (!event) {
      throw new NotFoundError(`No event with id ${eventId}`);
    }

    res.status(StatusCodes.OK).json({ event });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};
