const jwt = require("jsonwebtoken")

const GenerateToken = async function(user) {
    try {
        return jwt.sign({id: user._id, username: user.username}, process.env.SECRET_JWT_KEY, {expiresIn: "30d"})
    } catch (error) {
        res.json({"message": "token is not generated"})
    }
}

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        res.status(401).json({message: 'Please login to access this page'});
    }
    try {
        const verified = jwt.verify(token, process.env.SECRET_JWT_KEY);
        req.user = verified;
        next();
    } catch (err) {
        req.user = null;
        res.status(401).json({message: 'Invalid Token'});
    }
}

module.exports = {GenerateToken, verifyToken}