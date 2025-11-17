require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk"); // Replace mongoose with AWS SDK
const morgan = require("morgan");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const certRoutes = require("./routes/certificates");
const createAdmin = require("./utils/createAdmin");

const app = express();

// Configure AWS (DynamoDB will use these settings)
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// If using DynamoDB local for development
if (process.env.AWS_DYNAMODB_ENDPOINT) {
  AWS.config.update({
    endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
  });
}

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => res.json({ message: "API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/certificates", certRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

async function start() {
  // No connection needed for DynamoDB (it's serverless)
  // Just verify we can access the tables
  try {
    const dynamodb = new AWS.DynamoDB();
    await dynamodb.listTables().promise();
    console.log("Connected to DynamoDB");

    await createAdmin();
    app.listen(process.env.PORT || 5000, () => console.log("Server listening"));
  } catch (error) {
    console.error("Failed to initialize DynamoDB:", error);
    process.exit(1);
  }
}

start();
