require("dotenv").config();
require("express-async-errors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const cors = require("cors");
// const session = require("express-session")
const cloudinary = require('cloudinary');
const morgan = require("morgan")
app.use(cookieParser());
app.use(express.json())
const allowedOrigins = [
  "http://localhost:3000",        // Local development
  "http://192.168.43.68:3000",    // Local network development
  "https://eagle-tranz.com",      // Production domain,
  "https://www.eagle-tranz.com",
  "https://evertrans.onrender.com",
  "http://192.168.43.79:3000/",
  "http://192.168.43.79:3000"
];


// Configure CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    console.log("Request Origin:", origin); // Debugging: log the origin
    if (!origin || allowedOrigins.includes(origin)) {
      console.log("enter here ")
      // Allow requests with no origin or from allowed origins
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin); // Log blocked origins for debugging
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and authorization headers
}));


app.use(morgan("tiny"))//logger for express 
cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
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
const { authenticateUser, authorizePermissions } = require("./middlewares/Auth.User");
// const contactRouter = require("./routes/Contact");
const busRouter = require("./routes/Bus")
const restrictedRouter = require("./routes/RestrictedUsers");
const seatRouter = require("./routes/Seat");
const { downloadsoftcopyticket } = require("./controllers/Ticket")
const IsUserRestricted = require("./middlewares/IsUserRestricted")
const { getTicketForAnyUser } = require("./controllers/Ticket")
const assistantRoute = require("./routes/Assistant")
// const assistantControlsRoute = require("./routes/Assistant.controls")
const cityRouter = require("./routes/cityRouter")
const userSelf = require("./routes/User.self")
const userRoute = require("./routes/authUserRoute")
const recieptRouter = require("./routes/RecieptsRoute")
const {
  validateGetTicket } = require("./middlewares/validationMiddleware")
const { getRankUsers } = require("./controllers/Ticket")

const mailRouter = require("./routes/mailRoute");
// const GlobalRestriction = require("./middlewares/GlobalRestriction");
const { USER_ROLES_STATUS } = require("./utils/constants");
const { downloadsoftcopy } = require("./controllers/mailsController");
// const AdminUser = require("./routes/Admin")
// app.use(GlobalRestriction)
app.use("/users", authenticateUser
  // , IsUserRestricted
  , userRouter)
app.use("/auth", userRoute);
app.use("/user", userSelf);
app.use("/auth/assistant", assistantRoute);
// app.use("/assistant", assistantControlsRoute);
app.use("/seat", seatRouter);
app.use("/routes", authenticateUser, routesRouter);
app.use("/ticket", authenticateUser,
  IsUserRestricted, Ticket);
app.use("/admin", Admin_auth, adminControl);
app.use("/bus", authenticateUser,
  IsUserRestricted,
  busRouter);
// app.use("/contact", Admin_auth, contactRouter);
app.get("/downloadmail/:id", downloadsoftcopy)

app.use("/restricted", restrictedRouter);

app.use("/mails", authenticateUser, mailRouter)
app.get("/downloadticket/:id", downloadsoftcopyticket)
app.post("/public/ticket",
  validateGetTicket,
  getTicketForAnyUser)
app.get("/ranked-users", getRankUsers)
app.use("/reciepts", recieptRouter)
app.get("/allcities", cityController);
app.get("/hello-world", (_, res) => res.send("hello world from server"))
app.use("/cities", authenticateUser,
  IsUserRestricted,
  authorizePermissions(
    USER_ROLES_STATUS.admin,
    USER_ROLES_STATUS.sub_admin,
    USER_ROLES_STATUS.ticketer,
    USER_ROLES_STATUS.mailer,
  ),

  cityRouter)
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
