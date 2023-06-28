const qrcode = require("qrcode");

let data = {
    "name": "testuser1",
    "email": "rosemail@gmail.com",
    "gender": "male",
    "id": 123

}
const toJson = JSON.stringify(data);
// qrcode.toString(toJson, {
//     type: "terminal"

// },function(err, code) {
//     if (err) return console.lg(err)
//     console.log(code)
// })
// qrcode.toDataURL(toJson, {
//     type: "terminal"

// },function(err, code) {
//     if (err) return console.lg(err)
//     console.log(code)
// })
// qrcode.toFile("qr.png",toJson, {
//     type: "terminal"

// },function(err, code) {
//     if (err) return console.lg(err)
//     console.log(code)
// })
const path = require("path");

console.log(path.resolve(__dirname,"../tickets"))