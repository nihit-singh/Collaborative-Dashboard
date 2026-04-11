import express from "express";
import { saveBoard, loadBoard } from "../controllers/boardController.js";

const router = express.Router();

router.post("/save", saveBoard);
router.get("/:roomCode", loadBoard);

export default router;