"use strict";

const utils = require("../utils");
// @NethWs3Dev
module.exports = (defaultFuncs, api, ctx) => {
  return (guard, callback = () => {}) => {
    if (utils.getType(guard) !== "Boolean") {
      throw {
        error: "Please pass a boolean as a second argument.",
      };
    }
    const uid = ctx.userID;
    const form = {
      av: uid,
      variables: JSON.stringify({
        input: {
          is_shielded: guard ? true : false,
          actor_id: uid,
          client_mutation_id: "1"
        },
        scale: 1
      }),
      doc_id: "1477043292367183",
      fb_api_req_friendly_name: "IsShieldedSetMutation",
      fb_api_caller_class: "IsShieldedSetMutation"
    }

    return defaultFuncs
      .post("https://www.facebook.com/api/graphql", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(resData) {
        if (resData.err) {
          throw {
            err: resData.err
          };
        }
        return callback();
      })
      .catch(err => {
        utils.error("setProfileGuard", err);
        return callback(err);
      });;
  };
};