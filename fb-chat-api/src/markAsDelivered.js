"use strict";

const utils = require("../utils");
// @NethWs3Dev

module.exports = function (defaultFuncs, api, ctx) {
  return function markAsDelivered(threadID, messageID, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, friendList) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(friendList);
      };
    }

    if (!threadID || !messageID) {
      return callback("Error: messageID or threadID is not defined");
    }

    const form = {};

    form["message_ids[0]"] = messageID;
    form["thread_ids[" + threadID + "][0]"] = messageID;

    defaultFuncs
      .post(
        "https://www.facebook.com/ajax/mercury/delivery_receipts.php",
        ctx.jar,
        form,
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
        utils.error("markAsDelivered", err);
        return callback(err);
      });

    return returnPromise;
  };
};
