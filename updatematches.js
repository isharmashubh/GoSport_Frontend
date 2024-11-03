const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const matchSchema = new mongoose.Schema({
  name: String,
  startTime: Date,
  venue: String,
  tour: String,
  scorecard: String,
  m3u8link: String,
});

const Match = mongoose.model("Match", matchSchema);
async function updateMatchJSON() {
  try {
    const matches = await Match.find();
    const jsonData = JSON.stringify(matches, null, 2);
    console.log("Writing data inside matches.json");
    fs.writeFileSync(path.join(__dirname, "matches.json"), jsonData);
    console.log(
      `Writing to file path ---->    ${path.join(__dirname, "matches.json")} `
    );
    console.log("Match data written to matches.json");
  } catch (error) {
    console.error("Error writing to JSON:", error);
  }
}

window.onload = function () {
  updateMatchJSON();
};
