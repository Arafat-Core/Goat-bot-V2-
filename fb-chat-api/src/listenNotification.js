'use strict';

var utils = require('../utils');
//NethWs3Dev
var EventEmitter = require('node:events');

function format(res, globalCallback) {
  var checkMinutes = (date_1, date_2) => {
    let ms_1 = date_1.getTime();
    let ms_2 = date_2.getTime();
    return Math.ceil((ms_2 - ms_1) / (60 * 1000));
  }

  for (let index of res.notifications_page.edges) {
    if (index.node.row_type !== 'NOTIFICATION') continue;

    var timestamp = index.node.notif.creation_time.timestamp;
    if (checkMinutes(new Date(timestamp * 1000), new Date()) <= 1) 
      globalCallback(null, {
        id: res.node.notif.id,
        noti_id: res.node.notif.notif_id,
        body: index.node.notif.body.text,
        url: index.node.notif.url,
        timestamp: timestamp * 1000
      });
  }
}

module.exports = function (defaultFuncs, api, ctx) {
  let globalCallback, interval;

  function MessageRepeat() {
    interval = setInterval(function () {
      return defaultFuncs
        .post('https://www.facebook.com/api/graphql/', ctx.jar, {
          fb_api_req_friendly_name: 'CometNotificationsRootQuery',
          doc_id: 6663491207045267,
          variables: JSON.stringify({
            count: 5,
            environment: 'MAIN_SURFACE',
            filter_tokens: ['Cg8CZnQPA2FsbAE='],
            scale: 1
          }),
          server_timestamps: !0
        })
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then(function (res) {
          if (res.error || res.errors) 
            throw res;

          return format(res.data.viewer, globalCallback);
        })
        .catch(function (err) {
          utils.error('listenNotification', err);
          clearInterval(interval);
          interval = void 0;
          return globalCallback(err);
        });
    }, 60 * 1000);
  }

  return function notification(callback) {
    class MessageEmitter extends EventEmitter {
      stop() {
        globalCallback = () => {}

        if (interval) {
          clearInterval(interval);
          interval = void 0;
        }
        Message.emit('stop', new Date());
      }
    }

    var Message = new MessageEmitter();

    if (typeof callback == 'function')
      globalCallback = callback;
    else 
      globalCallback = (error, message) => error ? Message.emit('error', error) : Message.emit('message', message);

    MessageRepeat();
    return Message;
  }
}
