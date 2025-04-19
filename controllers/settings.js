const userModel = require("../models/user")

const settings = async function (req, res){
    try{
        console.log("first")
    }
    catch(error){
        console.log(error)
        res.json(error)
    }
}

const hideStory = async function (req, res) {
    try {
        const hide = req.query.h;
        const userToHideId = req.query.id; 
        if (!hide || !userToHideId) return;
        if (hide == "h") {
            const loggedInUser = await userModel.findById(req.user.id);
            const userToHide = await userModel.findById(userToHideId)
            if (userToHide) {
                loggedInUser.settings.hideStoryFrom.push(userToHide._id);
            }
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
}

module.exports = {settings, hideStory}