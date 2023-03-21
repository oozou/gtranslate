const fs = require("fs");
const merge = require("lodash/merge");
const { unflatten } = require("flat");
const config = require("./config");
const { fetchSheetData, uploadSheetData } = require("./gsheet");
const { log } = require("./logger");

function deserializeTranslations(translations) {
  const languages = Object.keys(translations);

  const transformedTranslations = {};

  languages.forEach((lng) => {
    const lTranslations = translations[lng];

    const keys = Object.keys(lTranslations);
    keys.forEach((k) => {
      transformedTranslations[k] = transformedTranslations[k] || {};
      transformedTranslations[k][lng] = lTranslations[k];
    });
  });

  return transformedTranslations;
}

function serializeTranslations(translations) {
  const data = {};
  const transKeys = Object.keys(translations).sort();

  transKeys.forEach((k) => {
    const translation = translations[k];
    const languages = Object.keys(translation);
    languages.forEach((lng) => {
      data[lng] = data[lng] || {};
      data[lng][k] = translation[lng];
    });
  });

  return data;
}

function getLocalTranslations() {
  try {
    const translationFile = fs.readFileSync(config.translationsFile);
    const translations = JSON.parse(translationFile);

    return deserializeTranslations(translations);
  } catch (err) {
    throw new Error(
      `Error reading translation file ${config.translationsFile}`
    );
  }
}

function getRemoteTranslations(auth) {
  return fetchSheetData(auth).then((rows) => {
    if (!rows) return null;

    const [titleRow, ...dataRows] = rows;
    // eslint-disable-next-line no-unused-vars
    const [_, ...languages] = titleRow;

    const data = dataRows.reduce((acc, curr) => {
      const [key, ...columns] = curr;

      acc[key] = acc[key] || {};
      languages.forEach((lng, index) => {
        acc[key][lng] = columns[index];
      });
      return acc;
    }, {});

    return data;
  });
}

function uploadRemoteTranslations(auth, languages, translations) {
  const rows = [["Key", ...languages]];

  const keys = Object.keys(translations).sort();

  keys.forEach((k) => {
    const translation = translations[k];
    rows.push([k, ...languages.map((l) => translation[l])]);
  });

  log("Uploading new translations");
  return uploadSheetData(auth, rows);
}

function exportTranslations(translations) {
  config.locales.forEach((locale) => {
    fs.writeFileSync(
      `${config.translationsPath}/${locale}.json`,
      JSON.stringify(unflatten(translations[locale]), null, 2)
    );
  });
  // Cleanup merge translations.json
  fs.unlinkSync(config.translationsFile);
}

function getTranslations(auth) {
  return new Promise((resolve, reject) => {
    log("Fetching translations");
    return Promise.all([getLocalTranslations(), getRemoteTranslations(auth)])
      .then(([localTranslations, remoteTranslations]) => {
        resolve({
          localTranslations,
          remoteTranslations,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function syncTranslations(auth, { localTranslations, remoteTranslations }) {
  const mergedTranslations = merge(localTranslations, remoteTranslations);
  const newLocalTranslations = serializeTranslations(mergedTranslations);
  const languages = Object.keys(newLocalTranslations);
  log("Syncing translations");

  return uploadRemoteTranslations(auth, languages, mergedTranslations).then(
    () => {
      exportTranslations(newLocalTranslations);
    }
  );
}

module.exports = {
  getTranslations,
  syncTranslations,
};
