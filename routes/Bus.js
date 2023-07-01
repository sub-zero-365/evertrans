const router=require("express").Router();
const {
    create, deleteBus, updateBus, getBus,getAllBus
}=require("../controllers/Bus");

router.route("/").post(create).get(getAllBus)
router.route("/:id").get(getBus)
.delete(deleteBus).
patch(updateBus)


module.exports=router