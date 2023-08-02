module.exports = async(error, req, res, next) => {
    // console.log(error)
    res.status(error.statuscode || 500).send(error.message)
}