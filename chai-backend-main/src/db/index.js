import mongoose from "mongoose";
import { MONGODB_URI } from "../../env.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      MONGODB_URI
    );
    console.log(
      `MongoDB connected! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection Error", error);
    process.exit(1);
  }
};


export default connectDB;
