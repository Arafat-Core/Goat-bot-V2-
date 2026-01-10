const axios = require("axios");
const fs = require("fs");
const path = require("path");

let fontMap = null;

async function loadFont() {
  if (fontMap) return fontMap;
  const res = await axios.get(
    "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json"
  );
  fontMap = res.data;
  return fontMap;
}

async function ensureFont() {
  if (!fontMap) await loadFont();
}

function font(text = "") {
  if (!fontMap) return text;
  return text.split("").map(c => fontMap[c] || c).join("");
}

module.exports = {
  config: {
    name: "download",
    version: "4.2.1",
    author: "Arafat",
    role: 0,
    countDown: 0,
    shortDescription: "Auto media downloader",
    longDescription: "Auto download from TikTok, Instagram, Facebook, YouTube",
    category: "media"
  },

  onStart: async function () {
    return;
  },

  onChat: async function ({ api, event }) {
    const text = event.body || "";
    if (!text) return;

    const url = text.match(/https?:\/\/[^\s]+/)?.[0];
    if (!url) return;

    const allow = [
      "tiktok.com",
      "vt.tiktok.com",
      "instagram.com",
      "facebook.com",
      "fb.watch",
      "youtu.be",
      "youtube.com",
      "x.com",
      "twitter.com"
    ];
    if (!allow.some(d => url.includes(d))) return;

    await ensureFont();

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    let waitMsg;
    try {
      waitMsg = await api.sendMessage(
        font("Downloading, please wait..."),
        event.threadID
      );

      const apiJson = (
        await axios.get(
          "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json"
        )
      ).data;

      const BASE = apiJson.download;
      const { data } = await axios.get(`${BASE}/download`, {
        params: { url }
      });

      if (!data?.success) throw new Error("API failed");

      if (waitMsg?.messageID) await api.unsendMessage(waitMsg.messageID);

      if (data.type === "tiktok" && data.data.type === "photo") {
        const attachments = [];

        for (let i = 0; i < data.data.images.length; i++) {
          const img = data.data.images[i];
          const buffer = (
            await axios.get(img, { responseType: "arraybuffer" })
          ).data;

          const imgPath = path.join(
            cacheDir,
            `tt_${Date.now()}_${i}.jpg`
          );
          fs.writeFileSync(imgPath, buffer);
          attachments.push(fs.createReadStream(imgPath));
        }

        return api.sendMessage(
          {
            body: font(data.data.title || "TikTok Photo"),
            attachment: attachments
          },
          event.threadID,
          () => attachments.forEach(a => fs.unlinkSync(a.path)),
          event.messageID
        );
      }

      const videoUrl =
        data?.data?.url ||
        data?.data?.download_url ||
        data?.data?.hd;

      if (!videoUrl) throw new Error("No media url");

      const buffer = (
        await axios.get(videoUrl, { responseType: "arraybuffer" })
      ).data;

      const filePath = path.join(cacheDir, `dl_${Date.now()}.mp4`);
      fs.writeFileSync(filePath, buffer);

      return api.sendMessage(
        {
          body: font(data?.data?.title || "Downloaded successfully"),
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch {
      if (waitMsg?.messageID)
        await api.unsendMessage(waitMsg.messageID);

      api.sendMessage(
        font("⚠ Download failed. Please try another link."),
        event.threadID,
        event.messageID
      );
    }
  }
};
