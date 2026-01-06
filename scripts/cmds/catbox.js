const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "catbox",
    version: "1.0.5",
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    countDown: 5,
    role: 0,
    shortDescription: "𝐔𝐩𝐥𝐨𝐚𝐝 𝐟𝐢𝐥𝐞 𝐭𝐨 𝐂𝐚𝐭𝐛𝐨𝐱",
    longDescription: "𝐔𝐩𝐥𝐨𝐚𝐝 𝐚𝐧𝐲 𝐯𝐢𝐝𝐞𝐨 (𝐦𝐩𝟒) 𝐨𝐫 𝐢𝐦𝐚𝐠𝐞 (𝐣𝐩𝐠/𝐣𝐩𝐞𝐠/𝐩𝐧𝐠/𝐰𝐞𝐛𝐩) 𝐭𝐨 𝐂𝐚𝐭𝐛𝐨𝐱.",
    category: "tools"
  },

  onStart: async function ({ api, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments?.length) {
        return api.sendMessage(
          "𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐟𝐢𝐥𝐞 𝐭𝐨 𝐮𝐩𝐥𝐨𝐚𝐝.",
          event.threadID,
          event.messageID
        );
      }

      const file = event.messageReply.attachments[0];
      const url = file.url;

      // 1) Extract extension from filename or url
      let ext = "";

      if (file.filename) {
        ext = path.extname(file.filename).replace(".", "").toLowerCase();
      }

      if (!ext) {
        const urlExt = path.extname(url.split("?")[0]).replace(".", "").toLowerCase();
        if (urlExt) ext = urlExt;
      }

      // 2) If still empty, get from mimetype (Messenger sends this correctly always)
      if (!ext && file.type) {
        const guess = file.type.split("/")[1];
        if (guess) ext = guess.toLowerCase();
      }

      // Normalize extensions
      if (ext === "jpeg") ext = "jpg";
      if (ext === "webp") ext = "webp";
      if (ext === "png") ext = "png";

      // Allowed formats
      const allowed = ["mp4", "jpg", "png", "webp"];

      if (!allowed.includes(ext)) {
        return api.sendMessage(
          "𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝 𝐟𝐨𝐫𝐦𝐚𝐭𝐬: 𝐌𝐏𝟒, 𝐉𝐏𝐆, 𝐏𝐍𝐆, 𝐖𝐄𝐁𝐏.",
          event.threadID,
          event.messageID
        );
      }

      // Download file
      const tmpDir = os.tmpdir();
      const saveName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path.join(tmpDir, saveName);

      const response = await axios.get(url, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);

      await new Promise((res, rej) => {
        response.data.pipe(writer);
        writer.on("finish", res);
        writer.on("error", rej);
      });

      // Upload to Catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const upload = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
      });

      const link = upload.data.trim();

      try { fs.unlinkSync(filePath); } catch (err) {}

      return api.sendMessage(
        `𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥.\n𝐋𝐢𝐧𝐤: ${link}`,
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error(error);

      return api.sendMessage(
        "𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐩𝐥𝐨𝐚𝐝. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.",
        event.threadID,
        event.messageID
      );
    }
  }
};
