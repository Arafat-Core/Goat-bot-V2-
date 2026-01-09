const axios = require("axios");

let fontMap = null;

async function loadFont() {
  if (fontMap) return fontMap;
  const res = await axios.get(
    "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json",
    { timeout: 10000 }
  );
  fontMap = res.data;
  return fontMap;
}

function font(text = "") {
  if (!fontMap) return text;
  let out = "";
  for (const c of text) out += fontMap[c] || c;
  return out;
}

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest"],
    version: "3.0.0",
    author: "Arafat",
    cooldown: 5,
    role: 0,
    category: "image",
    shortDescription: "Pinterest image search",
    longDescription: "Clean pinterest image downloader"
  },

  onStart: async function ({ api, event, args, utils }) {
    const { threadID, messageID } = event;

    try {
      await loadFont();
      api.setMessageReaction("🎀", messageID, () => {}, true);

      if (!args.length) {
        return api.sendMessage(
          font("Usage:\n#pin <keyword> [amount]\nExample:\n#pin naruto 10"),
          threadID
        );
      }

      let limit = 1;
      let query = args.join(" ");
      const last = parseInt(args[args.length - 1]);

      if (!isNaN(last) && args.length > 1) {
        limit = Math.min(last, 50);
        query = args.slice(0, -1).join(" ");
      }

      const startTime = Date.now();

      const loading = await api.sendMessage(
        font(
          `୨୧ ── ✦ Pinterest Search ✦ ── ୨୧\n\n` +
          `🔎 Keyword : ${query}\n` +
          `🖼️ Type    : Image\n` +
          `📦 Total   : ${limit}\n` +
          `⏳ Loading...`
        ),
        threadID
      );

      const apiURL = `https://arafat-pinterest-api.vercel.app/pinterest?search=${encodeURIComponent(
        query
      )}&limit=${limit}`;

      const res = await axios.get(apiURL, { timeout: 15000 });

      let images =
        res.data?.data ||
        res.data?.results ||
        (Array.isArray(res.data) ? res.data : []);

      images = images.filter(i => typeof i === "string").slice(0, limit);

      if (!images.length) {
        await api.unsendMessage(loading.messageID);
        return api.sendMessage(
          font(`No images found for ${query}`),
          threadID
        );
      }

      const attachments = [];
      for (const url of images) {
        try {
          attachments.push(
            utils?.getStreamFromURL
              ? await utils.getStreamFromURL(url)
              : (await axios.get(url, { responseType: "stream" })).data
          );
        } catch {}
      }

      const time = ((Date.now() - startTime) / 1000).toFixed(2);

      await api.unsendMessage(loading.messageID);

      await api.sendMessage(
        {
          body: font(
            `୨୧ ── ✦ Pinterest Result ✦ ── ୨୧\n\n` +
            `🔎 Keyword : ${query}\n` +
            `🖼️ Type    : Image\n` +
            `📦 Total   : ${attachments.length}\n` +
            `⏱️ Time    : ${time}s`
          ),
          attachment: attachments
        },
        threadID
      );

    } catch (err) {
      console.error("Pinterest Error:", err);
      api.sendMessage(
        font("Server error, try again later."),
        threadID
      );
    }
  }
};
