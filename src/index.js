const { authorize } = require('./authorize');
const { log } = require('./logger');

function sync() {
  authorize()
    .then((auth) => {
      log('Authorized', auth);
    })
    .catch((err) => {
      log(err);
    });
}

module.exports = {
  sync,
};
