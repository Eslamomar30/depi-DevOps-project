const {
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = require("../config/dynamodb-client");

const TABLE_NAME = "Admins";

module.exports = {
  async findOne(username) {
    const params = {
      TableName: TABLE_NAME,
      Key: marshall({ username }),
    };

    const { Item } = await client.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : null;
  },

  async updatePassword(username, hashedPassword) {
    const params = {
      TableName: TABLE_NAME,
      Key: marshall({ username }),
      UpdateExpression: "SET password = :password",
      ExpressionAttributeValues: marshall({
        ":password": hashedPassword,
      }),
      ReturnValues: "UPDATED_NEW",
    };

    await client.send(new UpdateItemCommand(params));
  },
};
