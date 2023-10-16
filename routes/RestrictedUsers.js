const {
    addRestrictedUsers,
    removeRestrictedUsers,
    getRestrictedUsers,
    getStaticRestrictedUsers

} = require("../controllers/Restricted");
const express = require("express")
const router = express.Router()
router.route("/").
    post(addRestrictedUsers)
    .get(getRestrictedUsers)
router
    .route("/:id")
    .delete(removeRestrictedUsers)
    .get(getStaticRestrictedUsers)
module.exports = router
