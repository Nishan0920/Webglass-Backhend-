import mongoose from "mongoose";

let isConnected = false;

const ConnectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  // Reuse the existing connection instead of reconnecting on every request.
  // This matters a lot on serverless (Vercel) where cold starts are frequent.
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default ConnectDB;