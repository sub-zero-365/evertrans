const { body, validationResult, param, query } = require('express-validator');
const { TICKET_STATUS,
    TICKET_SORT_BY } = require('../utils/constants.js');
const { BadRequestError } = require("../error");

const mongoose = require("mongoose")
const User = require("../models/User")
const Ticket = require("../models/Ticket");
const Admin = require("../models/Admin.js")
const Bus = require("../models/Bus")
const dayjs = require("dayjs");
const custom = require('../error/custom.js');
function formatDate(date = new Date()) {
    const formateDate = new Date(date);
    return {
        date: formateDate.toLocaleDateString('en-ZA'),
        time: formateDate.toLocaleTimeString('en-ZA'),
    }
}
const withValidationErrors = (validateFn) => {
    return [
        validateFn,
        (req, res, next) => {
            console.log(req.query);
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                throw BadRequestError(errorMessages);
            }
            next();
        },
    ];
};

// const validateTest = withValidationErrors([
//   body('name')
//     .notEmpty()
//     .withMessage('name is required')
//     .isLength({ min: 3, max: 50 })
//     .withMessage('name must be between 3 and 50 characters long')
//     .trim(),
// ]);
const validateGetTicket = withValidationErrors([
    body('id').custom((value, { req }) => {
        console.log("8c", value)
        if (value.length === 8) {
            req.isString = true
            return true
        }
        else if (value.length === 24) {
            console.log("enter her wigasdfg")
            const bool = mongoose.Types.ObjectId.isValid(value);
            return bool
        }
        else {
            throw BadRequestError("invalid id ")
        }

    })

]

)

const validateupdateTicket = withValidationErrors([
    param('id')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('invalid MongoDB id'),
    query('index')
        .optional()
        .isIn([1, 2])
        .trim()
        .notEmpty()
        .withMessage('search value required')
    ,
])
const updateTicketMetaData = withValidationErrors([
    body("seat_id").
        notEmpty().
        withMessage("please provide a seat_id to update seat")
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('invalid MongoDB id'),


])
const busValidtionInput = withValidationErrors([
    body('name').notEmpty().
        withMessage("please provide a bus name").
        custom(async (value) => {
            const nameExist = await Bus.findOne({
                name: value
            })
            if (nameExist) throw BadRequestError("bus with name  already exist ")
            return true
        })
    ,
    body('plate_number').notEmpty().
        withMessage("please provide a bus plate number").
        isNumeric().
        withMessage("please send a numerical value").
        isLength({ min: 5 })
        .withMessage("plate number is less than  5").
        custom(async (value, { req, loc, path }) => {
            const numberExist = await Bus.findOne({
                plate_number: value
            })
            if (numberExist) throw BadRequestError("bus Plate number already exist ")
            return true
        })
    , body('number_of_seats')
        .notEmpty().
        withMessage("please provide a bus seat number").isFloat({
            min: 49,
            max: 53
        })
        .withMessage("please your bus seat number is greater 53 or less than 49")
    ,
])

