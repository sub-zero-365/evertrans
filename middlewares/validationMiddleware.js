const { body, validationResult, param, query } = require('express-validator');
const { TICKET_STATUS,
    TICKET_SORT_BY } = require('../utils/constants.js');
const { BadRequestError } = require("../error")
// import { BadRequestError } from '../errors/customErrors.js';
// import User from '../models/User.js';
// import mongoose from 'mongoose';
const mongoose = require("mongoose")
const User = require("../models/User")
const dayjs = require("dayjs")
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
const validateTicketInput = withValidationErrors([
    body('fullname').notEmpty().withMessage('fullname is required'),
    body('age')
        .notEmpty().
        withMessage('age is require')
    ,
    body("traveldate")
        .notEmpty()
        .withMessage('travel date is required')
        .custom(async (traveldate) => {
            const lettodaydate = formatDate(new Date()).date
            const ticketTravelDate = formatDate(traveldate).date;
            if ((dayjs(ticketTravelDate).diff(lettodaydate, "day")) < 0) {
                throw BadRequestError(`fail cause the user is trying to back date the date`)
            }
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
        isLength({ min: 8 })
        .withMessage('phone number must be at least 8 characters long')
        // .isNum()
        // .withMessage('invalid email format')
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
    // body('lastName').notEmpty().withMessage('last name is required'),
    // body('location').notEmpty().withMessage('location is required'),
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
    //   validateTest,
    validateTicketInput,
    validateIdParam,
    validateRegisterInput,
    //   validateLoginInput,
    //   validateGetAllJobsParams,
    //   validateUpdateUserInput,
    validateupdateTicket
};