const express = require('express');
const router = express.Router();
const controller = require('../controllers/HelplineController');

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

router.post('/registerhelpline',upload.single('helplinelogo'), controller.registerhelpline);
router.post('/gethelplinesapp', controller.getallhelplineapp);
router.post('/gethelplines', controller.getallhelpline);
router.post('/deletehelpline', controller.deletehelpline);
router.post('/updatehelpline', controller.updatehelpline);

module.exports = router;