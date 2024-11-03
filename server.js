const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.static("public")); // Serve static files
app.use(cors());
// MongoDB connection function
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

// Call the database connection function
connectToDatabase();

// Match Schema
const matchSchema = new mongoose.Schema({
  name: String,
  startTime: Date,
  venue: String,
  tour: String,
  scorecard: String,
  m3u8link: String,
});

const Match = mongoose.model("Match", matchSchema);

// Function to write match data to JSON
async function updateMatchJSON() {
  try {
    const matches = await Match.find();
    const jsonData = JSON.stringify(matches, null, 2);
    fs.writeFileSync(path.join(__dirname, "public/matches.json"), jsonData);
    console.log("Match data written to matches.json");
  } catch (error) {
    console.error("Error writing to JSON:", error);
  }
}

// Route to trigger JSON update
app.get("/update-matches", async (req, res) => {
  await updateMatchJSON();
  res.send("Matches JSON updated");
});

// Serve the matchPlayer.html file as the default page
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "matchPlayer.html"); // Move up one level from Api folder
  console.log(`Serving file for HTML page is : ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending matchPlayer.html:", err);
      res.status(500).send("Error loading the page");
    }
  });
});

app.get("/directlyfile.html", (req, res) => {
  const filePath = path.join(__dirname, "public", "directlyfile.html");
  console.log(`Serving file for directlyfile page is : ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending directlyfile.html:", err);
      res.status(500).send("Error loading the page");
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app as a module
module.exports = app;
