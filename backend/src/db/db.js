import mongoose from "mongoose";

const MONGODBCONNECTION = async () => {
    try {
        console.log(`MONGODB_URI: ${process.env.PORT}`) // Debugging
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log(`✅ MongoDB Connected at ${connection.connection.host}:${connection.connection.port}`);
    } catch (error) {
        console.error(`❌ MongoDB connection failed. Error:`, error);
    }
};

// MONGODBCONNECTION();

export { MONGODBCONNECTION };
