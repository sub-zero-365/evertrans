const Route = require("../models/Routes");
const { BadRequestError, NotFoundError } = require("../error")
const Bus = require("../models/Bus")
const createRoutes = async (req, res) => {
    const { from, to } = req.body
    const isRoute = await Route.findOne({ from, to });
    if (isRoute) throw BadRequestError("routes already exist")
    const route = await Route.create(req.body);
    if (!route) {
        throw BadRequestError("fail to create route")
    }
    res.status(200)
        .json({ status: true })
}
const updateRoutes = async (req, res) => {
    const updateRouter = await Route.findOneAndUpdate({

    }, { ...req.body })
    if (!updateRouter) {

        throw BadRequestError("fai; tp update routes")
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
    // const { getbuses } = req.query
    // const getNextDay = (date = new Date()) => {
    //     const next = new Date(date.getTime());
    //     next.setDate(date.getDate() + 1);
    //     return next.toLocaleDateString("en-CA")
    // }

    // const { from, to, date, time } = req.query;
    // const queryObject = {}
    // if (date) {
    //     var date_ = {
    //         $gte: new Date(date).toLocaleDateString("en-CA"),
    //         $lte: getNextDay(new Date(date)),
    //     }
    //     queryObject.departuredate = date_
    // }

    // if (from) {
    //     queryObject.from = {
    //         $regex: from, $options: "i"
    //     }

    // }
    // if (to) {
    //     queryObject.to = {
    //         $regex: to, $options: "i"
    //     }
    // }
    // const routes = await Route.find(queryObject);
    // // console.log("this is routes", routes) 
    // if (getbuses) {
    //     const _ids = (await Route.
    //         find(queryObject)
    //         .select({ "bus_id": 1, _id: 0 }))
    //         .map(({ bus_id }) => bus_id);
    //     console.log(_ids)
    //     const buses = await Bus.find({
    //         _id: {
    //             $in: [..._ids]
    //         },
    //         active: true
    //     })
    //     const agb = await Bus.aggregate([
    //         {
    //             $match: {
    //                 _id: {
    //                     $in: [..._ids]
    //                 }
    //             }
    //         },
    //         {
    //             $project: {
    //                 name: 1
    //             }
    //         }


    //     ])
    //     console.log("abg", agb)

    // console.log("bus vs route", buses.length, routes.length)
    //     res.status(200).json({ nHits: routes.length, routes, buses })
    //     return
    // }

    // res.status(200).json({ nHits: routes.length, routes })

    // const { from, to } = req.body;
    const { from, to } = req.query
    let routes;
    // routes = await Route.findOne({ from, to })
    // if (!routes) throw BadRequestError("routes is found")
    routes = await Route.find({});
    res.status(200).json({ routes })


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