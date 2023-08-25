const Block = require("../models/BlockAdmin");

const addnewblockuser = async (req, res) => {
    let id = req.body.id;
    const isFirstAccount = (await Admin.countDocuments()) === 0;
    if (isFirstAccount) await Block.create({});
    const isUserBlock = await Block.findOne({
        "block_ids._id": id
    })
    // if(!isUserBlock) await
    


}
const getblockuser = async (req, res) => {
    let id = req.params.id;
    id = new mongoose.Types.ObjectId(id);
    const isUser = await Block.find({
        "block_ids._id": id
    })
}
