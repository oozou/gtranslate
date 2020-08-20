const fs = require('fs');

function getConfig() {
  let config = {};

  try {
    const configFileData = fs.readFileSync('translate-config.json');
    config = JSON.parse(configFileData);
  } catch (err) {
    throw new Error('Invalid configuration file "translate-config.json"');
  }

  const { sheetId, sheetName } = config;

  if (!sheetId || !sheetName) {
    throw new Error('Sheet details are missing in config');
  }

  return {
    tokenPath: config.tokenPath || 'token.json',
    credentialsPath: config.credentialsPath || 'credentials.json',
    translationsPath: config.translationsPath || 'translations.json',
    sheetId,
    sheetName,
  };
}

module.exports = getConfig();
