import express from "express";
import { extractText } from "../controllers/ocrController";

const router = express.Router();

router.post("/get-text", extractText);

export default router;
