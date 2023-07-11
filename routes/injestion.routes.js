const express = require('express');
const injestionController = require('../controllers/injestion.controller');

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/injest', upload.single("file"), injestionController.initiateInjection);

router.post('/injest-web', injestionController.initiateWebInjestion);

module.exports = router;
