require("dotenv").config();
require("express-async-errors");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
const User = require("./routes/User");
const Ticket = require("./routes/Ticket");
const ERROR = require("./middlewares/error");
const NOTFOUND = require("./middlewares/notfound");
const adminControl = require("./routes/Admincontrols");
const Admin_auth = require("./middlewares/Admin.auth");
const userAuth = require("./middlewares/Auth.User");
const contactRouter = require("./routes/Contact");
const Cities = require("./models/Cities");
app.use("/auth", User);
app.use("/ticket", userAuth, Ticket);
app.use("/admin", Admin_auth, adminControl);
app.use("/contact", contactRouter);
app.get("/allcities", async (req, res) => {
  const cities = await Cities.find({}).sort({ value: 1 });
  res.status(200).json({ cities, nHits: cities.length });
});
const Admin = require("./models/Admin");
const server_running = (port) =>
  console.log(`server is running on port ${port}`);
app.get("/", async (req, res) => {
  res.send("welcome to the homepage ");
});
app.use(ERROR);
app.use(NOTFOUND);
const startrunningserverfunction = async () => {
  try {
    require("./db/connections");
    await Admin.deleteMany({});
    await Admin.create({
      phone: process.env.admin_phone,
      password: process.env.admin_password,
    });
    app.listen(port, server_running(port));
  } catch (err) {
    console.log(err);
  }
};
startrunningserverfunction();
