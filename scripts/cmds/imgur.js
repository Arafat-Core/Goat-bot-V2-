const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "imgur",
    aliases: ["imgur"],
    version: "1.0",
    author: "Arafat",
    countDown: 3,
    role: 0,
    shortDescription: "Upload image/video to Imgur",
    longDescription: "Reply to a photo or video to upload it directly to Imgur.",
    category: "utility"
  },

  onStart: async function ({ message, event, api }) {
    const reply = event.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
      return api.sendMessage("Please reply to an image or video.", event.threadID, event.messageID);
    }

    const file = reply.attachments[0];

    if (file.type !== "photo" && file.type !== "video") {
      return api.sendMessage("Only images and videos are supported.", event.threadID, event.messageID);
    }

    try {
      await message.reply("Uploading to Imgur...");

      const buffer = await axios.get(file.url, { responseType: "arraybuffer" })
        .then(res => Buffer.from(res.data));

      const form = new FormData();
      form.append("image", buffer, file.type === "video" ? "video.mp4" : "image.jpg");

      const clientId = "d70305e7c3ac5c6";

      const res = await axios.post("https://api.imgur.com/3/upload", form, {
        headers: {
          Authorization: `Client-ID ${clientId}`,
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const link = res.data?.data?.link;

      if (!link) {
        return message.reply("Upload failed.");
      }

      return message.reply(
        `${file.type === "photo" ? "Image" : "Video"} ${link}`
      );

    } catch (err) {
      return message.reply("Error while uploading.");
    }
  }
};
