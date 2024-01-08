const { UnethenticatedError } = require("../error")
const ticketPermission = async (req, res, next) => {
    console.log("thisi is the user role here", req.userInfo)
    const requester = req.userInfo.role === "tickets";
    if (!requester) throw UnethenticatedError("unauthorised to visit this route,only for tickets users");
    next()
}
const mailsPermission = async (req, res, next) => {
    if (req?.admin) return next();
    const requester = req.userInfo.role === "mails";
    if (!requester) throw UnethenticatedError("unauthorised to visit this route please login again");
    next()
}
const mailsOrticketPermission = async (req, res, next) => {
    const requester = req.userInfo.role === "mails" || req.userInfo.role === "scanner";
    if (!requester) throw UnethenticatedError("unauthorised to visit this route");
    next()
}
const recieptsPermission = async (req, res, next) => {
    const requester = req.userInfo.role === "restaurants";
    if (!requester) throw UnethenticatedError("unauthorised please login as restaurants user to create reciepts");
    next()
}
module.exports = {
    ticketPermission,
    mailsPermission,
    mailsOrticketPermission,
    recieptsPermission
}