import mongoose from "mongoose";

const DATABASECONNECTION = async () => {
    try {
        const connectionDB = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`\nConnection established at HOST: ${connectionDB.connection.host}`);
    } catch (error) {
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

export { DATABASECONNECTION };
