# GTranslate

GTranslate is a tool for managing static translations using Google Sheets. This helps buisness team to manage translations using sheets which can then be synced with local translation (json) files using cli command. 

# Installation:

#### Globally via `npm`

    npm install --global https://github.com/oozou/gtranslate

This will install `gtranslate` globally so that it may be run from the command line anywhere.

#### Locally via `npm`

    npm install https://github.com/oozou/gtranslate --save-dev



# Usage

### Globally
    gtranslate

### Locally (from project npm root path)
    ./node-modules/.bin/gtranslate.js
    OR
    yarn sync



# Setup

## 1. Enable Google Sheets API

- Visit [Google developers console](https://console.developers.google.com/) and create a project
- Enable Google Sheets API ( Visit Library > Google Sheets API > Enable )
- Configure OAuth consent screen
- Create "Oauth client ID" credentials for Desktop app
- Download secret file for created credentials and save it as "credentials.json" under project root

## 2. Select a Google Spreadsheet file

- Anyone with edit access to this file can update it using this package

## 3. Manage your local translations file
```
[en.json]

{
  "homepage": {
    "hello": "Hello",
    "goodMorning": "Good morning"
  }
}

[th.json]

{
  "homepage": {
    "hello": "สวัสดี",
    "goodMorning": "กริ้งมอหนูด"
  }
}
```
- For first run, setup some sample translations to be set to google sheet

## 3. Create configuration file

In the project npm root path create file "translate-config.json" 

```

{
  "translationsFile": "translations.json",
  "sheetId": "<sheetId>",
  "sheetName": "<sheetName>",
  "locales": ["th", "en"],
  "translationsPath": "src/lang"
}

```


| Key  | Description |
| ------------- | ------------- |
| `translationsFile`  | `Path to file containing translations`  |
| `sheetId`  | `Google sheet ID (Can be found in  google sheet URL)`  |
| `sheetName`  | `Google sheet Name (Can be found on the bottom left tabs under google sheet UI)`  |
| `locales`  | `(array) In case your translation file is split into multiple files (en.json, th.json)`  |
| `translationsPath`  | `(optional) Output folder of localization files`  |

## 4. First time authorization

- Run the script following steps in `Usage` section
- When running this first time, you will be prompted to visit an external url
- Copy that url, open in browser and authorize the application
- Finally, you will be prompted with a code  in browser
- Copy over the code to previous terminal
- NOTE : This will run the sync translations script as well



# Notes
- Translations in google sheet will always be prioritized
- To add a new key to translation, add it to local "translations.json" file with mock data and run the script
- To remove a key, remove keys from both sheet and local "translations.json" file and run the script
- For multiple translation files each <locale>.json will be combined and flattened to translations.json