const router = require("express").Router()
const { addCity,
    getCitys,
    updateCity,
    removeCity, } = require("../controllers/City");
router.route("/").get(getCitys)
    .post(addCity)
    router.route("/:id").delete(removeCity).patch(updateCity)
// router.route("u")
module.exports = router