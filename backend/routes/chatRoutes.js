const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  listChats,
  getChat,
  createChat,
  renameChat,
  deleteChat,
  streamMessage,
} = require("../controllers/chatController");

const router = express.Router();

router.use(protect);

router.get("/", listChats);
router.post("/", createChat);
router.get("/:id", getChat);
router.patch("/:id", renameChat);
router.delete("/:id", deleteChat);
router.post("/:id/messages", streamMessage);

module.exports = router;

