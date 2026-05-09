import express, { Router } from "express";
import * as publicBookingController from "../controllers/publicBooking.controller";
import { upload } from "../utils/multer";

const router: Router = express.Router();

// PUBLIC: Anyone can submit a repair request (with optional images)
router.route("/").post(
  upload.array("images", 5),
  publicBookingController.createPublicBooking
);

export default router;
