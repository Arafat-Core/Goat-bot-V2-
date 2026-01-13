/* eslint-disable linebreak-style */
"use strict";

const axios = require('axios');
const FormData = require('form-data');
const { URL } = require('url');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
  return function getUID(link, callback) {
    let resolveFunc = function () { };
    let rejectFunc = function () { };
    let returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, uid) {
        if (err) return rejectFunc(err);
        resolveFunc(uid);
      };
    }

    async function getUIDFast(url) {
      let Form = new FormData();
      let Url = new URL(url);
      Form.append('link', Url.href);
      try {
        let { data } = await axios.post('https://id.traodoisub.com/api.php', Form, {
          headers: Form.getHeaders()
        });
        if (data.error) throw new Error(data.error);
        return data.id || "Not found";
      } catch (e) {
        utils.error('getUID', "Error: " + e.message);
        throw new Error(e.message);
      }
    }

    async function getUIDSlow(url) {
      let Form = new FormData();
      let Url = new URL(url);
      Form.append('username', Url.pathname.replace(/\//g, ""));
      try {
        const userAgentArray = [
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
          "Mozilla/5.0 (Linux; Android 10; SM-G977N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:45.0) Gecko/20100101 Firefox/45.0",
          "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; GT-I9505 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.2 Mobile/15E148 Safari/604.1",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7",
          "Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
          "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8",
          "Mozilla/5.0 (Linux; Android 7.0; SM-G930F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36",
          "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.3",
        ];
        
        const randomUserAgent = userAgentArray[Math.floor(Math.random() * userAgentArray.length)];
        let { data } = await axios.post('https://api.findids.net/api/get-uid-from-username', Form, {
          headers: {
            'User-Agent': randomUserAgent,
            ...Form.getHeaders()
          }
        });
        if (data.status !== 200) throw new Error('Error occurred!');
        if (typeof data.error === 'string') throw new Error(data.error);
        return data.data.id || "Not found";
      } catch (e) {
        utils.error('getUID', "Error: " + e.message);
        throw new Error(e.message);
      }
    }

    async function getUID(url) {
      try {
        let uid = await getUIDFast(url);
        if (!isNaN(uid)) return uid;
        uid = await getUIDSlow(url);
        if (!isNaN(uid)) return uid;
        throw new Error("Unable to retrieve UID");
      } catch (e) {
        utils.error('getUID', "Error: " + e.message);
        throw new Error(e.message);
      }
    }

    try {
      let Link = String(link);
      if (Link.includes('facebook.com') || Link.includes('Facebook.com') || Link.includes('fb')) {
        let LinkSplit = Link.split('/');
        if (LinkSplit.indexOf("https:") == 0) {
          if (!isNaN(LinkSplit[3]) && !Link.split('=')[1] && !isNaN(Link.split('=')[1])) {
            throw new Error('Invalid link format. The correct format should be: facebook.com/username');
          } else if (!isNaN(Link.split('=')[1]) && Link.split('=')[1]) {
            let Format = `https://www.facebook.com/profile.php?id=${Link.split('=')[1]}`;
            getUID(Format).then(data => callback(null, data)).catch(err => callback(err));
          } else {
            getUID(Link).then(data => callback(null, data)).catch(err => callback(err));
          }
        } else {
          let Form = `https://www.facebook.com/${LinkSplit[1]}`;
          getUID(Form).then(data => callback(null, data)).catch(err => callback(err));
        }
      } else {
        throw new Error('Invalid link. The link should be a Facebook link.');
      }
    } catch (e) {
      utils.error('getUID', "Error: " + e.message);
      return callback(null, e);
    }
    return returnPromise;
  };
};

//modified by kenneth panio

