const { getTranslations, syncTranslations } = require("./translate");
const { authorize } = require("./authorize");
const { log } = require("./logger");

function sync() {
  authorize()
    .then((auth) =>
      getTranslations(auth).then((translations) =>
        syncTranslations(auth, translations).then(() => {
          log("Done");
        })
      )
    )
    .catch((err) => {
      log(err);
    });
}

module.exports = {
  sync,
};
