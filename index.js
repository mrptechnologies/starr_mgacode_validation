const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Decryption function
function decryptApiKey(encryptedApiKey, decryptionKey) {
  const decipher = crypto.createDecipher("aes256", decryptionKey);
  let decrypted = decipher.update(encryptedApiKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Endpoint: /travel/v1/security/validateprovider
app.post("/travel/v1/security/validateprovider", (req, res) => {
  // Validate API Key
  const { ApiKey: apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    return res.status(400).json({
      IsSuccess: false,
      IsValid: false,
      MGACode: "",
      Errors: [{ message: "Api Key is missing or invalid." }],
    });
  }

  // Decrypt the API Key
  const decryptionKey = "1234"; // Decryption key
  let decryptedApiKey;
  try {
    decryptedApiKey = decryptApiKey(apiKey, decryptionKey);
  } catch (error) {
    return res.status(400).json({
      IsSuccess: false,
      IsValid: false,
      MGACode: "",
      Errors: [{ message: "Failed to decrypt the API key." }],
    });
  }

  // Check if the decrypted value falls within the range of 1000 to 9999
  const decryptedValue = parseInt(decryptedApiKey);
  if (decryptedValue == 1234) {
    // Invalid Key Response
    return res.json({
      IsSuccess: false,
      IsValid: false,
      MGACode: "",
      Errors: [
        {
          code: 1234,
          field: "Field123",
          message:
            "Unexpected error occured. This error has been logged. Please forward the error information to the Starr development team.",
          module: "Module123",
        },
      ],
    });
  } else if (decryptedValue >= 1000 && decryptedValue <= 9999) {
    // Valid Key Response
    return res.json({
      IsSuccess: true,
      IsValid: true,
      MGACode: decryptedValue,
      Errors: null,
    });
  } else {
    // Invalid Key Response
    return res.json({
      IsSuccess: true,
      IsValid: false,
      MGACode: "",
      Errors: null,
    });
  }
});

// Encryption function
function encryptValue(value, encryptionKey) {
  const cipher = crypto.createCipher("aes256", encryptionKey);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Endpoint: /travel/v1/security/encrypt
app.post("/travel/v1/security/encrypt", (req, res) => {
  // Validate request body
  const { value } = req.body;
  if (!value || typeof value !== "string" || value.trim() === "") {
    return res.status(400).json({
      IsSuccess: false,
      Errors: [{ message: "Value to encrypt is missing or invalid." }],
    });
  }

  // Encrypt the value
  const encryptionKey = "1234"; // Encryption key
  const encryptedValue = encryptValue(value, encryptionKey);

  return res.json({
    IsSuccess: true,
    EncryptedValue: encryptedValue,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
