const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const config = require('./config');
const { log } = require('./logger');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    log('\nAuthorize this app by visiting this url: \n', authUrl, '\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();

      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          reject(new Error('There was an error using that code. Please try again'));
          return;
        }

        oAuth2Client.setCredentials(token);

        fs.writeFileSync(config.tokenPath, JSON.stringify(token));
        log('Authorization token saved for future usage');

        resolve(token);
      });
    });
  });
}

function authorize() {
  log('Authorizing google sheet credentials');

  return new Promise((resolve, reject) => {
    const credentialsFileData = fs.readFileSync(config.credentialsPath);
    const credentials = JSON.parse(credentialsFileData);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    try {
      const tokenFileData = fs.readFileSync(config.tokenPath);
      const token = JSON.parse(tokenFileData);
      oAuth2Client.setCredentials(token);

      log('Using saved authorization token');

      resolve(oAuth2Client);
      return;
    } catch (err) {
      log('Existing token was not found');

      getNewToken(oAuth2Client)
        .then((token) => {
          oAuth2Client.setCredentials(token);

          resolve(oAuth2Client);
        })
        .catch((tokenErr) => {
          reject(tokenErr);
        });
    }
  });
}

module.exports = {
  authorize,
  getNewToken,
};
