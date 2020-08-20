const { getTranslations } = require('./translate');
const { authorize } = require('./authorize');
const { log } = require('./logger');

function sync() {
  authorize()
    .then((auth) => getTranslations(auth).then((translations) => {
      log(translations);
    }))
    .catch((err) => {
      log(err);
    });
}

module.exports = {
  sync,
};
