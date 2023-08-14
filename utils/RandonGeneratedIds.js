const CHARACTERS = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const generateRandonNumber = () => {
    let text = ""
    for (let i = 0; i < 8; ++i) {
        const number = Math.floor(Math.random() * CHARACTERS.length)
        text += CHARACTERS[number]
    }
    return text
}
module.exports = generateRandonNumber