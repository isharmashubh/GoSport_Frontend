const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.static("public")); // Serve static files
app.use(cors());

// MongoDB connection
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

// Call the database connection function
connectToDatabase();

// Match Schemas
const cricketMatchSchema = new mongoose.Schema({
  name: String,
  startTime: String,
  venue: String,
  tour: String,
  scorecard: String,
  link: String,
  m3u8link: String,
});

const footballMatchSchema = new mongoose.Schema({
  name: String,
  startTime: String,
  venue: String,
  tour: String,
  link: String,
  m3u8link: String,
});

const cricketMatch = mongoose.model("cricketMatch", cricketMatchSchema);
const footballMatch = mongoose.model("footballMatch", footballMatchSchema);

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fetch cricket and football matches from the database
app.get("/cricketMatches", async (req, res) => {
  try {
    const matches = await cricketMatch.find();
    res.json(matches);
  } catch (error) {
    res.status(500).send("Error fetching matches from the database.");
  }
});

app.get("/footballMatches", async (req, res) => {
  try {
    const matches = await footballMatch.find();
    res.json(matches);
  } catch (error) {
    res.status(500).send("Error fetching matches from the database.");
  }
});

// Serve other HTML pages
app.get("/cricket.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cricket.html"));
});

app.get("/football.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "football.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
