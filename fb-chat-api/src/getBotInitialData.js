"use strict";

const utils = require("../utils");
// @NethWs3Dev

module.exports = (defaultFuncs, api, ctx) => {
  return async (callback) => {
  let resolveFunc = () => {};
  let rejectFunc = () => {};
  const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
  });
  if (!callback) {
      callback = (err, data) => {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
  }
  utils.log("Fetching account info...");
  api.httpGet(`https://www.facebook.com/profile.php?id=${ctx.userID}`, null, {
    customUserAgent: utils.windowsUserAgent
  }, (err, data) => {
      if (err) throw err;
      const profileMatch = data.match(/"CurrentUserInitialData",\[\],\{(.*?)\},(.*?)\]/);
      if (profileMatch && profileMatch[1]){
        const accountJson = JSON.parse(`{${profileMatch[1]}}`);
        accountJson.name = accountJson.NAME;
        accountJson.uid = accountJson.USER_ID;
        delete accountJson.NAME;
        delete accountJson.USER_ID;
        return callback(null, {
          ...accountJson
      });
      } else return callback(null, { error: "Something went wrong. Maybe its possible that it has a limitation due to spam requests. You can try again later." });
  }, true);
  return returnPromise;
  };
};
 
 