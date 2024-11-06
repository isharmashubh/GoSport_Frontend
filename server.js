const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));
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

// Retry Function for fetching data
const fetchDataWithRetry = async (model, retries = 3, delay = 1000) => {
  try {
    const matches = await model.find();
    if (matches.length === 0 && retries > 0) {
      console.log("No data found, retrying...");
      await new Promise((resolve) => setTimeout(resolve, delay)); // wait for some time before retrying
      return fetchDataWithRetry(model, retries - 1, delay); // retry fetching
    } else if (matches.length === 0) {
      throw new Error("No data found after retries.");
    }
    return matches;
  } catch (error) {
    if (retries > 0) {
      console.error("Error fetching data, retrying...", error);
      await new Promise((resolve) => setTimeout(resolve, delay)); // wait before retrying
      return fetchDataWithRetry(model, retries - 1, delay); // retry fetching
    }
    throw error; // throw error after all retries are exhausted
  }
};

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fetch cricket and football matches from the database with retry mechanism
app.get("/cricketMatches", async (req, res) => {
  try {
    const matches = await fetchDataWithRetry(cricketMatch);
    res.json(matches);
  } catch (error) {
    res
      .status(500)
      .send("Error fetching cricket matches from the database after retries.");
  }
});

app.get("/footballMatches", async (req, res) => {
  try {
    const matches = await fetchDataWithRetry(footballMatch);
    res.json(matches);
  } catch (error) {
    res
      .status(500)
      .send("Error fetching football matches from the database after retries.");
  }
});

// Serve other HTML pages
app.get("/cricket.html", async (req, res) => {
  await res.sendFile(path.join(__dirname, "public", "cricket.html"));
});

app.get("/football.html", async (req, res) => {
  await res.sendFile(path.join(__dirname, "public", "football.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
