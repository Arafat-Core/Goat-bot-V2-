"use strict";

const utils = require("../utils");
// @NethWs3Dev

module.exports = function (defaultFuncs, api, ctx) {
  return function changeBlockedStatus(userID, block, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc();
      };
    }

    defaultFuncs
      .post(
        `https://www.facebook.com/messaging/${
          block ? "" : "un"
        }block_messages/`,
        ctx.jar,
        {
          fbid: userID,
        },
      )
      .then(utils.saveCookies(ctx.jar))
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch(function (err) {
        utils.error("changeBlockedStatus", err);
        return callback(err);
      });
    return returnPromise;
  };
};
