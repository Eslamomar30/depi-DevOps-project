const { v4: uuidv4 } = require("uuid");
const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ScanCommand,
  GetItemCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const client = require("../config/dynamodb-client");
const s3Service = require("../services/s3Service");

const TABLE_NAME = "Certificates";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.S3_CERTIFICATES_BUCKET;

module.exports = {
  async create(certificate) {
    // Generate S3 URL (note: this is the permanent S3 object URL, not presigned)
    const certificateUrl = `https://${process.env.S3_CERTIFICATES_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${certificate.fileName}`;

    const item = {
      _id: uuidv4(),
      studentId: certificate.studentId,
      fileName: certificate.fileName,
      certificateUrl: certificateUrl,
      createdAt: new Date().toISOString(),
      mimeType: certificate.mimeType || null,
      originalName: certificate.originalName || null,
      size: certificate.size || null,
    };

    const params = {
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    };

    await client.send(new PutItemCommand(params));

    // Return both the permanent URL and a presigned URL
    return {
      ...item,
      downloadUrl: await s3Service.getFileUrl(certificate.fileName),
    };
  },

  async findById(_id) {
    const params = {
      TableName: TABLE_NAME,
      Key: marshall({ _id }),
    };

    const { Item } = await client.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : null;
  },

  async findByStudentId(studentId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "StudentIdIndex",
      KeyConditionExpression: "studentId = :studentId",
      ExpressionAttributeValues: marshall({
        ":studentId": studentId,
      }),
    };

    const { Items } = await client.send(new QueryCommand(params));
    return Items ? Items.map((item) => unmarshall(item)) : [];
  },

  async findAll(page = 1, limit = 10) {
    const params = {
      TableName: TABLE_NAME,
      Limit: limit,
    };

    const { Items, LastEvaluatedKey } = await client.send(
      new ScanCommand(params)
    );
    return {
      items: Items ? Items.map((item) => unmarshall(item)) : [],
      lastKey: LastEvaluatedKey,
    };
  },

  async count() {
    const params = {
      TableName: TABLE_NAME,
      Select: "COUNT",
    };

    const { Count } = await client.send(new ScanCommand(params));
    return Count || 0;
  },

  async countDistinctStudents() {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "StudentIdIndex",
      Select: "COUNT",
    };

    const { Count } = await client.send(new ScanCommand(params));
    return Count || 0;
  },

  async update(_id, updates) {
    const updateExpressions = [];
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key) => {
      if (key !== "_id" && key !== "studentId" && key !== "fileName") {
        updateExpressions.push(`${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = updates[key];
      }
    });

    const params = {
      TableName: TABLE_NAME,
      Key: marshall({ _id }),
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await client.send(new UpdateItemCommand(params));
    return Attributes ? unmarshall(Attributes) : null;
  },

  async delete(_id) {
    try {
      // First get the certificate to get the S3 file name
      const cert = await this.findById(_id);
      if (!cert) {
        throw new Error("Certificate not found");
      }

      // Delete from S3
      if (cert.fileName) {
        const s3Params = {
          Bucket: BUCKET_NAME,
          Key: cert.fileName,
        };
        await s3Client.send(new DeleteObjectCommand(s3Params));
      }

      // Delete from DynamoDB
      const params = {
        TableName: TABLE_NAME,
        Key: marshall({ _id }),
      };

      await client.send(new DeleteItemCommand(params));
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  },

  async deleteAll() {
    const { items } = await this.findAll(1, 1000);

    // Delete from S3
    const s3Deletions = items.map((item) => {
      if (item.fileName) {
        const s3Params = {
          Bucket: BUCKET_NAME,
          Key: item.fileName,
        };
        return s3Client.send(new DeleteObjectCommand(s3Params));
      }
      return Promise.resolve();
    });
    await Promise.all(s3Deletions);

    // Delete from DynamoDB
    const batchParams = {
      RequestItems: {
        [TABLE_NAME]: items.map((item) => ({
          DeleteRequest: {
            Key: marshall({ _id: item._id }),
          },
        })),
      },
    };

    await client.send(new BatchWriteItemCommand(batchParams));
    return { deletedCount: items.length };
  },

  async getDownloadUrl(_id, expiresIn = 3600) {
    const { GetObjectCommand } = require("@aws-sdk/client-s3");
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

    const cert = await this.findById(_id);
    if (!cert || !cert.fileName) {
      throw new Error("Certificate not found");
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: cert.fileName,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  },
};
