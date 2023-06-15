// Initialize projectData object
let projectData = {};

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Create an instance of Express
const app = express();

// Set the port number
const port = 3000;

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static("website"));

// Endpoint to get the project data
app.get("/data", (req, res) => {
  res.send(projectData);
});

// Endpoint to add data to the projectData object
app.post("/data", (req, res) => {
  const { temperature, date, userResponse } = req.body;
  projectData = {
    temperature,
    date,
    userResponse,
  };
  console.log("Data added:", projectData);
  res.send({ message: "Data added successfully" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
