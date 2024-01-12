require("dotenv").config();
require("express-async-errors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan")
// const session = require("express-session")
const cloudinary = require('cloudinary');

app.use(cookieParser());
app.use(express.json())
// const fs = require("fs")

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// app.use(morgan("tiny"))
app.use(cors({
  // origin: ["http://localhost:3000",
  //   "http://192.168.43.68:3000",
  //   "https://ntaribotaken.vercel.app",
  //   "https://evertrans.onrender.com"
  // ],
  // credentials: true,
  origin: true,
  credentials: true,
}));

cloudinary.config({
  cloud_name: "dnuqptnuq",
  api_key: "483645365462527",
  api_secret: "9-wnbRSZcEgQuco8AHMj6FjiVGk",
});
const cityController = require("./controllers/City").getCitys
const port = process.env.PORT || 5000;
const userRouter = require("./routes/User");
const routesRouter = require("./routes/routesRoute")
const Ticket = require("./routes/Ticket");
const ERROR = require("./middlewares/error");
const NOTFOUND = require("./middlewares/notfound");
const adminControl = require("./routes/Admincontrols");
const Admin_auth = require("./middlewares/Admin.auth");
const userAuth = require("./middlewares/Auth.User");
const contactRouter = require("./routes/Contact");
const busRouter = require("./routes/Bus")
const restrictedRouter = require("./routes/RestrictedUsers");
const seatRouter = require("./routes/Seat");
const { downloadsoftcopyticket } = require("./controllers/Ticket")
const IsUserRestricted = require("./middlewares/IsUserRestricted")
const { getTicketForAnyUser } = require("./controllers/Ticket")
const assistantRoute = require("./routes/Assistant")
const assistantControlsRoute = require("./routes/Assistant.controls")
const userSelf = require("./routes/User.self")
const userRoute = require("./routes/authUserRoute")
const recieptRouter = require("./routes/RecieptsRoute")
const {
  validateGetTicket } = require("./middlewares/validationMiddleware")
const { getRankUsers } = require("./controllers/Ticket")

const mailRouter = require("./routes/mailRoute")
// const AdminUser = require("./routes/Admin")
app.use("/users", userAuth, userRouter)
app.use("/auth", userRoute);
app.use("/user", userSelf);
app.use("/auth/assistant", assistantRoute);
app.use("/assistant", assistantControlsRoute);
app.use("/seat", seatRouter);
app.use("/routes", routesRouter);
app.use("/ticket", userAuth,
  IsUserRestricted, Ticket);
app.use("/admin", Admin_auth, adminControl);
app.use("/bus", busRouter);
app.use("/contact", Admin_auth, contactRouter);
app.use("/restricted", restrictedRouter);
app.use("/mails", mailRouter)
app.get("/downloadticket/:id", downloadsoftcopyticket)
app.post("/public/ticket",
  validateGetTicket,
  getTicketForAnyUser)
app.get("/ranked-users", getRankUsers)
// app.use("/reciepts", recieptRouter)
app.get("/allcities", cityController);
const server_running = (port) =>
  console.log(`server is running on port ${port}`);

app.use(ERROR);
app.use(NOTFOUND);
const startrunningserverfunction = async () => {
  try {
    require("./db/connections");

    app.listen(port, server_running(port));
  } catch (err) {
    console.log(err);
  }
};
startrunningserverfunction();
