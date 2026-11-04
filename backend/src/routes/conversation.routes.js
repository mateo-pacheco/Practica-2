import { Router } from "express";
import {
  create,
  list,
  listHistory,
  sendMessage,
} from "../controllers/conversation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.post("/", create);
router.get("/", list);
router.get("/:id/messages", listHistory);
router.post("/:id/messages", sendMessage);

export default router;
