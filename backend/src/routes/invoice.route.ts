import express, { Router } from "express";
import * as invoiceController from "../controllers/invoice.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import { upload } from "../utils/multer";

import { validateZod } from "../middlewares/validationzod";
import { invoiceIdParamSchema } from "../validations/invoice.validation";

const router: Router = express.Router();

// User gets their invoices
router.route("/").get(
  AuthMiddleware.isAuthenticated,
  invoiceController.getMyInvoices
);

// User uploads QR payment proof
router.route("/:id/upload-payment").post(
  AuthMiddleware.isAuthenticated,
  validateZod(invoiceIdParamSchema),
  upload.single("receipt"),
  invoiceController.uploadPaymentProof
);

export default router;
