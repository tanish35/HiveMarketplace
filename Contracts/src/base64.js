const fs = require('fs');

const filePath = './Marketplace.js';
const encodedCode = Buffer.from(fs.readFileSync(filePath)).toString('base64');
console.log(encodedCode);
