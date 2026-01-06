const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    aliases: ["e"],
    author: "Arafat",
    version: "4.3",
    cooldowns: 5,
    role: 0,
    category: "image"
  },

  onStart: async function ({ message, args, api, event }) {

    let imageUrl, prompt;

    if (event.messageReply && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
      prompt = args.join(" ");
    } else if (args.length >= 2) {
      imageUrl = args[0];
      prompt = args.slice(1).join(" ");
    } else {
      return api.sendMessage("𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞 𝐨𝐫 𝐩𝐫𝐨𝐦𝐩𝐭.", event.threadID);
    }

    if (!prompt) return api.sendMessage("𝐏𝐫𝐨𝐦𝐩𝐭 𝐦𝐢𝐬𝐬𝐢𝐧𝐠.", event.threadID);

    const waitMsg = await api.sendMessage("𝐘𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐢𝐬 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭.....!!", event.threadID);

    try {
      const githubJson = "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json";
      const { data } = await axios.get(githubJson);

      if (!data || !data.api)
        return api.sendMessage("𝐀𝐏𝐈 𝐥𝐨𝐚𝐝 𝐞𝐫𝐫𝐨𝐫.", event.threadID);

      const API_URL = `${data.api}/arafatedit`;

      const response = await axios.post(API_URL, {
        prompt: prompt,
        image_urls: [imageUrl],
        font: "Poppins"
      });

      if (!response.data || !response.data.image_url)
        return api.sendMessage("𝐄𝐝𝐢𝐭 𝐟𝐚𝐢𝐥𝐞𝐝.", event.threadID);

      const editedUrl = response.data.image_url;

      const fileBuffer = await axios.get(editedUrl, { responseType: "arraybuffer" });

      const cache = path.join(__dirname, "cache");
      if (!fs.existsSync(cache)) fs.mkdirSync(cache);

      const filePath = path.join(cache, `${Date.now()}_edited.png`);
      fs.writeFileSync(filePath, fileBuffer.data);

      api.unsendMessage(waitMsg.messageID);

      message.reply(
        {
          body: `𝐃𝐨𝐧𝐞 ✅\n𝐏𝐫𝐨𝐦𝐩𝐭: "${prompt}"`,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      api.sendMessage("𝐄𝐫𝐫𝐨𝐫: " + err.message, event.threadID);
    }
  }
};
