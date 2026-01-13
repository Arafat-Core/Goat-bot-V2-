"use_strict";

// 02-14-2025

/*
Feature: Add callback function for editMessage #6 Merged
NethWs3Dev merged 1 commit into NethWs3Dev:main from VangBanLaNhat:Pull_requests
*/

// I improved some code.
const utils = require("../utils");
module.exports = (defaultFuncs, api, ctx) => {
  return (text, messageID, callback) => {
    let reqID = ctx.wsReqNumber + 1;
    var resolveFunc = () => {};
    var rejectFunc = () => {};
    var returnPromise = new Promise((resolve, reject) => {
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
    const content = {
      app_id: '2220391788200892',
      payload: JSON.stringify({
        data_trace_id: null,
        epoch_id: parseInt(utils.generateOfflineThreadingID()),
        tasks: [{
          failure_count: null,
          label: '742',
          payload: JSON.stringify({
            message_id: messageID,
            text: text,
          }),
          queue_name: 'edit_message',
          task_id: ++ctx.wsTaskNumber,
        }],
        version_id: '6903494529735864',
      }),
      request_id: ++ctx.wsReqNumber,
      type: 3
    }
    ctx.mqttClient.publish('/ls_req', JSON.stringify(content), {
      qos: 1,
      retain: false
    });
    const handleRes = (topic, message) => {
      if (topic === "/ls_resp") {
        let jsonMsg = JSON.parse(message.toString());
        jsonMsg.payload = JSON.parse(jsonMsg.payload);
        if (jsonMsg.request_id != reqID) return;
        ctx.mqttClient.removeListener('message', handleRes);
        let msgID = jsonMsg.payload.step[1][2][2][1][2];
        let msgReplace = jsonMsg.payload.step[1][2][2][1][4];
        const bodies = {
          body: msgReplace,
          messageID: msgID
        };
        if (msgReplace != text) {
          return callback({
            error: "The message is too old or not from you!"
          }, bodies);
        }
        return callback(undefined, bodies);
      }
    }
    ctx.mqttClient.on('message', handleRes);
    return returnPromise;
  };
}