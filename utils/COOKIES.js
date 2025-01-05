const isProduction = process.env.NODE_ENV == "production"
// this set cookies to the browser when depending on the environment varaible
const oneDay = 1000 * 60 * 60 * 24;

const cookies = {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
}
module.exports=cookies