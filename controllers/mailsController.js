const qrcode = require("qrcode");
const path = require("path")
// const checkPermissions = require("../utils/checkPermission")
const fs = require("fs")
const { PDFDocument, degrees, StandardFonts, rgb } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
const User = require("../models/User")
const { BadRequestError, NotFoundError } = require("../error");
const Mail = require("../models/MailsModel")
const { formatImage } = require("../utils/multerMiddleware")
const cloudinary = require('cloudinary');
const { StatusCodes } = require("http-status-codes")
const { USER_ROLES_STATUS } = require("../utils/constants");

// import mongoose from 'mongoose';
// import day from 'dayjs';
const day = require("dayjs")

const mongoose = require("mongoose")
const createMail = async (req, res) => {
    // const newMail = { ...req.body };
    req.body.createdBy = req?.user?.userId

    // console.log("req.file", req.body)

    if (req.file) {
        // console.log("this i sthe file here", req.file)
        const file = formatImage(req.file);
        const response = await cloudinary.v2.uploader.upload(file);
        req.body.imgUrl = response.secure_url;
        req.body.avatarPublicId = response.public_id;
    }
    await Mail.create(req.body)
    // const updatedMail = await Mail.findByIdAndUpdate(req.Mail.MailId, newMail);

    // if (req.file && updatedMail.avatarPublicId) {
    //     await cloudinary.v2.uploader.destroy(updatedMail.avatarPublicId);
    // }

    res.status(StatusCodes.OK).json({ msg: 'update Mail' });
}
const getRankUsersMails = async (req, res) => {
    const { quickdatesort, search, numberFilter } = req.query
    const queryObject = {}

    if (search) {
        // console.log(decodeURIComponent(search).split("+").join(" "))
        queryObject.$or = [
            {
                senderfullname: {
                    $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
                }
            },

        ]

    }
    // if (quickdatesort) {
    //     queryObject.createdAt = {
    //         $gte: new Date(quickdatesort),
    //         // $lte: getPreviousDay(new Date(endDate.end)),
    //     }


    // }
    console.log("this i quick date sort", quickdatesort,
        queryObject, req.query)
    const uniqueNumbers = await Mail.distinct("phone", queryObject)
    const rankUsers = await Mail.aggregate([
        //   {
        //     $addFields: {
        //       customerPhone: {
        //         $toString: "$phone"
        //       }
        //     }
        //   }
        //   ,
        {

            $match: {
                ...queryObject
            }
        }, {
            $group: {
                _id: "$senderphonenumber",
                //   sum: { $sum: "$price" },
                total: { $sum: 1 },
                senderfullname: {
                    $first: "$senderfullname"
                },
                senderphonenumber: {
                    $first: "$senderphonenumber"
                },
                senderidcardnumber: {
                    $first: "$senderidcardnumber"
                },

                //    reciever information here
                recieverfullname: {
                    $first: "$recieverfullname"
                },
                recieverphonenumber: {
                    $first: "$recieverphonenumber"
                },
                recieveridcardnumber: {
                    $first: "$recieveridcardnumber"
                },

            }
        },
        {
            $project: {
                total: 1,
                senderfullname: 1,
                senderphonenumber: 1,
                senderidcardnumber: 1,
                recieverfullname: 1,
                recieverphonenumber: 1,
                recieveridcardnumber: 1,

            }
        },
        { $sort: { total: -1 } }]).limit(10)
    console.log("this is the most ranked users of all times ", rankUsers)
    res.status(200).json({
        rankUsers,
        nHits: uniqueNumbers.length
    })

}

