module.exports = function (key, obj) {
    if (key in obj) {
        const temp = obj.toJSON();
        delete temp[key]
        return temp
    }
    return obj
}