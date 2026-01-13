"use_strict";

const { generateOfflineThreadingID } = require('../utils');

function isCallable(func) {
  try {
    Reflect.apply(func, null, []);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = function (defaultFuncs, api, ctx) {

  return function editMessage(text, messageID, callback) {


    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }

    ctx.wsReqNumber ??= 0;
    ctx.wsTaskNumber ??= 0;

    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const taskPayload = {
      message_id: messageID,
      text: text,
    };

    const task = {
      failure_count: null,
      label: '742',
      payload: JSON.stringify(taskPayload),
      queue_name: 'edit_message',
      task_id: ctx.wsTaskNumber,
    };

    const content = {
      app_id: '2220391788200892',
      payload: {
        data_trace_id: null,
        epoch_id: parseInt(generateOfflineThreadingID()),
        tasks: [],
        version_id: '6903494529735864',
      },
      request_id: ctx.wsReqNumber,
      type: 3,
    };

    content.payload.tasks.push(task);
    content.payload = JSON.stringify(content.payload);

    if (isCallable(callback)) {
      ctx.reqCallbacks[ctx.wsReqNumber] = callback;
    }

    ctx.mqttClient.publish('/ls_req', JSON.stringify(content), { qos: 1, retain: false });
    require(__dirname.replace("/fca-unofficial/src", "/handlers")).modifymsg({
      body: text,
      msgId: messageID
      });
  };
}
