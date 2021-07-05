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
  const transKeys = Object.keys(translations);

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
    const translationFile = fs.readFileSync(config.translationsPath);
    const translations = JSON.parse(translationFile);

    return deserializeTranslations(translations);
  } catch (err) {
    throw new Error(
      `Error reading translation file ${config.translationsPath}`
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

  const keys = Object.keys(translations);

  keys.forEach((k) => {
    const translation = translations[k];
    rows.push([k, ...languages.map((l) => translation[l])]);
  });

  log("Uploading new translations");
  return uploadSheetData(auth, rows);
}

function exportTranslations(translations) {
  if (config.locales) {
    config.locales.forEach((locale) => {
      fs.writeFileSync(
        `${locale}.json`,
        JSON.stringify(
          config.flatten
            ? unflatten(translations[locale])
            : translations[locale],
          null,
          2
        )
      );
    });
  } else {
    fs.writeFileSync(
      config.translationsPath,
      JSON.stringify(translations, null, 2)
    );
  }
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
