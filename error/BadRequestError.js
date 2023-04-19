const customError = require("./custom");

module.exports = (msg) => customError(msg, 404)