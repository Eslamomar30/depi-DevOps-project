const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "Admins"; // Replace with your DynamoDB table name

async function createAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return;

  try {
    // Check if admin already exists
    const existing = await dynamoDB
      .get({
        TableName: TABLE_NAME,
        Key: { username: ADMIN_USERNAME },
      })
      .promise();

    if (existing.Item) {
      console.log("Admin already exists");
      return;
    }

    // Hash password and create admin
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await dynamoDB
      .put({
        TableName: TABLE_NAME,
        Item: {
          username: ADMIN_USERNAME,
          password: hashed,
          createdAt: new Date().toISOString(),
        },
      })
      .promise();

    console.log("🔒 Default admin account created");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

module.exports = createAdmin;
