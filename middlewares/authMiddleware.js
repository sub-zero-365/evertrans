// import {
//     UnauthenticatedError,
//     UnauthorizedError,
//     BadRequestError,
//   } from '../errors/customErrors.js';
//   import { verifyJWT } from '../utils/tokenUtils.js';

//   export const authenticateUser = (req, res, next) => {
//     const { token } = req.cookies;
//     if (!token) throw new UnauthenticatedError('authentication invalid');

//     try {
//       const { userId, role } = verifyJWT(token);
//       const testUser = userId === '64b2c07ccac2efc972ab0eca';
//       req.user = { userId, role, testUser };
//       next();
//     } catch (error) {
//       throw new UnauthenticatedError('authentication invalid');
//     }
//   };

//   export const authorizePermissions = (...roles) => {
//     return (req, res, next) => {
//       if (!roles.includes(req.user.role)) {
//         throw new UnauthorizedError('Unauthorized to access this route');
//       }
//       next();
//     };
//   };

//   export const checkForTestUser = (req, res, next) => {
//     if (req.user.testUser) throw new BadRequestError('Demo User. Read Only!');
//     next();
//   };
// const { } = require("../utils/tokenUtils")
const authenticateAssistant = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw UnathorizedError("please provide an auth header")
  }
  if (!authHeader.startsWith(process.env.jwtAssistant)) {
    throw UnathorizedError("please provide a valid auth  header")
  }
  const token = authHeader.split(" ")[1];
  try {
    const { phone, _id } = jwt.verify(token, process.env.jwtAssistant);
    req.user = { phone, _id }
    next()
  } catch (err) {
    console.log(err)
    throw err
  }


} 
module.exports={authenticateAssistant}