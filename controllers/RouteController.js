const Route = require("../models/RouteModel");
const { BadRequestError,
    NotFoundError } = require("../error")
// 
const createRoutes = async (req, res) => {
    const { from, to } = req.body
    const isRoute = await Route.findOne({ from, to });
    if (isRoute) throw BadRequestError("routes already exist")
    const route = await Route.create(req.body);
    if (!route) {
        throw BadRequestError("oops fail to create route")
    }
    res.status(200)
        .json({ status: true })
}
const updateRoutes = async (req, res) => {
    const updateRouter = await Route.findOneAndUpdate({
    }, { ...req.body })
    if (!updateRouter) {
        throw BadRequestError("fail; to update routes")
    }
    res.status(200).json({
        route: updateRouter
    })

}
const deleteRoutes = async (req, res) => {
    const { id: _id } = req.params;
    const deleteroute = await Route.findOneAndDelete({
        _id
    })
    if (!deleteroute) {
        throw BadRequestError("fail to delete route")
    }
    res.status(201).json({ status: true })

}
const getAllRoutes = async (req, res) => {
    const routes = await Route.find({})
    res.status(200).json({ routes, nHits: routes.length })
}
const getStaticRoute = async (req, res) => {
    const { id: _id } = req.params
    const route = await Route.find({ _id });
    if (!route) throw NotFoundError("not route with id ")
    res.status(200).json({ route })
}
module.exports = {
    createRoutes,
    updateRoutes,
    getAllRoutes,
    deleteRoutes,
    getStaticRoute
}