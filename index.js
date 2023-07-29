require("dotenv").config();
require("express-async-errors");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: ["http://localhost:3000",
    "http://192.168.43.68:3000",
    "https://ntaribotaken.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200
}));
const cityController = require("./controllers/City").getCitys
const port = process.env.PORT || 5000;
const User = require("./routes/User");
const routesRouter = require("./routes/Route")
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
const  assistantRoute= require("./routes/Assistant")
const  assistantControlsRoute= require("./routes/Assistant.controls")
const  userSelf= require("./routes/User.self")
app.use("/auth", User);
app.use("/user", userSelf);
app.use("/auth/assistant", assistantRoute);
app.use("/assistant", assistantControlsRoute);
app.use("/seat", seatRouter);
app.use("/route", routesRouter);
app.use("/ticket", userAuth,IsUserRestricted, Ticket);
app.use("/admin", Admin_auth, adminControl);
app.use("/bus", busRouter);
app.use("/contact", Admin_auth, contactRouter);
app.use("/restricted", restrictedRouter);
app.get("/downloadticket/:id", downloadsoftcopyticket)

app.get("/allcities", cityController);
const server_running = (port) =>
  console.log(`server is running on port ${port}`);
app.get("/", async (req, res) => {
  res
    .cookie("foo", "bar")
    .send("welcome to the homepage ");
});
app.get("/getcookie", async (req, res) => {
  res
    .send("get cookie page here ");
});
app.use(ERROR);
app.use(NOTFOUND);

app.use((err, req, res, next) => {
  const output = fs.readFileSync('./index', 'utf8');
  res.status(500).send(output);
  next(err);
});
const startrunningserverfunction = async () => {
  try {
    require("./db/connections");
    // await Admin.deleteMany({});
    // await Admin.create({
    //   phone: process.env.admin_phone,
    //   password: process.env.admin_password,
    // });
    app.listen(port, server_running(port));
  } catch (err) {
    console.log(err);
  }
};
startrunningserverfunction();
