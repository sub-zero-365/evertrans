const qrcode = require("qrcode");
const path = require("path")
// const checkPermissions = require("../utils/checkPermission")
const fs = require("fs")
const { PDFDocument, degrees, StandardFonts, rgb } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
const User = require("../models/User")
const { BadRequestError } = require("../error");
const Mail = require("../models/MailsModel")
const { formatImage } = require("../utils/multerMiddleware")
const cloudinary = require('cloudinary');
const { StatusCodes } = require("http-status-codes")
// import mongoose from 'mongoose';
const mongoose = require("mongoose")
const createMail = async (req, res) => {
    // const newMail = { ...req.body };
    req.body.createdBy = req?.userInfo?._id

    console.log("req.file", req.body)

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
const getStaticMail = async (req, res, next) => {
    const id = req.params.id
    const mail = await Mail.findOne({ _id: id })
    if (!mail) throw BadRequestError("couldnot find mail with id " + id)
    res.status(StatusCodes.OK).json({ mail })
}
const getAllMails = async (req, res) => {
    const {
        productname,
        createdBy,
        sort,
        mailStatus,
        daterange,
        boardingRange,
        traveltime,
        senderphone
    }
        =
        req.query;
    const queryObject = {}
    if (createdBy) {
        queryObject.createdBy = new mongoose.Types.ObjectId(createdBy)
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
    if (productname) {
        // if the user passes the product name
        queryObject.name =
        {
            $regex: productname, $options: "i"
        }
    }
    if (mailStatus && mailStatus != "all") {
        //check for the mail status 
        queryObject.collected = mailStatus
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

    res.status(StatusCodes.OK).json({ mails })

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
        url = `https://ntaribotaken.vercel.app/assistant/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`
    } else {
        url = `http://192.168.43.68:3000/assistant/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`

    }
    const _path = path.resolve(__dirname, "../mails")

    const createdBy = (await User.findOne({ _id: Mail.createdBy }).select("fullname"))?.fullname;
    qrcode.toFile(path.join(_path, "qr2.png"),
        url, {
        type: "terminal",
        size: 4
    }, async function (err, code) {
        if (err) return console.log(err)
        try {
            const pdfDoc = await PDFDocument.load(await readFile(path.resolve(__dirname, "../mails", "sampleMail.pdf")));
            const page = pdfDoc.getPage(0)
            const { width, height } = page.getSize()

            // const fileNames = pdfDoc.getForm().getFields().map(f => f.getName())
            const form = pdfDoc.getForm()
            const { fullname, traveldate, traveltime, seatposition, from, to, type, _id, id, bus, price, updatePrice } = Mail.toJSON()
            try {
                // console.log(fileNames)
                form.getTextField("fullname").
                    setText(fullname)
                form.getTextField("traveldate").
                    setText(formatDate(traveldate).date)
                form.getTextField("seatposition").
                    setText(`${seatposition + 1}`)
                form.getTextField("createdby").
                    setText(createdBy)
                form.getTextField("traveltime").
                    setText(traveltime)
                form.getTextField("from").
                    setText(from)
                form.getTextField("to").
                    setText(to)
                form.getTextField("price").
                    setText(`${price + (updatePrice ? updatePrice : 0)} frs`)
                if (type == "singletrip") {
                    form.getTextField("triptype").
                        setText(`singletrip`)
                }
                if (type == "roundtrip") {
                    form.getTextField("triptype").
                        setText(`roundtrip`)
                }
                const fontSize = 40
                page.drawText(`${id ? id : _id}`, {
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
                y: height - 340,
                width: 310,
                height: 310
            })
            // page.drawImage(logo, {
            //   x: (width / 2) - 155,
            //   y: height - 140,
            //   width: 310,
            //   height: 310
            // })


            const pdfBytes = await pdfDoc.save()
            await writeFile(path.join(_path, Mail._id + ".pdf"), pdfBytes);
            await res.sendFile(path.join(_path, Mail._id + ".pdf"),
                null,
                function (err) {
                    res.end()
                    if (err) {
                        console.log(err, "391 mail download")

                        // throw err
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

module.exports = {
    createMail,
    getStaticMail,
    getAllMeals: getAllMails, downloadsoftcopy
}
