const isProduction = process.env.NODE_ENV == "production"
// this set cookies to the browser when depending on the environment varaible
const cookies = async (time = null) => {
    const obj = {
        httpOnly: true,
        expires: new Date(Date.now()),
        // sameSite: "none",
        secure: isProduction,
    }
    if (isProduction) {
        obj.sameSite = "none"
    }
    if (time) {
        obj.expires = new Date(Date.now() + time)
    }
    return ({
        ...obj
    })
}
module.exports=cookies