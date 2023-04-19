require("dotenv").config()
require("express-async-errors")
const express = require("express")
const app = express()
app.use(express.json())
const port = process.env.PORT || 5000;
const { User, Ticket } = require("./routes")
const { NOTFOUND, ERROR } = require("./middlewares")
app.use("/auth", User)
app.use("/ticket", Ticket)

const server_running = (port) => console.log(`server is running on port ${port}`)
app.get("/", async(req, res) => {
    res.send("welcome to the homepage ")
})
app.use(ERROR)
app.use(NOTFOUND)
const startrunningserverfunction = async() => {
    try {
        require("./db/connections")
        app.listen(port, server_running(port))


    } catch (err) {

        console.log(err)
    }
}
startrunningserverfunction()