const getStaticMail = async (req, res, next) => {
    const id = req.params.id
    const queryObject = {}
    let isString = req.isString || false;
    console.log("isString", isString)
    if (!id) throw BadRequestError("no id")
    if (req.isString) {
        if (id) {
            queryObject.id = id?.trim()

        }


    } else {
        if (id) {
            queryObject.$expr = {
                $eq: ['$_id', { $toObjectId: id }]
            }
        }
    }


    const mail = await Mail.findOne({ ...queryObject })
    if (!mail) throw BadRequestError("couldnot find mail with id " + id)
    const createdBy = (await User.findOne({ _id: mail.createdBy }).select("fullname"))?.fullname || "n/a";
    const mailWithCreatedBy = {
        ...mail.toJSON(),
        doneby: createdBy

    }
    res.status(StatusCodes.OK).json({ mail: mailWithCreatedBy })
}
const getUsersAllMails = async (req, res) => {
    // const { userId: requestedUserId } = req.user;
    const { userId, role } = req?.user;
    const requestedUserId = userId
    const {
        search,
        createdBy,
        sort,
        mailStatus,
        daterange,
        quickdatesort

    }
        =
        req.query;
    const queryObject = {


    }
    if (![USER_ROLES_STATUS.admin, USER_ROLES_STATUS.sub_admin]
        .some(user_role => user_role.includes(role))) {
        queryObject.createdBy = new mongoose.Types.ObjectId(requestedUserId)

    }
    // get all the meals created by the user ;

    // queryObject
    // if (createdBy) {
    // }

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
    if (mailStatus && mailStatus != "all") {
        //check for the mail status 
        queryObject.status = {
            $regex: decodeURIComponent(mailStatus).split("+").join(" ").trim(), $options: "i"
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
    const mails = await Mail.find(queryObject)
        .sort(sortKey)
        .skip(skip)
        .limit(limit);
    console.log("this is quick date sort here",
        queryObject, createdBy)

    const nDoc = await Mail.countDocuments(queryObject);

    var statuses = (await Mail.aggregate([
        {
            $match: {
                ...queryObject,
            }
        }, {
            $group: {
                _id: "$status",
                sum: { $sum: "$price" },
                total: { $sum: 1 },
            }
        }, {
            $project: {
                sum: 1,
                total: 1,
                _id: 1,
                percentage: {
                    $cond: [
                        { $eq: [nDoc, 0] }, 1, {
                            $multiply: [
                                { $divide: [100, nDoc || 1] }, "$total"
                            ]
                        }],

                }
            }
        }]
    ))?.sort((a, b) => b._id - a._id);

    const obj = {}
    statuses?.map((status) => {
        obj[status._id] = status
    })
    const totalMailsSum = (obj?.pending?.sum || 0) +
        (obj?.sent?.sum || 0) +
        (obj?.recieved?.sum || 0)
    const totalSentMails = (obj?.sent?.total || 0)
    const totalPendingMails = (obj?.pending?.total || 0)
    const totalRecievedMails = (obj?.recieved?.total || 0)
    const sentMailsPercentage = obj?.sent?.percentage || 0
    const recievedMailsPercentage = obj?.recieved?.percentage || 0
    const pendingMailsPercentage = obj?.pending?.percentage || 0
    const pendingSum = obj?.pending?.sum || 0
    const sentSum = obj?.sent?.sum || 0
    const recievedSum = obj?.recieved?.sum || 0
    const numberOfPages = Math.ceil(nDoc / limit)
    const total_mails = totalSentMails + totalRecievedMails + totalPendingMails
    // console.log("this is the statuses ",statuses, {
    //     // mails,
    //     nHits: mails.length,
    //     totalMailsSum,
    //     totalSentMails,
    //     totalPendingMails,
    //     totalRecievedMails,
    //     sentMailsPercentage,
    //     pendingMailsPercentage,
    //     recievedMailsPercentage,
    //     pendingSum,
    //     sentSum,
    //     recievedSum
    // })
    res.status(StatusCodes.OK).json({
        mails,
        nHits: mails.length,
        total_mails,
        totalMailsSum,
        totalSentMails,
        totalPendingMails,
        totalRecievedMails,
        sentMailsPercentage,
        pendingMailsPercentage,
        recievedMailsPercentage,
        pendingSum,
        sentSum,
        recievedSum,
        currentPage: page,
        numberOfPages

    })

}

const downloadsoftcopy = async (req, res) => {
    const id = req.params.id;
    const mail = await Mail.findOne({
        _id: id,
    });
    if (!mail) {
        throw BadRequestError("please send a valid for to get the mail");
    }
    let url = null;
    if (process.env.NODE_ENV === "production") {
        url = `${process.env.clientBaseUrl}/assistant/mail/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`
    } else {
        url = `http://192.168.43.68:3000/assistant/mail/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`

    }
    // const _path = path.resolvem(__dirname, "../mails")

    const _path = path.resolve(__dirname, "../tickets")
    const createdBy = (await User.findOne({ _id: mail.createdBy }).select("fullname"))?.fullname || "n/a";
    qrcode.toFile(path.join(_path, "qr2.png"),
        url, {
        type: "terminal",
        size: 4
    }, async function (err, code) {
        if (err) return console.log(err)
        try {
            const pdfDoc = await PDFDocument.load(await readFile(path.resolve(__dirname, "../tickets", "mailtemplate-1.pdf")));
            const page = pdfDoc.getPage(0)
            const { width, height } = page.getSize()

            const fileNames = pdfDoc.getForm().getFields().map(f => f.getName())
            console.log(fileNames)
            const form = pdfDoc.getForm()
            const { name,
                from,
                to,
                _id, id,
                senderfullname,
                senderphonenumber,
                senderidcardnumber,
                recieverfullname,
                recieverphonenumber,
                estimatedprice,createdAt

            } =
                mail.toJSON()
            try {
                // console.log(fileNames)
                form.getTextField("product_name").
                    setText(name)
                form.getTextField("registered_time").
                    setText("")
                form.getTextField("registered_date").
                    setText(day(createdAt).format("M/D/YYYY"))
                form.getTextField("from").
                    setText(from)
                form.getTextField("to").
                    setText(`${to}`)
                form.getTextField("senderfullname").
                    setText(`${senderfullname || "n/a"}`)
                form.getTextField("senderidcardnumber").
                    setText(`${senderidcardnumber || "n/a"}`)
                form.getTextField("senderphonenumber").
                    setText(`${senderphonenumber || "n/a"}`)
                form.getTextField("recieverfullname").
                    setText(`${recieverfullname || "n/a"}`)
                form.getTextField("recieverphonenumber").
                    setText(`${recieverphonenumber || "n/a"}`)
                form.getTextField("registered_time").
                    setText(`${"textfield here" || "n/a"}`)
                form.getTextField("registered_time").
                    setText(`${"time here" || "n/a"}`)
                form.getTextField("estimated_price").
                    setText(`${estimatedprice || 0} frs`)
                form.getTextField("done_by").
                    setText(`${createdBy || "n/a"}`)

                const fontSize = 40
                page.drawText(`${id || _id}`, {
                    x: width - 30,
                    y: (height / 2) - (fontSize * 8) / 2,
                    size: fontSize,
                    color: rgb(0, 1, 0),
                    rotate: degrees(90)
                })
                form.flatten()
            } catch (err) {
                console.log(err)
            }

            let img = fs.readFileSync(path.join(_path, "qr2.png"));
            let logo = fs.readFileSync(path.join(_path, "logo.png"))
            img = await pdfDoc.embedPng(img)
            logo = await pdfDoc.embedPng(logo)
            img.scaleToFit(100, 100)
            img.scale(1)
            logo.scaleToFit(100, 100)
            logo.scale(1)
            page.drawImage(img, {
                x: (width / 2) - 155,
                y: height - 500,
                width: 310,
                height: 310
            })



            const pdfBytes = await pdfDoc.save()
            await writeFile(path.join(_path, Mail._id + ".pdf"), pdfBytes);
            await res.sendFile(path.join(_path, Mail._id + ".pdf"),
                null,
                function (err) {
                    res.end()
                    if (err) {
                        console.log(err)
                    }
                    else {
                        if (fs.existsSync(path.join(_path, "qr2.png")) && fs.existsSync(path.join(_path, Mail._id + ".pdf"))) {
                            try {
                                fs.unlinkSync(path.join(_path, "qr2.png"));
                                fs.unlinkSync(path.join(_path, Mail._id + ".pdf"));
                            }
                            catch (err) {
                                console.lg(err)
                            }
                        }
                    }

                })
        }
        catch (err) {
            console.log(err)
        }

    })
}
const editMail = async (req, res) => {
    const status = req.body.status || ""
    // const requestUserId = req?.user?.userId;
    const requestedUser = await User.findOne({ _id: req?.user?.userId })
    if (!requestedUser) {
        throw BadRequestError("fail to find user")
    }
    const {
        fullname,
        _id: user_id
    } = requestedUser;
    let mail = null
    if (status == "sent") {
        // if the mail doesnt belongs to the creator of the mail..
        // throw an error
        const requestUserId = req?.user?.userId;
        mail = requestUserId && await Mail.findOne({
            _id: req.params.id,
            createdBy: requestUserId
        })
        if (!mail) throw BadRequestError("You can only mark sent to the items you create !!!")

    }
    if (status == "recieved") {
        // the creator of the mail cant mark the mail are recieved ..
        // throw an error
        const requestUserId = req?.user?.userId;
        mail = requestUserId && await Mail.findOne({
            _id: req.params.id,
            createdBy: requestUserId
        })
        if (mail) throw BadRequestError("You cant mark recieved on mails your created !!")

    }
    const previousMail = await Mail.findOne({
        _id: req.params.id,
    })

    if (!previousMail) throw BadRequestError("No mail with id " + req.params.id)
    const { status: previousMailStatus } = previousMail || {}
    mail = await Mail.findOneAndUpdate({ _id: req.params.id }, {
        $set: {
            status: req.body.status
        },
        $push: {
            editedBy: {
                full_name: fullname,
                user_id,
                date: new Date(),
                action: ` ${fullname} edited mail status from to  ${previousMailStatus} ---  to  ${status}`
            }
        }
    })
    // if (!mail) throw NotFoundError("No mail with id")
    res.status(200).json({ msg: "success" })

}
const showStats = async (req, res) => {

    let stats = await Mail.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user?.userId) } },
        { $group: { _id: '$mailStatus', count: { $sum: 1 } } },
    ]);
    console.log("this is the user query here ,", stats)

    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
    }, {});
    console.log("this is the reduce stat here", stats)

    const defaultStats = {
        pending: stats.pending || 0,
        sent: stats.sent || 0,
        recieved: stats.recieved || 0,
    };

    let monthlyApplications = await Mail.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user?.userId) } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
    ]);
    console.log("this  multiplication stats here", monthlyApplications)

    monthlyApplications = monthlyApplications
        .map((item) => {
            const {
                _id: { year, month },
                count,
            } = item;

            const date = day()
                .month(month - 1)
                .year(year)
                .format('MMM YY');

            return { date, count };
        })
        .reverse();
    console.log("this is the multiplicatio data here", monthlyApplications)

    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
module.exports = {
    createMail,
    getStaticMail,
    getAllMeals: getUsersAllMails,
     downloadsoftcopy, editMail,
    showStats,
    getRankUsersMails
}
