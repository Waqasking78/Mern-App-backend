const mongoose = require("mongoose")

const DB = async () => {
    try {
        const dbCon = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${dbCon.connection.host}`);

    } catch (error) {
        process.exit(1)
    }
}

module.exports = DB