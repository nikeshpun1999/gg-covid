const express = require('express');
const router = express.Router();
const controller = require('../controllers/CheckupController');


router.post('/registercheckup', controller.registercheckup);

module.exports = router;