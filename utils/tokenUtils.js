// import jwt from 'jsonwebtoken';
const jwt=require("jsonwebtoken")

const createJWT = (payload,secret) => {
  const token = jwt.sign(payload, (secret || process.env.jwtSecret), {
    expiresIn: "10d",
  });
  return token;
};

 const verifyJWT = (token,secret) => {
  const decoded = jwt.verify(token,secret);
  return decoded;
};
module.exports={
  createJWT,
  verifyJWT 
}