const fs = require("fs");
const { flatten } = require("flat");

function getConfig() {
  let config = {};

  try {
    const configFileData = fs.readFileSync("translate-config.json");
    config = JSON.parse(configFileData);

    let translations = {};
    config.locales.forEach((locale) => {
      const translationFileData = fs.readFileSync(
        `${config.translationsPath || "."}/${locale}.json`
      );
      const translation = JSON.parse(translationFileData);
      translations = {
        ...translations,
        [locale]: flatten(translation),
      };
    });

    fs.writeFileSync(
      config.translationsFile,
      JSON.stringify(translations, null, 2)
    );
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
    translationsFile: config.translationsFile || "translations.json",
    sheetId,
    sheetName,
    locales: config.locales,
    translationsPath: config.translationsPath || ".",
  };
}

module.exports = getConfig();
