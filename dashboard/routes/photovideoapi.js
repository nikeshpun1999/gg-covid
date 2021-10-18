const express = require('express');
const router = express.Router();
const controller = require('../controllers/PhotovideoController');

const multer = require('multer');
const path = require('path');

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {

        cb(null, file.fieldname + '_' + Date.now() + getRandomArbitrary(10, 99) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        ext = ext.split('.').pop().toLocaleLowerCase()
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg' && ext !== 'mp4') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
});
//jwt validation complete
//tested and listed in postman

router.post('/deletephotovideo', controller.deletephotovideo)
router.post('/updatephotovideo', controller.updatephotovideo)
router.post('/getphotovideos', controller.getallphotovideos)
router.post('/getphotovideobyid', controller.getphotovideobyid)
router.post('/registerphotovideo', upload.array("photovideo"), controller.registerphotovideo)


module.exports = router;