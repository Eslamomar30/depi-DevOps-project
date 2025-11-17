const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const multer = require("multer");
const auth = require("../middlewares/auth");
const s3Service = require("../services/s3Service");
const { v4: uuidv4 } = require("uuid");

const upload = multer({ storage: multer.memoryStorage() });
const client = require("../config/dynamodb-client");
const {
  ScanCommand,
  BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");

// GET all certificates with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { items, lastKey } = await Certificate.findAll(page, limit);
    const total = await Certificate.count();

    // Add signed URLs for each certificate
    const itemsWithUrls = await Promise.all(
      items.map(async (cert) => {
        return {
          ...cert,
          downloadUrl: await s3Service.getFileUrl(cert.fileName),
        };
      })
    );

    res.json({
      data: itemsWithUrls,
      pagination: {
        total,
        currentPage: page,
        itemsPerPage: limit,
        hasMore: !!lastKey,
      },
    });
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Upload certificates
router.post("/", auth, upload.array("certificate", 10), async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const createdCerts = [];
    for (const file of req.files) {
      try {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `certificates/${uuidv4()}.${fileExtension}`;

        // Upload returns { key, url } now
        const { key, url } = await s3Service.uploadFile(
          file.buffer,
          fileName,
          file.mimetype
        );

        const cert = await Certificate.create({
          studentId,
          fileName: key,
          certificateUrl: url, // Store the S3 URL
          mimeType: file.mimetype,
          originalName: file.originalname,
          size: file.size,
        });

        createdCerts.push(cert);
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
      }
    }

    if (createdCerts.length === 0) {
      return res.status(500).json({ message: "All file uploads failed" });
    }

    res.status(201).json(createdCerts);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET - Download certificate
router.get("/download/:id", async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const downloadUrl = await s3Service.getFileUrl(cert.fileName);
    res.redirect(downloadUrl);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE single certificate
router.delete("/:id", auth, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Delete from S3
    if (cert.fileName) {
      await s3Service.deleteFile(cert.fileName);
    }

    // Delete from DynamoDB
    await Certificate.delete(req.params.id);

    res.json({ message: "Certificate deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk delete all certificates
router.delete("/", auth, async (req, res) => {
  try {
    // Get all certificates
    const scanParams = {
      TableName: "Certificates",
      ProjectionExpression: "#id, fileName",
      ExpressionAttributeNames: {
        "#id": "_id",
      },
    };

    const scanResults = await client.send(new ScanCommand(scanParams));
    const allCertificates = scanResults.Items
      ? scanResults.Items.map((item) => unmarshall(item))
      : [];

    // Delete from S3
    const s3Deletions = allCertificates.map((cert) =>
      cert.fileName ? s3Service.deleteFile(cert.fileName) : Promise.resolve()
    );
    await Promise.all(s3Deletions);

    // Delete from DynamoDB in batches
    const chunkSize = 25;
    let processedCount = 0;

    for (let i = 0; i < allCertificates.length; i += chunkSize) {
      const chunk = allCertificates.slice(i, i + chunkSize);
      const batchParams = {
        RequestItems: {
          Certificates: chunk.map((cert) => ({
            DeleteRequest: {
              Key: marshall({ _id: cert._id }),
            },
          })),
        },
      };

      const result = await client.send(new BatchWriteItemCommand(batchParams));
      processedCount +=
        chunk.length - (result.UnprocessedItems?.Certificates?.length || 0);

      // Small delay to avoid throttling
      if (i + chunkSize < allCertificates.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    res.json({
      message: "Bulk deletion completed",
      deleted: {
        s3: allCertificates.length,
        dynamoDB: processedCount,
      },
    });
  } catch (err) {
    console.error("Bulk deletion error:", err);
    res.status(500).json({ message: "Bulk deletion failed" });
  }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const totalCerts = await Certificate.count();
    const uniqueStudents = await Certificate.countDistinctStudents();
    res.json({ totalCerts, uniqueStudents });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    const certs = await Certificate.findByStudentId(studentId);
    res.json(certs);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
