const fs = require("fs");
const { flatten } = require("flat");

function getConfig() {
  let config = {};

  try {
    const configFileData = fs.readFileSync("translate-config.json");
    config = JSON.parse(configFileData);
    if (config.locales) {
      let translations = {};
      config.locales.forEach((locale) => {
        const translationFileData = fs.readFileSync(`${locale}.json`);
        const translation = JSON.parse(translationFileData);
        translations = {
          ...translations,
          [locale]: config.flatten ? flatten(translation) : translation,
        };
      });
      fs.writeFileSync(
        config.translationsPath,
        JSON.stringify(translations, null, 2)
      );
    }
  } catch (err) {
    throw new Error(err);
  }

  const { sheetId, sheetName } = config;

  if (!sheetId || !sheetName) {
    throw new Error("Sheet details are missing in config");
  }

  return {
    tokenPath: config.tokenPath || "token.json",
    credentialsPath: config.credentialsPath || "credentials.json",
    translationsPath: config.translationsPath || "translations.json",
    sheetId,
    sheetName,
    locales: config.locales,
    flatten: config.flatten,
  };
}

module.exports = getConfig();
