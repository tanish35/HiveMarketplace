const { PrivateKey } = require("@hiveio/dhive");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

function isValidPrivateKey(privateKeyString) {
  try {
    const privateKey = PrivateKey.fromString(privateKeyString);
    console.log("Private key is valid.");
    return true;
  } catch (error) {
    console.error("Invalid private key:", error.message);
    return false;
  }
}

// Example usage
const testKey = process.env.PRIVATE_KEY;
isValidPrivateKey(testKey);
