"use strict";

/**
 * Author @YanMaglinte
 * https://github.com/YANDEVA
 * 
 * Example:
 * api.follow("100090794779367", true); // Set true to follow, false if otherwise.
 */
 
 //Fixed by Neth

module.exports = function (defaultFuncs, api, ctx) {
  return function follow(senderID, boolean, callback) {
    /*if (!ctx.mqttClient) {
      throw new Error("Not connected to MQTT");
    }*/
    let form;
    if (boolean) {
      form = {
        av: ctx.userID,
        fb_api_req_friendly_name: "CometUserFollowMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "25472099855769847",
        variables: JSON.stringify({
          input: {
            attribution_id_v2:
              "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,via_cold_start,1717249218695,723451,250100865708545,,",
            is_tracking_encrypted: true,
            subscribe_location: "PROFILE",
            subscribee_id: senderID,
            tracking: null,
            actor_id: ctx.userID,
            client_mutation_id: "1",
          },
          scale: 1,
        }),
      };
    } else {
      form = {
        av: ctx.userID,
        fb_api_req_friendly_name: "CometUserUnfollowMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "25472099855769847",
        variables: JSON.stringify({
          action_render_location: "WWW_COMET_FRIEND_MENU",
          input: {
            attribution_id_v2:
              "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,tap_search_bar,1717294006136,602597,250100865708545,,",
            is_tracking_encrypted: true,
            subscribe_location: "PROFILE",
            tracking: null,
            unsubscribee_id: senderID,
            actor_id: ctx.userID,
            client_mutation_id: "10",
          },
          scale: 1,
        }),
      };
    }

    api.httpPost("https://www.facebook.com/api/graphql/", form, (err, data) => {
      if (err) {
        if (typeof callback === "function") {
          callback(err);
        }
      } else {
        if (typeof callback === "function") {
          callback(null, data);
        }
      }
    });
  };
};