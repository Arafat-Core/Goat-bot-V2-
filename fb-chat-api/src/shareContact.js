/* eslint-disable linebreak-style */
"use strict";

// fixed by kenneth panio

var utils = require("../utils");

module.exports = function(defaultFuncs, api, ctx) {
  return function shareContact(text, senderID, threadID, callback) {
    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }

    ctx.wsReqNumber ??= 0;
    ctx.wsTaskNumber ??= 0;

    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const queryPayload = {
      contact_id: senderID,
      sync_group: 1,
      text: text || "",
      thread_id: threadID
    };

    const query = {
      failure_count: null,
      label: '359',
      payload: JSON.stringify(queryPayload),
      queue_name: 'messenger_contact_sharing',//xma_open_contact_share
      task_id: Math.random() * 1001 << 0,
    };

    const context = {
      app_id: '2220391788200892',
      payload: {
        tasks: [query],
        epoch_id: utils.generateOfflineThreadingID(),
        version_id: '7214102258676893',
      },
      request_id: ctx.wsReqNumber,
      type: 3,
    };

    context.payload = JSON.stringify(context.payload);

    if (typeof callback === 'function') {
      ctx.callback_Task[ctx.wsReqNumber] = { callback, type: "shareContact" };
    }

    ctx.mqttClient.publish('/ls_req', JSON.stringify(context), { qos: 1, retain: false });
  };
};

/*"use strict";


var utils = require("../utils");

// @NethWs3Dev


module.exports = function (defaultFuncs, api, ctx) {
	return async function shareContact(text, senderID, threadID, callback) {
await utils.parseAndCheckLogin(ctx, defaultFuncs);
        const mqttClient = ctx.mqttClient;

        if (!mqttClient) {
            throw new Error("Not connected to MQTT");
        }
		var resolveFunc = function () { };
		var rejectFunc = function () { };
		var returnPromise = new Promise(function (resolve, reject) {
			resolveFunc = resolve;
			rejectFunc = reject;
		});
		if (!callback) {
			callback = function (err, data) {
				if (err) return rejectFunc(err);
				resolveFunc(data);
	data		};
		}
		let count_req = 0
		var form = JSON.stringify({
						"app_id": "2220391788200892",
						"payload": JSON.stringify({
								tasks: [{
										label: '359',
										payload: JSON.stringify({
											"contact_id": senderID,
											"sync_group": 1,
											"text": text || "",
											"thread_id": threadID
										}),
										queue_name: 'messenger_contact_sharing',
										task_id: Math.random() * 1001 << 0,
										failure_count: null,
								}],
								epoch_id: utils.generateOfflineThreadingID(),
								version_id: '7214102258676893',
						}),
						"request_id": ++count_req,
						"type": 3
				});
		mqttClient.publish('/ls_req',form)

		return returnPromise;
	};
};*/