const fs = require('fs');

const config = require('./config');
const { fetchSheetData } = require('./gsheet');
const { log } = require('./logger');

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

function getLocalTranslations() {
  try {
    const translationFile = fs.readFileSync(config.translationsPath);
    const translations = JSON.parse(translationFile);

    return deserializeTranslations(translations);
  } catch (err) {
    throw new Error(
      `Error reading translation file ${config.translationsPath}`,
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

function getTranslations(auth) {
  return new Promise((resolve, reject) => {
    log('Fetching translations');
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

module.exports = {
  getTranslations,
};
