const express = require('express');
const modelController = require('../controllers/ml-model.controller');

const router = express.Router();

router.get('/', modelController.getModels);
router.post('/upload', modelController.uploadData);
router.post('/fine-tune', modelController.fineTuneModel);
router.get('/fine-tunes', modelController.listFineTunes);
router.post('/completion', modelController.createCompletion);

module.exports = router;