const validatecreateseat = withValidationErrors([

    body("from").optional().
        isIn(["buea", "yaounde"])
        .withMessage('invalid trip type type').custom((value, { req }) => {
            if (value == req.body.to) throw BadRequestError("city names can not be thesame that is ")
            return true
        }),
    body("to").optional().
        isIn(["buea", "yaounde"])
        .withMessage('invalid trip type type').custom((value, { req }) => {
            if (value == req.body.from) throw BadRequestError("city names can not be thesame that is ")
            return true
        }),
])
const validateTicketInput = withValidationErrors([
    body('seat_id').notEmpty().
        withMessage("please provide a bus id")
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('created by invalid MongoDB id'),
    body('fullname').
        notEmpty().
        withMessage('fullname is required'),

    body("traveldate")
        .notEmpty()
        .withMessage('travel date is required')
        .custom(async (traveldate, { req }) => {
            const lettodaydate = dayjs(new Date()).format("YYYY-MM-DD");

            const ticketTravelDate = traveldate;
            // console.log("traveldate here : ", traveldate)
            // console.log("todaydate here : ", lettodaydate)
            // console.log("traveldate here : ", ticketTravelDate)
            if ((dayjs(ticketTravelDate).diff(lettodaydate, "day")) < 0) {
                throw BadRequestError(`fail cause the user is trying to back date the date`)
            }
            // req.traveldate
            return true

        }),
    body("age").
        notEmpty().withMessage("age is require bro").
        isFloat({ min: 2, max: 80 })
        .withMessage(`age is lessthan 2 or greater than 80`),
    body("sex").
        notEmpty().withMessage("sex is require bro").
        isIn(["female", "male"])
        .withMessage(`age is lessthan 2 or greater than 80`),
    body("from")
        .notEmpty()
        .withMessage("from is required please send").
        custom((value, { req, loc, path }) => {
            console.log(value, req.body.to, loc, path)
            if (value === req.body.to) throw BadRequestError("Cities should not be thesame ")
            return true
        }),
    body("seatposition")
        .notEmpty()
        .withMessage("seatposition is required please send").
        isNumeric().
        withMessage("seat position should be numerical").
        isFloat({ min: 0, max: 67 })
        .withMessage("bus sea should be in range of 0-67")
        .custom((seat, { req, loc, path }) => {
            const seatposition = Number(seat)
            if (seatposition > 53 || seatposition == NaN || seatposition < 0) throw BadRequestError("please send a valid seat position");

            if (!req.body.busType) throw BadRequestError("missing bus type ")
            if (req.body.busType && req.body.busType == "classic") {
                if (req.body.type === "round" || req.body.type === "roundtrip") {
                    req.body.price = 10000
                    return true
                }
                req.body.price = 6500
                return true
            }
            if (req.body.type === "null" || req.body.type === "singletrip") {
                if (seatposition < 20) req.body.price = 10000
                if (seatposition > 19) req.body.price = 6500
            }
            if (req.body.type === "round" || req.body.type === "roundtrip") {
                if (seatposition < 20) req.body.price = 20000
                if (seatposition > 19) req.body.price = 10000
            }
            return true
        })
    ,

    body("phone")
        .notEmpty()
        .withMessage("phone number is required please send").
        isLength({ min: 9, max: 12 })
        .withMessage('phone number must be at least 8 characters long and not greater than 12')
    ,
    body("type")
        .optional().
        isIn(["singletrip", "roundtrip"])
        .withMessage('invalid trip type type')
    ,
    body("active")
        .optional().
        isIn([true, false])
        .withMessage('invalid active type')
    ,


    // body('createdBy').notEmpty().withMessage('createdBy is required').
    // custom(async (email, { req }) => {
    //       const user = await User.findOne({ email });
    //       if (user && user._id.toString() !== req.user.userId) {
    //         throw new Error('email already exists');
    //       }
    //       return true;
    //     }),
    // body('type')
    //     // .optional()
    //     .notEmpty()
    //     .withMessage('ticket type  is required'),
    //   body('ticketStatus')
    //     .optional()
    //     .isIn(Object.values(TICKET_STATUS))
    //     .withMessage('invalid status value'),
    //   body('jobType')
    //     .optional()
    //     .isIn(Object.values(JOB_TYPE))
    //     .withMessage('invalid job type'),
    //     body("email").notEmpty()
    //     .withMessage('email is required')
    //     .isEmail()
    //     .withMessage('invalid email format')
]);

