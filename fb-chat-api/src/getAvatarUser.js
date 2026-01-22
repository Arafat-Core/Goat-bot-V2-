"use strict";

var utils = require('../utils');

// Facebook App Token (APP_ID|APP_SECRET)
const APP_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = function (defaultFuncs, api, ctx) {

  function handleAvatar(userIDs, height, width) {
    let cb;
    const uploads = [];

    const rtPromise = new Promise((resolve, reject) => {
      cb = (err, data) => data ? resolve(data) : reject(err);
    });

    userIDs.forEach(id => {
      const url = `https://graph.facebook.com/${id}/picture?width=${width}&height=${height}&access_token=${APP_TOKEN}`;

      const p = defaultFuncs
        .get(url, ctx.jar)
        .then(() => {
          return {
            userID: id,
            url
          };
        })
        .catch(err => cb(err));

      uploads.push(p);
    });

    Promise.all(uploads)
      .then(res => {
        cb(null, res.reduce((o, { userID, url }) => {
          o[userID] = url;
          return o;
        }, {}));
      })
      .catch(err => cb(err));

    return rtPromise;
  }

  return function getAvatarUser(userIDs, size = [1500, 1500], callback) {
    let cb;

    const rtPromise = new Promise((resolve, reject) => {
      cb = (err, res) => res ? resolve(res) : reject(err);
    });

    if (typeof size === 'function') {
      callback = size;
      size = [1500, 1500];
    }

    if (!Array.isArray(userIDs)) userIDs = [userIDs];

    const [height, width] = Array.isArray(size)
      ? size.length === 1 ? [size[0], size[0]] : size
      : [size, size];

    if (typeof callback === 'function') cb = callback;

    handleAvatar(userIDs, height, width)
      .then(res => cb(null, res))
      .catch(err => {
        utils.error('getAvatarUser', err);
        cb(err);
      });

    return rtPromise;
  };
};
