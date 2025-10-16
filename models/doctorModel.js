
import mongoose, { Schema } from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true,
    },
    fees: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    slots_booked: {
        type: Object,
        default: {}
    }
    /* slots_booked: {
        type: Object,
        default: {}
    } */
    //to store the empty object in any data , use minimize: false 
    // if minimize is false so we can use the empty object as a default value
}, { minimize: false });

//after creating doctorSchema, so  create doctorModel;
const doctorModel = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema)
//whenever the project getting started, the doctorModel will get execute , so to avoid that ,
//we will use mongoose.models.doctor || (means check first if the doctor model is existing or not , if not , create it and if it is existing, use it)

export default doctorModel;