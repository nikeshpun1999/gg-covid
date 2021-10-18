const express = require('express');
const router = express.Router();
const controller = require('../controllers/PanicController');





//jwt verified 

router.post('/checkpanic', controller.checkpanic);
router.post('/registerpanic', controller.registerpanic);
router.post('/updatepanic', controller.updatepanic);

router.post('/getallpanic', controller.getallpanic);

module.exports = router;