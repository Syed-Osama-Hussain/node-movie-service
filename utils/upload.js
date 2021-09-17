const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
    const [name, extension] = file.originalname.split(".");
      cb(null, `${name}-${Date.now()}.${extension}`);
    }
  })
   
exports.upload = multer({ storage: storage });