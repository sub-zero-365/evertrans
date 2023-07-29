const router = require("express").Router();
const userauth=require("../middlewares/Auth.User")
const {updatePassword}=require("../controllers/User")
router.route("/updatepassword").post(userauth,updatePassword)
module.exports=router
