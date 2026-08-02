const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const buildFilePath = path.join(publicDir, 'build.json');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const buildInfo = {
  timestamp: Date.now(),
  date: new Date().toISOString()
};

fs.writeFileSync(buildFilePath, JSON.stringify(buildInfo, null, 2));
console.log('Build version generated:', buildInfo.date);
