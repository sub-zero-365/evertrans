
const {
    BadRequestError,
    NotFoundError
} = require("../error");
const Assistant = require("../models/Assistant")

const getStaticAssistant = async (req, res) => {
    const assistant = await Assistant.findOne({ _id: req.params.id });
    if (!assistant) throw NotFoundError(`No Assistant with id  ${req.params.id}`)
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
module.exports = {
    GetAllAssistant,
    DeleteAssistant,
    getStaticAssistant
}