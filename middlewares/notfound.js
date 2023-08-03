module.exports = notfound = async (req, res, next) => {
    res.status(404).send("OOPS ROUTE DOESNOT EXIST ")
}