"use strict";

const utils = require("../utils");
// @NethWs3Dev

module.exports = function (defaultFuncs, api, ctx) {
  return function handleFriendRequest(userID, accept, callback) {
    if (utils.getType(accept) !== "Boolean") {
      throw {
        error: "Please pass a boolean as a second argument.",
      };
    }

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

    const form = {
      viewer_id: ctx.userID,
      "frefs[0]": "jwl",
      floc: "friend_center_requests",
      ref: "/reqs.php",
      action: accept ? "confirm" : "reject",
    };

    defaultFuncs
      .post("https://www.facebook.com/requests/friends/ajax/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.err) {
          throw {
            err: resData.err
          };
        }

        return callback();
      })
      .catch(function (err) {
        utils.error("handleFriendRequest", err);
        return callback(err);
      });

    return returnPromise;
  };
};
