const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

dotenv.config();

const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clinic API",
      version: "1.0.0",
      description: "API for managing patients and appointments",
    },
    servers: [{ url: "http://localhost:" + process.env.PORT || 3001 }],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     responses:
 *       200:
 *         description: List of patients
 *   post:
 *     summary: Add a new patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Patient added
 */
app.get("/api/patients", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post("/api/patients", async (req, res) => {
  const newPatient = new Patient(req.body);
  await newPatient.save();
  res.status(201).json(newPatient);
});

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     responses:
 *       200:
 *         description: List of appointments
 *   post:
 *     summary: Add a new appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Appointment added
 */
app.get("/api/appointments", async (req, res) => {
  const appointments = await Appointment.find();
  res.json(appointments);
});

app.post("/api/appointments", async (req, res) => {
  const newAppointment = new Appointment(req.body);
  await newAppointment.save();
  res.status(201).json(newAppointment);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
});

// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// const bodyParser = require("body-parser");

// const swaggerUi = require("swagger-ui-express");
// const swaggerJsdoc = require("swagger-jsdoc");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const patientsFile = path.join(__dirname, "patients.json");
// const appointmentsFile = path.join(__dirname, "appointments.json");

// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Clinic API",
//       version: "1.0.0",
//       description: "API for managing patients and appointments",
//     },
//     servers: [{ url: "http://localhost:3001" }],
//   },
//   apis: ["./server.js"],
// };

// const swaggerSpec = swaggerJsdoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// /**
//  * @swagger
//  * /api/patients:
//  *   get:
//  *     summary: Get all patients
//  *     responses:
//  *       200:
//  *         description: List of patients
//  *   post:
//  *     summary: Add a new patient
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *     responses:
//  *       201:
//  *         description: Patient added
//  */
// app.get("/api/patients", (req, res) => {
//   const patients = JSON.parse(fs.readFileSync(patientsFile));
//   res.json(patients);
// });
// app.post("/api/patients", (req, res) => {
//   const newPatient = req.body;
//   const patients = JSON.parse(fs.readFileSync(patientsFile));
//   patients.push(newPatient);
//   fs.writeFileSync(patientsFile, JSON.stringify(patients, null, 2));
//   res.status(201).json(newPatient);
// });

// /**
//  * @swagger
//  * /api/appointments:
//  *   get:
//  *     summary: Get all appointments
//  *     responses:
//  *       200:
//  *         description: List of appointments
//  *   post:
//  *     summary: Add a new appointment
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *     responses:
//  *       201:
//  *         description: Appointment added
//  */
// app.get("/api/appointments", (req, res) => {
//   const appointments = JSON.parse(fs.readFileSync(appointmentsFile));
//   res.json(appointments);
// });
// app.post("/api/appointments", (req, res) => {
//   const newAppointment = req.body;
//   const appointments = JSON.parse(fs.readFileSync(appointmentsFile));
//   appointments.push(newAppointment);
//   fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
//   res.status(201).json(newAppointment);
// });

// app.listen(3001, () =>
//   console.log("API running on port 3001. Docs at /api-docs")
// );
