const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

function decode(x) {
  return Buffer.from(x, "base64").toString("utf8");
}

const DB_API = decode("aHR0cHM6Ly9tb25nb2RiLWFwaS1wc2kudmVyY2VsLmFwcC9tZW1l");
const IMGUR_ID = decode("ZDcwMzA1ZTdjM2FjNWM2");

function getText(event) {
  return (
    event.body ||
    event.message?.body ||
    event.message?.text ||
    event.message ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
}

async function getName(api, uid) {
  try {
    if (api.getUserInfo) {
      const info = await api.getUserInfo(uid);
      return info?.[uid]?.name || uid;
    }
  } catch {}
  return uid;
}

module.exports = {
  config: {
    name: "meme",
    aliases: ["meme"],
    version: "25.0",
    author: "Arafat",
    countDown: 3,
    role: 0,
    category: "fun"
  },

  onStart: async function ({ message, event, api }) {
    const userMessage = getText(event);
    const { senderID, messageReply } = event;

    if (userMessage === "#meme list" || userMessage === "/meme list" || userMessage === "meme list") {
      try {
        const res = await axios.get(DB_API);
        const list = res.data?.data || [];
        if (!list.length) return message.reply("𝐍𝐨 𝐦𝐞𝐦𝐞𝐬 𝐮𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐲𝐞𝐭.");

        const count = {};
        for (const m of list) count[m.uploader] = (count[m.uploader] || 0) + 1;

        const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);

        let text = "👑 𝐌𝐞𝐦𝐞 𝐋𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝 👑\n\n";

        let rank = 1;
        for (const [uid, total] of sorted) {
          const name = await getName(api, uid);

          if (rank === 1) text += `🥇 ${name} — ${total} 𝐔𝐩𝐥𝐨𝐚𝐝𝐬\n`;
          else if (rank === 2) text += `🥈 ${name} — ${total} 𝐔𝐩𝐥𝐨𝐚𝐝𝐬\n`;
          else if (rank === 3) text += `🥉 ${name} — ${total} 𝐔𝐩𝐥𝐨𝐚𝐝𝐬\n`;
          else text += `• ${rank}) ${name} — ${total} 𝐔𝐩𝐥𝐨𝐚𝐝𝐬\n`;

          rank++;
        }

        text += `\n🏆 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐞𝐬: ${list.length}`;
        return message.reply(text);
      } catch {
        return message.reply("𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐥𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝.");
      }
    }

    if (messageReply?.attachments?.length > 0) {
      try {
        const fileUrl = messageReply.attachments[0].url;

        const file = await axios.get(fileUrl, {
          responseType: "arraybuffer",
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        const form = new FormData();
        form.append("image", Buffer.from(file.data), "meme");

        const up = await axios.post("https://api.imgur.com/3/upload", form, {
          headers: { Authorization: `Client-ID ${IMGUR_ID}`, ...form.getHeaders() }
        });

        const link =
          up.data?.data?.link ||
          up.data?.data?.mp4 ||
          up.data?.data?.gifv;

        if (!link) return message.reply("𝐔𝐩𝐥𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝.");

        const uploaderName = await getName(api, senderID);

        const old = await axios.get(DB_API);
        const before = old.data?.data?.length || 0;

        await axios.post(DB_API, {
          url: link,
          uploader: senderID,
          createdAt: Date.now()
        });

        const now = await axios.get(DB_API);
        const totalNow = now.data?.data?.length || before + 1;

        const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

        const msg =
`𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥
𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐫: ${uploaderName}
𝐔𝐢𝐝: ${senderID}
𝐃𝐚𝐭𝐞: ${date}`;

        return message.reply(msg);

      } catch {
        return message.reply("𝐔𝐩𝐥𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝.");
      }
    }

    try {
      const res = await axios.get(DB_API);
      const list = res.data?.data || [];
      if (!list.length) return message.reply("𝐍𝐨 𝐦𝐞𝐦𝐞𝐬 𝐬𝐚𝐯𝐞𝐝 𝐲𝐞𝐭.");

      const pick = list[Math.floor(Math.random() * list.length)];

      const uploaderName = await getName(api, pick.uploader);

      const uploadDate = new Date(pick.createdAt).toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
      });

      const img = await axios.get(pick.url, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const ext = path.extname(pick.url.split("?")[0]) || ".jpg";
      const filePath = path.join(__dirname, `meme_${Date.now()}${ext}`);

      fs.writeFileSync(filePath, img.data);

      const bodyText =
`🎭 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐑𝐚𝐧𝐝𝐨𝐦 𝐌𝐞𝐦𝐞 🎭

𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐫: ${uploaderName}
𝐔𝐈𝐃: ${pick.uploader}
𝐃𝐚𝐭𝐞: ${uploadDate}`;

      await message.reply({
        body: bodyText,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => fs.unlinkSync(filePath), 5000);

    } catch {
      return message.reply("𝐅𝐞𝐭𝐜𝐡 𝐅𝐚𝐢𝐥𝐞𝐝.");
    }
  }
};
