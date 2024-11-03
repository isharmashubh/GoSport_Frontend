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
    console.log("Currently i am inside updateMatchJSON function");
    const matches = await Match.find();
    const jsonData = JSON.stringify(matches, null, 2);
    console.log(`JsonData i got is -----> ${jsonData}`);
    console.log("Writing data inside matches.json in server.js");
    fs.writeFileSync(path.join(__dirname, "public/matches.json"), jsonData);
    console.log("Match data written to matches.json in server.js");
    console.log("I exit updateMatchJSON function here");
  } catch (error) {
    console.error("Error writing to JSON:", error);
  }
}

// updateMatchJSON().catch((error) => {
//   console.error("Failed to update matches.json:", error);
// });
// Route for the main page
app.get("/", (req, res) => {
  // Update matches.json and log any errors but do not await it
  updateMatchJSON().catch((error) => {
    console.error("Failed to update matches.json:", error);
  });
  const filePath = path.join(__dirname, "public", "index.html");
  console.log(`Serving file for HTML page is: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error loading the page");
    }
  });
});

app.get("/update-matches", async (req, res) => {
  try {
    console.log("I am inside update-matches endpoint");
    updateMatchJSON();
    res.status(200).send("Match data updated successfully in server.js.");
    console.log("I exit here update-matches endpoint");
  } catch (error) {
    res.status(500).send("Error updating match data.");
  }
});
// Route for another HTML file
app.get("/index.html", (req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");
  console.log(`Serving file for index page is: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
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
