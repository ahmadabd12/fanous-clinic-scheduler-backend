const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
// const twilio = require("twilio");
// const router = express.Router();
// const accountSid = "AC7b351d8e42b611eae42c877430aba888";
// const authToken = "282a76f2d4b16fd6716bf2c886a39664";
// const client = twilio(accountSid, authToken);
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

dotenv.config();

const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/api", router);
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
      description:
        "API for managing patients, appointments, and payment history",
    },
    servers: [{ url: "http://localhost:" + (process.env.PORT || 3001) }],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   - name: Patients
 *     description: Patient management
 *   - name: Appointments
 *     description: Appointment management
 *   - name: Payments
 *     description: Payment history for patients
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of patients
 *   post:
 *     summary: Add a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: أحمد
 *               age: 30
 *               gender: ذكر
 *     responses:
 *       201:
 *         description: Patient added
 *
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
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
app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Patient.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "لا يوجد مريض بهذا المعرف" });
    }
    res.status(200).json({ message: "تم حذف المريض بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف المريض", error });
  }
});
//payment history

/**
 * @swagger
 * /api/patient/{id}/add-payment:
 *   post:
 *     summary: Add a payment record for a patient
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - datePaid
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 200
 *               datePaid:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-16
 *     responses:
 *       200:
 *         description: Payment added successfully
 *       404:
 *         description: Patient not found
 */
app.post("/api/patient/:id/add-payment", async (req, res) => {
  const { amount, datePaid } = req.body;

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Ensure required fields exist on the schema
    if (
      typeof patient.remainingAmount !== "number" ||
      typeof patient.paidAmount !== "number"
    ) {
      return res.status(400).json({
        message:
          "Patient does not have paidAmount or remainingAmount fields initialized.",
      });
    }

    if (amount > patient.remainingAmount) {
      return res.status(400).json({
        message: `❌الدفعة تتجاوز المبلغ المتبقي (${patient.remainingAmount})`,
      });
    }

    // Add to payment history
    patient.paymentHistory.push({ amount, datePaid });

    // Update paid and remaining
    patient.paidAmount += amount;
    patient.remainingAmount -= amount;
    patient.amountStatus =
      patient.remainingAmount === 0 ? "المبلغ مكتمل" : "غير مكتمل";
    await patient.save();

    res.json({ message: "✅ تم إضافة الدفعة بنجاح", patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 *   post:
 *     summary: Add a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               patientId: 60f84c5dbb20f24d243a5a6b
 *               date: 2025-07-20
 *               reason: فحص دوري
 *     responses:
 *       201:
 *         description: Appointment added
 *
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete an appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       404:
 *         description: Appointment not found
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

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "لا يوجد موعد بهذا المعرف" });
    }
    res.status(200).json({ message: "تم حذف الموعد بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الموعد", error });
  }
});
//send-message
// POST: Send WhatsApp message
// router.post("/send-message", async (req, res) => {
//   const { number } = req.body; // Expecting full international number, e.g., +96170xxxxxx

//   try {
//     const message = await client.messages.create({
//       from: "whatsapp:+14155238886", // Twilio WhatsApp number
//       to: `whatsapp:${number}`,
//       body: "مرحبا! هذه رسالة تجريبية من عيادة فنوس. إذا كنت بحاجة إلى مساعدة، يرجى الاتصال بنا.",
//     });

//     res.status(200).json({ success: true, sid: message.sid });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// module.exports = router;

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
});
