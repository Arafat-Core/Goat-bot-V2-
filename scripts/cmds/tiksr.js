const axios = require("axios");

let FONT_CACHE = null;

async function loadFont() {
  if (FONT_CACHE) return FONT_CACHE;
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json"
  );
  FONT_CACHE = data;
  return FONT_CACHE;
}

function fontify(text, font) {
  return text
    .split("")
    .map(ch => font[ch] || ch)
    .join("");
}

async function loadApi() {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json"
  );
  return data.api;
}

async function getStream(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

module.exports = {
  config: {
    name: "tiksr",
    version: "1.4",
    author: "Arafat",
    role: 0,
    description: {
      en: "TikTok search (video / audio) with reply select"
    },
    category: "media",
    guide: {
      en:
        "{pn} <keyword> → video\n" +
        "{pn} -a <keyword> → audio"
    }
  },

  onStart: async ({ api, args, event, commandName }) => {
    try {
      let mode = "video";
      if (args[0] === "-a") {
        mode = "audio";
        args.shift();
      }

      const keyword = args.join(" ");
      if (!keyword)
        return api.sendMessage(
          "❌ Use:\n#tiksr goku\n#tiksr -a goku",
          event.threadID,
          event.messageID
        );

      const BASE_API = await loadApi();
      const font = await loadFont();

      const res = await axios.get(`${BASE_API}/tiksr`, {
        params: { key: keyword }
      });

      const { token, list } = res.data || {};
      if (!list || !list.length)
        return api.sendMessage("❌ No result found", event.threadID);

      const items = list.slice(0, 10);
      const attachments = [];

      let body =
        mode === "audio"
          ? fontify("🎧 TIKTOK AUDIO SEARCH\n\n", font)
          : fontify("🎬 TIKTOK VIDEO SEARCH\n\n", font);

      for (const v of items) {
        body +=
          fontify(`${v.no}. `, font) +
          fontify(v.title.slice(0, 45), font) +
          "\n";

        try {
          attachments.push(await getStream(v.photo));
        } catch {}
      }

      body += "\n" + fontify("Reply with a number like 1, 2, 3", font);

      api.sendMessage(
        { body, attachment: attachments },
        event.threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "tiksr",
              author: event.senderID,
              token,
              mode,
              messageID: info.messageID
            });
          }
        },
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Failed to load TikTok list", event.threadID);
    }
  },

  onReply: async ({ api, event, Reply }) => {
    try {
      if (Reply.commandName !== "tiksr") return;
      if (event.senderID !== Reply.author) return;

      const n = parseInt(event.body);
      if (isNaN(n) || n < 1 || n > 10)
        return api.sendMessage(
          "❌ Reply with number Bby",
          event.threadID,
          event.messageID
        );

      const BASE_API = await loadApi();
      const font = await loadFont();

      const res = await axios.get(`${BASE_API}/tiksrselect`, {
        params: {
          token: Reply.token,
          n
        }
      });

      const { title, video, music } = res.data || {};

      try {
        await api.unsendMessage(Reply.messageID);
      } catch {}

      if (Reply.mode === "audio") {
        if (!music)
          return api.sendMessage("❌ Audio not found", event.threadID);

        return api.sendMessage(
          {
            body: fontify(title?.slice(0, 200) || "TikTok Audio", font),
            attachment: await getStream(music)
          },
          event.threadID,
          event.messageID
        );
      }

      if (!video)
        return api.sendMessage("❌ Video not found", event.threadID);

      return api.sendMessage(
        {
          body: fontify(title?.slice(0, 200) || "TikTok Video", font),
          attachment: await getStream(video)
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Failed to fetch media", event.threadID);
    }
  }
};
