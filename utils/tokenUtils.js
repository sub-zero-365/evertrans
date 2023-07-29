// import jwt from 'jsonwebtoken';
const jwt = require("jsonwebtoken")

const createJWT = (payload, secret=process.env.jwtSecret) => {
  const token = jwt.sign(payload, (secret || process.env.jwtSecret), {
    expiresIn: "10d",
  });
  console.log(token,"isjihfioashfilj hadsijhhujg")
  return token;
};

const verifyJWT = (token, secret) => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};
module.exports = {
  createJWT,
  verifyJWT
}