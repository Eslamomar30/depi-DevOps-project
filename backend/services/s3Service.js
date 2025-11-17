const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage"); // Add this import
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.S3_CERTIFICATES_BUCKET;

module.exports = {
  async uploadFile(buffer, fileName, mimetype) {
    try {
      // Using Upload from @aws-sdk/lib-storage for better stream handling
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: mimetype,
        },
        partSize: 5 * 1024 * 1024, // 5MB chunks
      });

      await parallelUploads3.done();

      // Return both the S3 key and public URL
      return {
        key: fileName,
        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
      };
    } catch (error) {
      console.error("Upload error details:", {
        bucket: BUCKET_NAME,
        fileName,
        error: error.message,
      });
      throw error;
    }
  },

  async deleteFile(fileName) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    };
    await s3Client.send(new DeleteObjectCommand(params));
  },

  async getFileUrl(fileName, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
  },
};
