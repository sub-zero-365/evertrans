const router = require("express").Router()
// this the user auth here 
const {authenticateUser} = require("../middlewares/Auth.User")
const { recieptsPermission } = require("../utils/ticketPermission")

// this is the api end points to the reciept router
const {
    createReciept,
    getReciepts,
    getSingleReciept } = require("../controllers/RecieptController");
// using the authenticateUser checks and verify the token , 
// recieptspermission check if the  current user is loggged in as  restaurant employee 
// if not it throw an unethicated error which mean invalid request to the server
router.route("/new").
    post(authenticateUser, recieptsPermission,
        createReciept)

router.route("/").get(authenticateUser, getReciepts)
router.route("/:id").get(
    authenticateUser
    , getSingleReciept)

module.exports = router