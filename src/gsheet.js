const { google } = require('googleapis');

const config = require('./config');

const sheetRange = `${config.sheetName}!A1:Z`;

function fetchSheetData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: config.sheetId,
        range: sheetRange,
      },
      (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(res.data.values);
      },
    );
  });
}

module.exports = {
  fetchSheetData,
};
