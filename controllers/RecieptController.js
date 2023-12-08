
const { UnethenticatedError, NotFoundError, BadRequestError } = require("../error")

const Reciept = require("../models/Reciept")
const createReciept = async (req, res) => {
    if (!req.body?.items) throw BadRequestError("no items sent");
    req.body.products = req.body.items;
    delete req.body.items
    req.body.createdBy = req.userInfo._id;
    req.body.quantity = req.body.products.length;
    let price = 0
    for (let i = 0; i < req.body.products.length; ++i) {
        let _price = req.body.products[i].price || 0
        let count = req.body.products[i].total || 0
        price += count * _price
    }
    req.body.total_price = price
    const reciept = await Reciept.create({
        ...req.body
    })


    // if(!reciept) throw BadRequestError("fail to cr")

    console.log(req.body, "this is the request body reciepts")
    res.send({ status: true, id: reciept?._id })
}
const getReciepts = async (req, res) => {
    const {
        search,
        createdBy,
        sort,
        daterange,
        quickdatesort
    }
        =
        req.query;
    const queryObject = {}
    if (createdBy) {
        queryObject.createdBy = new mongoose.Types.ObjectId(createdBy)
    }
    if (search) {
        // console.log(decodeURIComponent(search).split("+").join(" "))
        queryObject.$or = [
            {
                name: {
                    $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
                }
            },
            {
                senderfullname: {
                    $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
                }
            },
            {
                recieverfullname: {
                    $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
                }
            },


        ]

    }
    // this check for hte roduct ame
    if (daterange) {
        const decoded = decodeURIComponent(daterange)
        const [startdate, endDate] = decoded.
            split(",").
            map(arr => arr.split("="))
            .map(([v, t]) => {
                return {
                    [v]: t
                }
            });

        if ("start" in startdate && "end" in endDate) {
            const getPreviousDay = (date) => {
                const previous = new Date(date.getTime());
                previous.setDate(date.getDate() + 1);
                return previous
            }
            if (startdate.start != "null" && endDate.end != "null") {
                try {
                    var createdAt = {
                        $gte: new Date(startdate.start),
                        $lte: getPreviousDay(new Date(endDate.end)),
                    }
                    queryObject.createdAt = createdAt

                } catch (err) {
                    console.log(err)
                }


            }
            if (startdate.start != "null" && endDate.end == "null") {

                var createdAt = {
                    $gte: new Date(startdate.start),
                    $lte: getPreviousDay(new Date(startdate.start)),
                }
                queryObject.createdAt = createdAt
            }
        }

    }
    if (quickdatesort) {
        queryObject.createdAt = {
            // $gte: quickdatesort,
            $gte: new Date(quickdatesort),
        }
    }
    const sortOptions = {
        newest: "-createdAt",
        oldest: "createdAt",
    }
    const sortKey = sortOptions[sort] || sortOptions.newest;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const reciepts = await Reciept.find(queryObject)
        .sort(sortKey)
        .skip(skip)
        .limit(limit);
    console.log("this is quick date sort here",
        queryObject, createdBy)
    const nDoc = await Reciept.countDocuments(queryObject);
    const numberOfPages = Math.ceil(nDoc / limit);
    res.send({
        reciepts,
        nHits: reciepts.length,
        numberOfPages
    })
}
const getSingleReciept = async (req, res) => {
    const { params: {
        id
    }, userInfo: {
        _id: requestedUserId
    } } = req;
    console.log("this is the id here",id)
    
    const reciept = await Reciept.findOne({
        _id: id,
        createdBy: requestedUserId
    })
    if (!reciept) {
        throw NotFoundError(`reciept with id is not found ${id} `)
    }
    res.send({ reciept }).status(200)
}
const updateReciept = async (req, res) => {

    res.send("this is an update reciepts  route here")
}
const deleteReciept = async (req, res) => {
    res.send("this is the delete route here ")
}
module.exports = {
    createReciept,
    getReciepts,
    updateReciept,
    deleteReciept,
    getSingleReciept
}