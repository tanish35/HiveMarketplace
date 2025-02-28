const { PrivateKey } = require('@hiveio/dhive');

function isValidPrivateKey(privateKeyString) {
  try {
    const privateKey = PrivateKey.fromString(privateKeyString);
    console.log('Private key is valid.');
    return true;
  } catch (error) {
    console.error('Invalid private key:', error.message);
    return false;
  }
}

// Example usage
const testKey = '5KC3W4qRSqH5W5z63wSqfmiCSBws4D6PHbkmRu3gyqjSeSfDZ8L';
isValidPrivateKey(testKey);
