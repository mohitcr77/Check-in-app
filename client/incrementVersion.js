const fs = require('fs');

const filePath = './app.json';
const appConfig = require(filePath);

if (appConfig.android && appConfig.android.versionCode) {
  appConfig.android.versionCode += 1;
}

if (appConfig.ios && appConfig.ios.buildNumber) {
  appConfig.ios.buildNumber = `${parseInt(appConfig.ios.buildNumber) + 1}`;
}

fs.writeFileSync(filePath, JSON.stringify(appConfig, null, 2));
console.log('Version code and build number updated successfully.');
