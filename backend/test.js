const {
  DynamoDBClient,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

async function testConnection() {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    console.log("Connected successfully!");
    console.log("Your tables:", response.TableNames);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();
