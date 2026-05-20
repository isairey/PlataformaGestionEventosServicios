import "express-async-errors";

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// routers
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import photographerRouter from "./routes/photographerRouter.js";
import menuItemRouter from "./routes/menuItemRouter.js";
import eventPackageRouter from "./routes/eventPackageRouter.js";
import musicalGroupRouter from "./routes/musicalGroupRouter.js";
import staffRouter from "./routes/staffRouter.js";
import reviewRouter from "./routes/reviewRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import rentalItemRoutes from "./routes/rentalItemRoutes.js"
import eventVenueRouter from "./routes/eventVenueRouter.js";
import eventDecorationRouter from "./routes/eventDecorationRouter.js";
//public
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

//middleware
import errorHandelerMiddleware from "./middleware/errorHandelerMiddleware.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

const PORT = process.env.PORT || 5100;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(path.resolve(__dirname, "./Client/dist")));
app.use(cookieParser());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/v1/test", (req, res) => {
  res.json({ msg: "Test route" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticateUser, userRouter);

app.use("/api/v1/photographers", photographerRouter);


app.use("/api/v1/users/admin/update-user/:id", authenticateUser, userRouter);
app.use("/api/v1/users/admin/add-user", authenticateUser, userRouter);
app.use("/api/v1/menu-items", menuItemRouter);
app.use("/api/v1/event-packages", authenticateUser, eventPackageRouter);
app.use("/api/v1/musical-group", musicalGroupRouter);
app.use("/api/v1/admin/staf", authenticateUser, staffRouter);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/rent",authenticateUser,rentalItemRoutes);
app.use("/api/v1/venues", eventVenueRouter);
app.use("/api/v1/decorations", authenticateUser, eventDecorationRouter);
app.use('/api/v1/reviews', reviewRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./Client/dist", "index.html"));
});

app.use("*", (req, res) => {
  res.status(404).json({ msg: "route not found" });
});

app.use(errorHandelerMiddleware);

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
