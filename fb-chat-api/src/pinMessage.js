
'use strict';

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
  return function pinMessage(pinMode, messageID, threadID, callback) {
    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }

    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const taskLabel = pinMode ? '430' : '431';
    const queueNamePrefix = pinMode ? 'pin_msg_v2_' : 'unpin_msg_v2_';

    const taskPayload = {
      thread_key: threadID,
      message_id: messageID,
      timestamp_ms: Date.now(),
    };

    const task = {
      failure_count: null,
      label: taskLabel,
      payload: JSON.stringify(taskPayload),
      queue_name: `${queueNamePrefix}${threadID}`,
      task_id: ctx.wsTaskNumber,
    };

    const content = {
      app_id: '2220391788200892',
      payload: JSON.stringify({
        data_trace_id: null,
        epoch_id: parseInt(generateOfflineThreadingID()),
        tasks: [task],
        version_id: '25095469420099952',
      }),
      request_id: ctx.wsReqNumber,
      type: 3,
    };

    if (isCallable(callback)) {
      ctx.reqCallbacks[ctx.wsReqNumber] = callback;
    }

    ctx.mqttClient.publish('/ls_req', JSON.stringify(content), { qos: 1, retain: false });
  };
};
