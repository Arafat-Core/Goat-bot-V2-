'use strict';

var utils = require('../utils.js');
//NethWs3Dev

module.exports = function(defaultFuncs, api, ctx) {
  return function setStoryReaction(storyID, react, callback) {
    var cb;
    var returnPromise = new Promise(function(resolve, reject) {
      cb = error => error ? reject(error) : resolve();
    });

    if (typeof react == 'function') {
      callback = react;
      react = 1;
    }
    if (typeof callback == 'function') cb = callback;
    if (typeof Number(react) != 'number') react = 1;

    var map = {
      1: '👍',
      2: '❤️',
      3: '🤗',
      4: '😆',
      5: '😮',
      6: '😢',
      7: '😡'
    }
    var form = {
      fb_api_req_friendly_name: 'useStoriesSendReplyMutation',
      variables: JSON.stringify({
        input: {
          attribution_id_v2: `StoriesCometSuspenseRoot.react,comet.stories.viewer,unexpected,${Date.now()},538296,,;CometHomeRoot.react,comet.home,via_cold_start,${Date.now()},850302,4748854339,`,
          lightweight_reaction_actions: {
            offsets: [0],
            reaction: map[react] || map[1]
          },
          message: map[react] || map[1],
          story_id: storyID,
          story_reply_type: "LIGHT_WEIGHT",
          actor_id: ctx.userID,
          client_mutation_id: String(parseInt(Math.random() * 16))
        }
      }),
      doc_id: '4826141330837571'
    }

    defaultFuncs
      .post('https://www.facebook.com/api/graphql/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(res) {
        if (res.errors) throw res;
        return cb();
      })
      .catch(function(err) {
        utils.error('setPostReaction', err);
        return cb(err);
      });

    return returnPromise;
  }
}

//new update version 1.0.9