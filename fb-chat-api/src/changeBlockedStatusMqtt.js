
'use strict';

const { generateOfflineThreadingID, getCurrentTimestamp, getGUID } = require('../utils.js');

function isCallable(func) {
  try {
    Reflect.apply(func, null, []);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = function (defaultFuncs, api, ctx) {
  return function changeBlockedStatusMqtt(userID, status, type, callback) {
    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }

    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const label = '334';
    let userBlockAction = 0;

    switch (type) {
      case 'messenger':
        if (status) {
          userBlockAction = 1; // Block
        } else {
          userBlockAction = 0; // Unblock
        }
        break;
      case 'facebook':
        if (status) {
          userBlockAction = 3; // Block
        } else {
          userBlockAction = 2; // Unblock
        }
        break;
      default:
        throw new Error('Invalid type');
    }

    const taskPayload = {
      blockee_id: userID,
      request_id: getGUID(),
      user_block_action: userBlockAction,
    };

    const payload = JSON.stringify(taskPayload);
    const version = '25393437286970779';

    const task = {
      failure_count: null,
      label: label,
      payload: payload,
      queue_name: 'native_sync_block',
      task_id: ctx.wsTaskNumber,
    };

    const content = {
      app_id: '2220391788200892',
      payload: JSON.stringify({
        tasks: [task],
        epoch_id: parseInt(generateOfflineThreadingID()),
        version_id: version,
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
