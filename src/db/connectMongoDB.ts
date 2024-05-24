import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    let errorMessage: string = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Error connection to mongoDB:", errorMessage);
    process.exit(1);
  }
};

export default connectMongoDB;
