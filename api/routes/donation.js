const express = require('express');
const router = express.Router();
const controller = require('../controllers/DonationController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {

        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        ext = ext.split('.').pop().toLocaleLowerCase()

        if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
});

router.post('/updatedonation', controller.updatedonation);
router.post('/getdonations',  controller.getalldonations);
router.post('/donate', upload.single('voucher'), controller.registerdonation);

module.exports = router;