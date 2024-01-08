const jwt = require("jsonwebtoken")

const createJWT = (payload, secret = process.env.jwtSecret) => {
  const token = jwt.sign(payload, process.env.jwtSecret, {
    expiresIn: "10d",
  });
  return token;
};

const verifyJWT = (token, secret = process.env.jwtSecret) => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};
module.exports = {
  createJWT,
  verifyJWT
}