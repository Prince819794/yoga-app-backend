const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18, max: 65 },
    selectedBatch: {
      type: String,
      required: true,
      enum: ["6-7AM", "7-8AM", "8-9AM", "5-6PM"],
    },
    EnrolledMonth: {
      type: String,
    },
    paymentStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const completePayment = async (userId) => true;

app.post("/api/enroll", async (req, res) => {
  try {
    const { name, age, selectedBatch } = req.body;

    // Input validation
    if (!name || !age || !selectedBatch) {
      console.error("Enrollment Error: Incomplete data provided");
      return res
        .status(400)
        .json({ error: "Please fill all fields, including batch selection" });
    }

    // Age validation
    if (age < 18 || age > 65) {
      console.error("Enrollment Error: Invalid age provided");
      return res
        .status(400)
        .json({ error: "Age must be between 18 and 65 to enroll." });
    }

    // Create a new user
    const newUser = await User.create({ name, age, selectedBatch });

    // Simulate payment and update payment status
    const paymentStatus = await completePayment(newUser._id);

    if (paymentStatus) {
      // Update user details with payment status and enrollment month
      await User.findByIdAndUpdate(newUser._id, {
        paymentStatus: true,
        enrolledMonth: new Date().getMonth() + 1,
      });

      console.log("Enrollment success:", newUser);
      return res
        .status(200)
        .json({ data: "Enrollment successful. Payment completed." });
    }

    console.error("Payment Error: Payment processing failed");
    return res.status(500).json({ error: "Payment failed." });
  } catch (error) {
    console.error("Enrollment Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
