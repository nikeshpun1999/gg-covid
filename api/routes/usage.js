const express = require('express');
const router = express.Router();
const controller = require('../controllers/UsageController');


router.post('/getusagehistory', controller.getusagehistory);
router.post('/registerusage', controller.registerusage);

module.exports = router;