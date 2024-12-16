import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Construct the MongoDB URI
    const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
    console.log("Attempting to connect to MongoDB with URI:", uri);

    // Connect to MongoDB without deprecated options
    const connectionInstance = await mongoose.connect(uri);

    console.log(
      `\nMongoDB Connected Successfully! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection FAILED:", error.message || error);
    process.exit(1);
  }
};

export default connectDB;
