const isValidData = function (value) {
    if (typeof value === "undefined" || value === null) return "field is missing"
    if (typeof value !== "string") return "type is not string";
    if (typeof value === "string" && value.trim().length == 0) return "empty string";
    return true;
}
function isUrl(x) {
    const regEx = /^\s*http[s]?:\/\/([a-z]{2,3}\.)?[a-zA-Z0-9]+\.[a-z]{2,3}(\.[a-z]{2})?(\/[\w\-!:@#$%^&*()+=?\.]*)*\s*$/;
    return regEx.test(x)
}
const isValidRequestBody = function (requestBody) {
    if (Object.keys(requestBody).length == 0) return false;
    return true
}

const createUrlValidation = async function (req, res, next) {
  
    let data = req.body;
    let { longUrl } = data
    // Validating empty body
    if (!isValidRequestBody(data))
        return res.status(400).send({ status: false, msg: "Body cannot be empty" });
    if (isValidData(longUrl) != true)
   
    {   
        let str= "longUrl " + isValidData(longUrl)
        //console.log(str);
        return res.status(400).send({ status: false, msg: str });
    }
    if (!isUrl(longUrl)) return res.status(400).send({ status: false, message: "Invalid format!! enter a valid URL" });

    next()
}

module.exports= {createUrlValidation}
