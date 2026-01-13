'use strict';

var utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx) {
  return function getAccess(authCode = '', callback) {
    var cb;
    var url = 'https://business.facebook.com/';
    var Referer = url + 'security/twofactor/reauth/?twofac_next=' + encodeURIComponent(url + 'content_management') + '&type=avoid_bypass&app_id=0&save_device=0';
    var rt = new Promise(function (resolve, reject) {
      cb = (error, token) => token ? resolve(token) : reject(error);
    });

    if (typeof authCode == 'function') {
      callback = authCode;
      authCode = '';
    }
    if (typeof callback == 'function') cb = callback;
    if (!!ctx.access_token) 
      cb(null, ctx.access_token);
    else 
      utils
        .get(url + 'content_management', ctx.jar, null, ctx.globalOptions, null, {
          noRef: true,
          Origin: url
        })
        .then(function (res) {
          var html = res.body;
          var lsd = utils.getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
          return lsd;
        })
        .then(function (lsd) {
          function submitCode(code) {
            var pCb;
            var rtPromise = new Promise(function (resolve) {
              pCb = (error, token) => resolve(cb(error, token));
            });
            if (typeof code != 'string')
              pCb({
                error: 'submitCode',
                lerror: 'code must be string',
                continue: submitCode
              });
            else 
              defaultFuncs
                .post(url + 'security/twofactor/reauth/enter/', ctx.jar, {
                  approvals_code: code,
                  save_device: true,
                  lsd 
                }, ctx.globalOptions, null, {
                  Referer,
                  Origin: url
                })
                .then(function (res) {
                  var { payload } = JSON.parse(res.body.split(';').pop() || '{}');
                  if (payload && !payload.codeConfirmed)
                    throw {
                      error: 'submitCode',
                      lerror: payload.message,
                      continue: submitCode
                    }
                  
                  return;
                })
                .then(function () {
                  return utils
                    .get(url + 'content_management', ctx.jar, null, ctx.globalOptions, null, { noRef: true })
                    .then(function (res) {
                      var html = res.body;
                      var token = /"accessToken":"(\S+)","clientID":/g.exec(html);

                      return [html, token];
                    });
                })
                .then(function (res) {
                  if (!res[1]) 
                    throw {
                      error: 'token-undefined',
                      htmlData: res[0]
                    }
                  ctx.access_token = res[1][1];                      
                  return pCb(null, res[1][1]);
                })
                .catch(function (err) {
                  utils.error('getAccess', err.error || err);
                  return pCb(err);
                });
    
            return rtPromise;
          }

          if (authCode.length == 6 && !isNaN(authCode)) 
            submitCode(authCode.toString());
          else if (typeof callback == 'function') 
            throw {
              error: 'submitCode',
              continue: submitCode
            }
          else 
            throw {
              error: 'authentication code must be string or number or callback must be a function to continue'
            }
        })
        .catch(function (err) {
          utils.error('getAccess', typeof callback == 'function' ? (err.error || err) : err);
          return cb(err);
        });

    return rt;
  }
}
