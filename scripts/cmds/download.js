const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "download",
    version: "2.3.0",
    author: "Arafat",
    countDown: 0,
    role: 0,
    shortDescription: "𝐀𝐮𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐰𝐡𝐞𝐧 𝐥𝐢𝐧𝐤 𝐬𝐞𝐧𝐭",
    longDescription: "𝐀𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐥𝐥𝐲 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐬 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐫𝐨𝐦 𝐓𝐢𝐤𝐓𝐨𝐤, 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤, 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦, 𝐘𝐨𝐮𝐓𝐮𝐛𝐞, 𝐗 𝐚𝐧𝐝 𝐦𝐨𝐫𝐞.",
    category: "media",
  },

  onStart: async function ({ api, event }) {
    api.sendMessage("𝐀𝐮𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐦𝐨𝐝 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝.", event.threadID);
  },

  onChat: async function ({ api, event }) {
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

  
    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
    

    try {
      const waitMsg = await api.sendMessage(
        "𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐚 𝐟𝐞𝐰 𝐦𝐨𝐦𝐞𝐧𝐭...!!",
        event.threadID
      );

      const gitRaw = "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json";
      const apiJson = (await axios.get(gitRaw)).data;

      if (!apiJson?.api) throw new Error("𝐀𝐏𝐈 𝐁𝐚𝐬𝐞 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝!");

      const BASE_API = `${apiJson.api}/arafatdl/all-dl`;

      const { data } = await axios.get(BASE_API, {
        params: { url: url },
        timeout: 30000
      });

      if (!data?.url) throw new Error("𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐔𝐑𝐋 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝!");

      const videoBuffer = (await axios.get(data.url, { responseType: "arraybuffer" })).data;
      const savePath = path.join(cachePath, `autodl_${Date.now()}.mp4`);

      fs.writeFileSync(savePath, videoBuffer);

      await api.unsendMessage(waitMsg.messageID);

      await api.sendMessage({
        body: data.cp || "𝐕𝐢𝐝𝐞𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲! ✅",
        attachment: fs.createReadStream(savePath)
      }, event.threadID, () => fs.unlinkSync(savePath), event.messageID);

    } catch (err) {
      api.sendMessage(`⚠️ 𝐄𝐫𝐫𝐨𝐫: 𝐀𝐫𝐚𝐟𝐚𝐭 𝐅𝐢𝐱𝐢𝐧𝐠 𝐓𝐡𝐞 𝐄𝐫𝐫𝐨𝐫 ༼ つ ◕◡◕ ༽つ`, event.threadID, event.messageID);
    }
  }
};
