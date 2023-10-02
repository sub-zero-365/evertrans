// import multer from 'multer';
// import DataParser from 'datauri/parser.js';
// import path from 'path';
const multer = require("multer")
const DataParser = require("datauri/parser")
const path = require("path")
const storage = multer.memoryStorage();

const upload = multer({ storage });

const parser = new DataParser();
const formatImage = (file) => {
    const fileExtension = path.extname(file.originalname).toString();
    return parser.format(fileExtension, file.buffer).content;
};

// export default upload;

module.exports = {
    formatImage, upload
}
