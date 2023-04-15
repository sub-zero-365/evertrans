const express = require("express")
const app = express()
const port = process.env.PORT || 9000




const server_running = (port) => console.log(`server is running on port ${port}`)
app.get("/", async(req, res) => {
    res.send("welcome to the homepage ")
})
const startrunningserverfunction = async() => {
    try {
        await app.listen(port, server_running(port))

    } catch (err) {

        console.log(err)
    }
}
startrunningserverfunction()