
const {createContact,getAllContact,getContact} =require("../controllers/Contact")
const Auth=require("../middlewares/Admin.auth")
const express = require("express")
const router = express.Router()
router.route("/").post(createContact).get(Auth,getAllContact)
router.route("/:id").get(Auth,getContact)
module.exports=router


