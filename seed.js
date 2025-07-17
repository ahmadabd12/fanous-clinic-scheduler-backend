const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
const patients = require("./patients.json");
const appointments = require("./appointments.json");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Patient.insertMany(patients);
    await Appointment.insertMany(appointments);
    console.log("✅ Seed data inserted!");
    process.exit();
  })
  .catch((err) => console.error("Error:", err));
