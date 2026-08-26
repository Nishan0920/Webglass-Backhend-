import mongoose from "mongoose";

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected Successfully");
  } catch (error) {
    console.log("Can't connect to the database", error);
  }
};

export default ConnectDB;
