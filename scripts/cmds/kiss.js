const Jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// 🔑 Facebook App Token (required)
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

/* ================= VIP ================= */
const VIP_API = "https://mongodb-api-psi.vercel.app/arafat-vip";
async function isVip(uid) {
  try {
    const { data } = await axios.get(VIP_API, { timeout: 8000 });
    if (!data?.data) return false;
    const now = Date.now();
    return data.data.some(
      u =>
        u.userID == uid &&
        (!u.expireAt || Number(u.expireAt) > now)
    );
  } catch {
    return false;
  }
}

/* ================= FONT ================= */
const FONT_URL =
  "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json";

let FONT = {};
async function loadFont() {
  if (Object.keys(FONT).length) return;
  try {
    const res = await axios.get(FONT_URL, { timeout: 5000 });
    FONT = res.data || {};
  } catch {
    FONT = {};
  }
}
const f = (t = "") =>
  t.toString().split("").map(c => FONT[c] || c).join("");

module.exports = {
  config: {
    name: "kiss",
    aliases: ["kiss"],
    version: "1.4",
    author: "Arafat",
    role: 0,
    category: "vip",
    guide: "{pn} @mention / reply"
  },

  onStart: async function ({ api, event, message, usersData }) {
    try {

      /* ===== VIP CHECK (ADDED ONLY) ===== */
      const uid = event.senderID;
      if (!(await isVip(uid))) {
        return message.reply(
          "𝐒𝐨𝐫𝐫𝐲, 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚 𝐕𝐈𝐏 𝐮𝐬𝐞𝐫"
        );
      }
      /* ================================ */

      await loadFont();

      const mention = Object.keys(event.mentions);
      const replyID = event.messageReply?.senderID;

      if (mention.length === 0 && !replyID) {
        return message.reply(
          f("🥺 Please mention someone or reply to their message~")
        );
      }

      const senderID = event.senderID;
      const targetID = mention[0] || replyID;

      if (!senderID || !targetID) {
        return message.reply(
          f("😿 Oops… I couldn't figure out who to kiss.")
        );
      }

      /* ── Gender detect (fallback safe) */
      const senderGender =
        (await usersData.get(senderID))?.gender || "male";
      const targetGender =
        (await usersData.get(targetID))?.gender || "male";

      // RULE: Female LEFT, Male RIGHT
      let femaleID, maleID;
      if (senderGender === "female" && targetGender !== "female") {
        femaleID = senderID;
        maleID = targetID;
      } else if (targetGender === "female" && senderGender !== "female") {
        femaleID = targetID;
        maleID = senderID;
      } else {
        // fallback
        femaleID = targetID;
        maleID = senderID;
      }

      // Avatar URLs (TOKEN FIX)
      const avatarFemale =
        `https://graph.facebook.com/${femaleID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;
      const avatarMale =
        `https://graph.facebook.com/${maleID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Load template
      const base = await Jimp.read(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/kiss.png"
      );

      const imgFemale = await Jimp.read(avatarFemale);
      const imgMale = await Jimp.read(avatarMale);

      base.resize(768, 574);
      imgFemale.resize(200, 200).circle();
      imgMale.resize(200, 200).circle();

      // Composite
      base.composite(imgFemale, 150, 25); // LEFT = Female
      base.composite(imgMale, 350, 25);   // RIGHT = Male

      // Save temp
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const imgPath = path.join(
        cacheDir,
        `${femaleID}_${maleID}_kiss.png`
      );

      await fs.writeFile(
        imgPath,
        await base.getBufferAsync(Jimp.MIME_PNG)
      );

      /* 💖 Cute English Body Text */
      const bodyText =
        f("💋 A soft little kiss just landed~\n") +
        f("💖 Love is in the air tonight ✨\n\n") +
        f("🥰 Enjoy the sweet moment together!");

      message.reply(
        {
          body: bodyText,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("KISS ERROR:", err);
      message.reply(
        f("😿 Oops… the kiss missed its target.")
      );
    }
  }
};