const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs").promises; // Use promises for non-blocking file operations
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware to prevent caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(express.static("public")); // Serve static files
app.use(cors());

// MongoDB connection function
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
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
    await fs.writeFile(path.join(__dirname, "public/matches.json"), jsonData); // Non-blocking write
    console.log("Match data written to matches.json");
  } catch (error) {
    console.error("Error writing to JSON:", error);
  }
}

// Update match data and serve the main page
app.get("/", async (req, res) => {
  await updateMatchJSON(); // Wait for the update to complete
  const filePath = path.join(__dirname, "public", "matchPlayer.html");
  console.log(`Serving file for HTML page is : ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending matchPlayer.html:", err);
      res.status(500).send("Error loading the page");
    }
  });
});

// Serve directlyfile.html
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
