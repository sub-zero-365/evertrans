
const {
    BadRequestError,
    NotFoundError
} = require("../error");
const Assistant = require("../models/Assistant")

const getStaticAssistant = async (req, res) => {
    if ( !req.user) throw BadRequestError("Permission denied!!");
    
    const id = req.user.id
    const assistant = await Assistant.findOne({ _id: id });
    if (!assistant) throw NotFoundError(`No Assistant with id  ${id}`)
    res.status(200).json({ assistant })
}
const GetAllAssistant = async (req, res) => {
    const assistants = await Assistant.find({})
    res.status(200).json({
        assistants,
        nHits: assistants.length
    })
}
const DeleteAssistant = async (req, res) => {
    const assistant = await Assistant.findOneAndDelete({ _id: req.params.id });
    if (!assistant) throw NotFoundError(`Fail to delete assistant with id ${req.params.id}`)
    res.status(200).json({ assistant })
}

const updatePassword = async (req, res) => {
    const { oldpassword, newpassword, confirmpassword } = req.body;
    if (newpassword !== confirmpassword) throw BadRequestError("password doesnot match ");
    if (newpassword.length < 7) throw BadRequestError("Password must be greater or equal to 8")
    let assistant = await Assistant.findOne({
        _id: req.user.id,
        password: oldpassword
    })

    if (!assistant) throw BadRequestError("Incorrect Password");
    assistant = await Assistant.findOneAndUpdate({
        _id: req.user.id,

    }, { password: newpassword }, { runValidators: true, new: true })
    if (!assistant) throw BadRequestError("fail to updatepassword")
    res.status(200).json({ status: true });

}

module.exports = {
    GetAllAssistant,
    DeleteAssistant,
    getStaticAssistant,
    updatePassword
}