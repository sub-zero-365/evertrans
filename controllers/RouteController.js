const Route = require("../models/RouteModel");
const { BadRequestError,
    NotFoundError } = require("../error");
const isUserNotRestricted = require("../middlewares/IsUserRestricted");
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
    const { id: _id } = req.params;

    const updateRouter = await Route.findOneAndUpdate({
        _id
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
    const { from, to } = req.query;
    console.log("this is the req.query here", req.query)
    const queryObject = {}
    if (from && to) {
        queryObject.from = from
        queryObject.to = to
    }
    const routes = await Route.find(queryObject)
    res.status(200).json({ routes, nHits: routes.length })
}
const getStaticRoute = async (req, res) => {
    const { id: _id } = req.params
    const route = await Route.find({ _id });
    if (!route) throw NotFoundError("not route with id ")
    res.status(200).json({ route })
}
const getRoute = async (req, res, next) => {
    
    const { from, to } = req.query
    console.log("this is the req ", req.query)
    if (!from || !to) throw BadRequestError("please provide a from and a to cause its needed");
    const queryObject = {
        from: { $regex: decodeURIComponent(from).split("+").join(" ").trim(), $options: "i" },
        to: { $regex: decodeURIComponent(to).split("+").join(" ").trim(), $options: "i" },
    }
    const route = await Route.findOne(queryObject);
    if (!route) throw NotFoundError(`No route found with search query from=${from} to=${to}, an admin can be contacted to create one`)
    res.status(200).json({
        route
    })
}
module.exports = {
    createRoutes,
    updateRoutes,
    getAllRoutes,
    deleteRoutes,
    getStaticRoute,
    getRoute
}