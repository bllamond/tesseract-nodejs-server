const express = require('express');
const router = express.Router();
const { getTextFromBase64, getBoundingBoxes } = require('../controllers/ocrController');

router.post('/get-text', getTextFromBase64);
// router.post('/get-bboxes', getBoundingBoxes);

module.exports = router;
