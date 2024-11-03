const express = require("express");
const mongoose = require("mongoose");
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
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
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

// Serve HTML files
const serveHtmlFile = (fileName, res) => {
  const filePath = path.join(__dirname, "public", fileName);
  console.log(`Serving file for HTML page is: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error sending ${fileName}:`, err);
      res.status(500).send(`Error loading the page: ${fileName}`);
    }
  });
};

// Route for the main page
app.get("/", (req, res) => serveHtmlFile("index.html", res));

// Fetch matches from the database
app.get("/matches", async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (error) {
    res.status(500).send("Error fetching matches from the database.");
  }
});

// Route for index.html (Optional, if you want to keep it separate)
app.get("/index.html", (req, res) => serveHtmlFile("index.html", res));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app as a module
module.exports = app;
