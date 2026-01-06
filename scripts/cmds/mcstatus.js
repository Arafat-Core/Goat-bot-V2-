const axios = require("axios");

const FONT_URL =
  "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json";

let FONT = {};

async function loadFont() {
  if (Object.keys(FONT).length) return;
  try {
    const res = await axios.get(FONT_URL, { timeout: 15000 });
    FONT = res.data || {};
  } catch {
    FONT = {};
  }
}

const f = (t = "") =>
  t.toString().split("").map(c => FONT[c] || c).join("");

const safeText = (t = "") => t.replace(/\./g, ".\u200B");

async function downloadFromImgur(url) {
  try {
    if (!url || !url.includes("imgur.com")) return null;

    let imageUrl = url.split("?")[0].split("#")[0];
    if (!imageUrl.match(/\.(png|jpg|jpeg)$/i)) {
      imageUrl += ".png";
    }

    const res = await axios.get(imageUrl, {
      responseType: "stream",
      timeout: 20000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/*"
      }
    });

    return res.data;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "mcstatus",
    aliases: ["minecraftstatus"],
    version: "4.1",
    author: "Arafat",
    countDown: 5,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} <server>\nExample: {pn} hub.opblocks.com"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      await loadFont();

      const server = args[0];
      if (!server) {
        return message.reply("❌ Please provide a server address.");
      }

      const API_URL =
        `https://arafat-x-minecraft-status.vercel.app/api/mcstatus?server=${encodeURIComponent(server)}`;

      const res = await axios.get(API_URL, { timeout: 15000 });
      const data = res.data?.data;
      if (!res.data?.success || !data) {
        return message.reply("❌ Failed to fetch server status.");
      }

      const motdLines = (data.motd?.clean || "")
        .replace(/\s{2,}/g, " ")
        .split("\n")
        .flatMap(l => l.split("|"))
        .map(l => l.trim())
        .filter(Boolean);

      const text =
        `🎮 ${f("MINECRAFT SERVER")}\n\n` +
        `🌐 ${f("Server")}\n` +
        `${f(safeText(data.host))}\n\n` +
        `🟢 ${f("Status")}\n` +
        `${f(data.online ? "ONLINE" : "OFFLINE")}\n\n` +
        `👥 ${f("Players")}\n` +
        `${f(data.players.online)} ${f("/")} ${f(data.players.max)}\n\n` +
        `⚙️ ${f("Version")}\n` +
        `${f(data.version.name_clean)}\n\n` +
        `📢 ${f("MOTD")}\n` +
        motdLines.map(l => f(l)).join("\n");

      let attachment = null;
      if (data.photo?.url) {
        attachment = await downloadFromImgur(data.photo.url);
      }

      return api.sendMessage(
        { body: text, attachment },
        event.threadID,
        event.messageID
      );

    } catch {
      return message.reply("❌ Error while checking server status.");
    }
  }
};
