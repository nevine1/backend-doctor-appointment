
import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("Database connected");
    })
    
    //creating the database(doctorAppointment is  database name)
   await mongoose.connect(`${process.env.MONGODB_URL}/doctorAppointment`)
}


export default connectDB;