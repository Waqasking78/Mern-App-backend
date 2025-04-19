const bcrypt = require("bcrypt")
const salt = 10;

async function GenerateHash(password) {
    const hash = await bcrypt.hash(password, salt)
    return hash;

}

async function CompareHash(password, hash) {
    const compPass = await bcrypt.compare(password, hash)
    // console.log(compPass)
    return compPass;
}

module.exports = {GenerateHash, CompareHash}