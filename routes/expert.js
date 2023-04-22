// routes/expert.routes.js

const express = require("express");
const router = express.Router();
const expertController = require("../controllers/expert.controller");
const { requireAuth } = require("../middlewares/authMiddleware");

// Define routes for creating, deleting, and managing experts
router.post("/", requireAuth, expertController.createExpert);
router.get("/", requireAuth, expertController.getExperts);
router.get("/:id", requireAuth, expertController.getExpert);
router.put("/:id", requireAuth, expertController.updateExpert);
router.delete("/:id", requireAuth, expertController.deleteExpert);

module.exports = router;
