const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "autodl",
    version: "2.2.0",
    author: "Arafat",
    countDown: 0,
    role: 0,
    shortDescription: "Auto download when link sent",
    longDescription: "Automatically downloads videos from TikTok, Facebook, Instagram, YouTube, X (Twitter) and more when user sends a link.",
    category: "media",
  },

  onStart: async function({ api, event }) {
    api.sendMessage("Auto download mod", event.threadID);
  },

  onChat: async function({ api, event }) {
    const text = event.body || "";
    if (!text) return;

    const url = text.match(/https?:\/\/[^\s]+/g)?.[0];
    if (!url) return;

    const supported = [
      "tiktok.com",
      "facebook.com",
      "instagram.com",
      "youtu.be",
      "youtube.com",
      "x.com",
      "twitter.com",
      "fb.watch"
    ];

    if (!supported.some(domain => url.includes(domain))) return;

    try {
      const waitMsg = await api.sendMessage(
        "Downloading please wait a few moment......!!",
        event.threadID
      );

      // 🔹  API এখানে ব্যবহার হচ্ছে
      const PROXY_BASE = "https://arafat-video-downlod-api.vercel.app";
      const PROXY_KEY = "my_super_secret_key_123"; // do not change api and key

      const { data } = await axios.get(`${PROXY_BASE}/alldl`, {
        params: { url: url, key: PROXY_KEY },
        timeout: 30000
      });

      if (!data?.result) throw new Error("Not Found.....!!");

      const videoBuffer = (await axios.get(data.result, { responseType: "arraybuffer" })).data;
      const videoPath = path.join(__dirname, "cache", `autodl_${Date.now()}.mp4`);
      fs.writeFileSync(videoPath, videoBuffer);

      await api.unsendMessage(waitMsg.messageID);

      await api.sendMessage({
        body: `${data.cp || "Video Download successfully ✅"}`,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => fs.unlinkSync(videoPath), event.messageID);

    } catch (err) {
      api.sendMessage(`⚠️ Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
