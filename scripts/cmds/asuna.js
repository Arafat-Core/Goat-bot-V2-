const axios = require("axios");

module.exports = {
  config: {
    name: "asuna",
    version: "1.0",
    author: "Arafat",
    countDown: 10,
    role: 0,
    shortDescription: "asuna Video",
    longDescription: "asuna Video",
    category: "Anime",
    guide: { en: "{pn} | {pn} <keyword>" }
  },

  onStart: async function ({ api, event, args }) {
    const EMOJIS = ["🎀","💖","✨","🌸","💫","💝","🩷","🌷"];
    const EMOJI = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const TEXT = {
      title: `${EMOJI}𝐀𝐬𝐮𝐧𝐚 𝐕𝐢𝐝𝐞𝐨`,
      notFound: "𝐤𝐨𝐧𝐨 𝐯𝐢𝐝𝐞𝐨 𝐩𝐚𝐰𝐚 𝐣𝐚𝐲 𝐧𝐚𝐢 ❌",
      error: "𝐀𝐢 𝐭𝐚 𝐤𝐢 𝐤𝐨𝐫𝐥𝐚 😒",
      blocked: "❌ 𝐘𝐨𝐮𝐫 𝐛𝐨𝐭 𝐢𝐬 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐫𝐢𝐥𝐲 𝐮𝐧𝐬𝐞𝐧𝐝 𝐛𝐥𝐨𝐜𝐤"
    };

    let keyword = "asuna sao";
    if (args.length) keyword = `asuna ${args.join(" ")}`;

    try {
      const res = await axios.get(
        `https://short-video-api-by-arafat.vercel.app/arafat?keyword=${encodeURIComponent(keyword)}`,
        { timeout: 15000 }
      );

      if (!Array.isArray(res.data) || res.data.length === 0)
        return api.sendMessage(TEXT.notFound, event.threadID, event.messageID);

      const d = res.data[Math.floor(Math.random() * res.data.length)];
      if (!d.videoUrl)
        return api.sendMessage(TEXT.error, event.threadID, event.messageID);

      try {
        await api.sendMessage(
          {
            body: `${TEXT.title}\n⏱ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${d.duration || "?"}s`,
            attachment: await global.utils.getStreamFromURL(d.videoUrl)
          },
          event.threadID,
          event.messageID
        );
      } catch { api.sendMessage(TEXT.blocked, event.threadID, event.messageID); }

    } catch { api.sendMessage(TEXT.blocked, event.threadID, event.messageID); }
  }
};