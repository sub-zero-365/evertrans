const express = require("express");
const router = express.Router();
const {
    getAlluser,
    uniqueUsers
} = require("../controllers/User");
router.get("/allusers", getAlluser);
router.get("/unique/:search", uniqueUsers)


module.exports = router