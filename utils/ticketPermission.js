const { UnethenticatedError } = require("../error")
const ticketPermission = async (req, res, next) => {
    const requester = req.userInfo.role === "tickets";
    if (!requester) throw UnethenticatedError("unauthorised to visit this route,only for tickets users");
    next()
}
const mailsPermission = async (req, res, next) => {
    const requester = req.userInfo.role === "mails";
    if (!requester) throw UnethenticatedError("unauthorised to visit this route,onl");
    next()
}
const mailsOrticketPermission = async (req, res, next) => {
    const requester = req.userInfo.role === "mails" || req.userInfo.role === "scanner";
    if (!requester) throw UnethenticatedError("unauthorised to visit this route");
    next()
}
module.exports = {
    ticketPermission,
    mailsPermission,
    mailsOrticketPermission
}