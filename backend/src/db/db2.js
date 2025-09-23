import { MongoClient } from "mongodb";
const uri = "mongodb+srv://ak6488534:l8CpeO4yMlHAevzx@chaava-cluster.zqkbe.mongodb.net/HealthConnect?retryWrites=true&w=majority&appName=Chaava-cluster"; // Update with your MongoDB connection string
const client = new MongoClient(uri);

const doctors = [
  {
    "_id": "67bd124d1e5857456523de77",
    "email": "doctor1_81@gmail.com",
    "password": "$2b$10$Qx5sSXWn3hJTcN/QO.unhuYSX3NHEDEZJx711zEhy6rMyvTtK4.KW",
    "role": "Doctor",
    "refreshToken": "",
    "accessToken": "",
    "name": "Dr. John Doe",
    "profilepic": "",
    "isVerified": true,
    "isBlocked": false,
    "isDeleted": false,
    "otp": "",
    "userType": "Doctor",
    "experience": 5,
    "license": "733021",
    "averageRating": 4,
    "timeSlots": [],
    "ratings": [],
    "dateofbirth": 1650247629452,
    "createdAt": 1650247629462,
    "updatedAt": 1650247629462,
    "__v": 0
  },
  {
    "_id": "67bd124d1e5467456523ee78",
    "email": "doctor2_72@gmail.com",
    "password": "$2b$10$Qx5sSXWn3hJTcN/QO.unhuYSX3NHEDEZJx711zEhy6rMyvTtK4.KW",
    "role": "Doctor",
    "refreshToken": "",
    "accessToken": "",
    "name": "Dr. Jane Smith",
    "profilepic": "",
    "isVerified": false,
    "isBlocked": false,
    "isDeleted": false,
    "otp": "",
    "userType": "Doctor",
    "experience": 10,
    "license": "723022",
    "averageRating": 5,
    "timeSlots": [],
    "ratings": [],
    "dateofbirth": 1600247629452,
    "createdAt": 1600247629462,
    "updatedAt": 1600247629462,
    "__v": 0
  },
  {
    "_id": "67bd124d1e5863456523ee79",
    "email": "doctor3_78013@gmail.com",
    "password": "$2b$10$Qx5sSXWn3hJTcN/QO.unhuYSX3NHEDEZJx711zEhy6rMyvTtK4.KW",
    "role": "Doctor",
    "refreshToken": "",
    "accessToken": "",
    "name": "Dr. Alice Brown",
    "profilepic": "",
    "isVerified": true,
    "isBlocked": false,
    "isDeleted": false,
    "otp": "",
    "userType": "Doctor",
    "experience": 8,
    "license": "783023",
    "averageRating": 4,
    "timeSlots": [],
    "ratings": [],
    "dateofbirth": 1550247629452,
    "createdAt": 1550247629462,
    "updatedAt": 1550247629462,
    "__v": 0
  },
  {
    "_id": "67bd124d1e5827456523ee80",
    "email": "doctor4_78333014@gmail.com",
    "password": "$2b$10$Qx5sSXWn3hJTcN/QO.unhuYSX3NHEDEZJx711zEhy6rMyvTtK4.KW",
    "role": "Doctor",
    "refreshToken": "",
    "accessToken": "",
    "name": "Dr. Michael Lee",
    "profilepic": "",
    "isVerified": true,
    "isBlocked": false,
    "isDeleted": false,
    "otp": "",
    "userType": "Doctor",
    "experience": 12,
    "license": "713034",
    "averageRating": 5,
    "timeSlots": [],
    "ratings": [],
    "dateofbirth": 1500247629452,
    "createdAt": 1500247629462,
    "updatedAt": 1500247629462,
    "__v": 0
  },
  {
    "_id": "67bd124d1e5817456523ee81",
    "email": "doctor5_785353015@gmail.com",
    "password": "$2b$10$Qx5sSXWn3hJTcN/QO.unhuYSX3NHEDEZJx711zEhy6rMyvTtK4.KW",
    "role": "Doctor",
    "refreshToken": "",
    "accessToken": "",
    "name": "Dr. David Green",
    "profilepic": "",
    "isVerified": false,
    "isBlocked": false,
    "isDeleted": false,
    "otp": "",
    "userType": "Doctor",
    "experience": 6,
    "license": "782045",
    "averageRating": 3,
    "timeSlots": [],
    "ratings": [],
    "dateofbirth": 1450247629452,
    "createdAt": 1450247629462,
    "updatedAt": 1450247629462,
    "__v": 0
  }
]




async function insertDoctors() {
    console.log("hello")
  try {
    await client.connect();
    const database = client.db("HealthConnect"); // Use your database name
    const collection = database.collection("users");

    const result = await collection.insertMany(doctors);
    console.log(`${result.insertedCount} doctors inserted successfully`);
  } catch (error) {
    console.error("Error inserting doctors:", error);
  } finally {
    await client.close();
  }
}

insertDoctors();