const validateIdParam = withValidationErrors([
    param('id')
        .custom((value) => {
            console.log("mongoid", value)
            return mongoose.Types.ObjectId.isValid(value)
        })
        .withMessage('invalid MongoDB id'),
]);
const validateIdBody = withValidationErrors([
    body('id')
        .custom((value) => {
            console.log("mongoid", value)
            return mongoose.Types.ObjectId.isValid(value)
        })
        .withMessage('invalid MongoDB id'),
]);
const validcreateAssistant = withValidationErrors([
    body("fullname").
        notEmpty()
        .withMessage("please name is require to create an assisstant").
        isLength({ min: 5 })
        .withMessage('username must be greater or equal to 5')
    ,
    body("password").notEmpty().withMessage("please password is required").
        isLength({ min: 8 })
        .withMessage('password must be greater or equal to 8'),

    body("phone").notEmpty().withMessage("please password is required").
        isLength({ min: 9 })
        .withMessage('phone  number must be greater  or equal to 9')
        .isNumeric().withMessage("phone isnumber not text"),
]
)
const validateUpdateUser = withValidationErrors([
    body("newpassword")
        .notEmpty().
        withMessage("newpassword is required").isLength({ min: 8 }).withMessage("new Password must be greater ").
        custom((value, { req, loc, path }) => {
            if (value != req.confirmpassword) throw BadRequestError("password does not match ")
            return true
        })

])
const validateEditTicket = withValidationErrors([
    // working here
    query('index').
        optional().
        trim()
        .isIn([1, 2])
        .withMessage('index should be 1 or 2')
    ,


]);
const validateCreateAdmin = withValidationErrors([
    body('fullname').
        notEmpty().
        withMessage("fullname should not be empty")
        .isLength({ min: 6 })
        .withMessage("fullname should not be less than 6 characters"),
    body("phone").
        notEmpty()
        .withMessage("please send a phone number").
        isLength({ min: 9, max: 12 })
        .withMessage('phone number must be at least 8 characters long and not greater than 12')
        .custom(async (value) => {
            const isUser = await Admin.findOne({phone: value});
            if (isUser) throw BadRequestError("User already exist with phone number");
            return true
        }),
    body('password')
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters long').
        custom(async (value, { req }) => {
            if (value != req.body.password2) throw BadRequestError("password doesnot match")
            return true
        }),

]
)
const validateRegisterInput = withValidationErrors([
    body('fullname').
        notEmpty().
        withMessage('name is required').
        isLength({ min: 5 })
        .withMessage('fullname  must be at least 5 characters long')
        .custom(async (fullname) => {
            const isSplitable = fullname?.split(" ").length;
            if (isSplitable === 1) throw new Error('name is too short')
            return true;
        })
    ,
    body('phone')
        .notEmpty()
        .withMessage('email is required').
        isLength({ min: 9, max: 12 })
        .withMessage('phone number must be at least 8 characters long and not greater than 12')
        .custom(async (phone) => {
            const user = await User.findOne({ phone });
            if (user) {
                throw new Error('phone number already exists');
            }
            return true;
        }),
    body('password')
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters long'),
    body("email").isEmail()
        .withMessage('invalid email format')
]);

// const validateUpdateUserInput = withValidationErrors([
//   body('name').notEmpty().withMessage('name is required'),
//   body('email')
//     .notEmpty()
//     .withMessage('email is required')
//     .isEmail()
//     .withMessage('invalid email format')
//     .custom(async (email, { req }) => {
//       const user = await User.findOne({ email });
//       if (user && user._id.toString() !== req.user.userId) {
//         throw new Error('email already exists');
//       }
//       return true;
//     }),
//   body('avatar')
//     .optional()
//     .custom((value, { req }) => {
//       const fileSize = req.file.size;
//       const maxSize = 500000; // Maximum file size in bytes
//       if (fileSize > maxSize) {
//         throw new Error('File size should be less than 500KB');
//       }

//       const fileType = req.file.mimetype;
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       if (!allowedTypes.includes(fileType)) {
//         throw new Error('File type not allowed');
//       }

//       return true;
//     }),
//   body('lastName').notEmpty().withMessage('last name is required'),
//   body('location').notEmpty().withMessage('location is required'),
// ]);

// const validateLoginInput = withValidationErrors([
//   body('email')
//     .notEmpty()
//     .withMessage('email is required')
//     .isEmail()
//     .withMessage('invalid email format'),
//   body('password').notEmpty().withMessage('password is required'),
// ]);

// const validateGetAllJobsParams = withValidationErrors([
//   query('search')
//     .optional()
//     .trim()
//     .notEmpty()
//     .withMessage('search value required')
//     .isString()
//     .withMessage('search value must be a string'),
//   query('jobStatus')
//     .optional()
//     .isIn(['all', ...Object.values(JOB_STATUS)])
//     .withMessage('invalid job status'),
//   query('jobType')
//     .optional()
//     .isIn(['all', ...Object.values(JOB_TYPE)])
//     .withMessage('invalid job type'),
//   query('sort')
//     .optional()
//     .isIn([...Object.values(JOB_SORT_BY)])
//     .withMessage('invalid sort value'),
//   query('page').optional().isInt({ min: 1 }).withMessage('invalid page value'),
// ]);

module.exports = {
    validateTicketInput,
    validateIdParam,
    validateRegisterInput,
    validateupdateTicket,
    validateEditTicket,
    busValidtionInput,
    validcreateAssistant,
    validateUpdateUser,
    validateIdBody,
    validateGetTicket, validatecreateseat,validateCreateAdmin
};