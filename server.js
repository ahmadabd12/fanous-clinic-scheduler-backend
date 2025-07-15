const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(cors()); // ✅ Allow all origins
app.use(express.json()); // ✅ Parse JSON request body

const patientsFile = path.join(__dirname, "patients.json");
const appointmentsFile = path.join(__dirname, "appointments.json");

// POST: Add new patient
app.post("/api/patients", (req, res) => {
  const newPatient = req.body;

  const patients = JSON.parse(fs.readFileSync(patientsFile));
  patients.push(newPatient);

  fs.writeFileSync(patientsFile, JSON.stringify(patients, null, 2));
  res.status(201).json(newPatient);
});

// GET: Get all patients
app.get("/api/patients", (req, res) => {
  const patients = JSON.parse(fs.readFileSync(patientsFile));
  res.json(patients);
});

// GET: Get all appointments
app.get("/api/appointments", (req, res) => {
  const appointments = JSON.parse(fs.readFileSync(appointmentsFile));
  res.json(appointments);
});

// POST: Add new appointments
app.post("/api/appointments", (req, res) => {
  const newAppointment = req.body;

  const appointments = JSON.parse(fs.readFileSync(appointmentsFile));
  appointments.push(newAppointment);

  fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
  res.status(201).json(newAppointment);
});
app.listen(3001, () => console.log("API running on port 3001"));
