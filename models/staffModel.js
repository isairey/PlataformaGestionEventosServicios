import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide phone number"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    role: {
      type: String,
      required: [true, "Please provide staff role"],
      enum: ["Event Manager", "Photography Infomation Manager", "Event Orgernizer", "Financial Officer","Entertainment Manager", "Other"],
    },
    experience: {
      type: Number,
      required: [true, "Please provide years of experience"],
      min: 0,
      max: 99,
    },
    salary: {
      type: Number,
      required: [true, "Please provide salary amount"],
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Remove sensitive fields from JSON responses
StaffSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model("Staff", StaffSchema);
