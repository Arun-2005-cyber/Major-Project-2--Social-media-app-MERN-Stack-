const mongoose = require("mongoose");
MONGO_URI = 'mongodb://localhost:27017/socialmedia'
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DB is connected boss...")
    }
    catch (error) {
        console.error("Error OPPS", error);
        process.exit(1)
    }
}

module.exports = connectDB