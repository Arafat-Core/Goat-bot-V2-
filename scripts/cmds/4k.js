const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "4k",
    version: "1.5",
    author: "Arafat",
    role: 0,
    category: "image",
    shortDescription: { en: "Enhance image to 4K" },
    longDescription: { en: "Reply to an image to get a 4K enhanced version" },
    guide: { en: "Reply to an image with: 4k" }
  },

  onStart: async function ({ event, message }) {
    const startTime = Date.now();

    try {
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return message.reply(
          "❌ Please reply to an image and type: 4k"
        );
      }

      const imageUrl = event.messageReply.attachments[0].url;

      const cacheDir = path.join(__dirname, "..", "..", "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(
        cacheDir,
        `4k_${Date.now()}.jpg`
      );

      const imgRes = await axios.get(imageUrl, {
        responseType: "stream",
        timeout: 20000
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(imgPath);
        imgRes.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const { data } = await axios.get(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/4k.json",
        { timeout: 10000 }
      );

      const API_BASE = data.api;

      const form = new FormData();
      form.append("image", fs.createReadStream(imgPath));

      const apiRes = await axios.post(
        `${API_BASE}/Arafat-4k`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 60000
        }
      );

      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

      if (!apiRes.data || !apiRes.data.photo_4k_url) {
        return message.reply("❌ Failed to generate 4K image");
      }

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

      return message.reply({
        body:
          "✨ 𝟒𝐊 𝐈𝐦𝐚𝐠𝐞 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝\n" +
          `🚀 𝐓𝐢𝐦𝐞 : ${timeTaken}s`,
        attachment: await axios
          .get(apiRes.data.photo_4k_url, {
            responseType: "stream",
            timeout: 30000
          })
          .then(r => r.data)
      });

    } catch (err) {
      console.error(err);
      return message.reply(
        "❌ Server error. Please try again later."
      );
    }
  }
};
