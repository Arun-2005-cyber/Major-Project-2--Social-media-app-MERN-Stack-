const mongoose = require("mongoose");
const MONGO_URI = "mongodb+srv://prakashsm940:zj987*h9dKJ_AQj@cluster0.v20qocv.mongodb.net/socialmedia?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
