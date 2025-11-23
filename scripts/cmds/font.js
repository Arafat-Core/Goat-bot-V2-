const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports.config = {
  name: "style",
  aliases: ["font"],
  version: "1.7",
  role: 0,
  countDowns: 5,
  author: "MahMUD",
  category: "general",
  guide: { en: "[number] [text] or list" }
};

module.exports.onStart = async function ({ message, args }) {
  const apiUrl = await mahmud();

  if (args[0] === "list") {
    try {
      const fontList = (await axios.get(`${apiUrl}/api/font/list`)).data.replace("Available Font Styles:", "").trim();
      return fontList ? message.reply(`Available Font Styles:\n${fontList}`) : message.reply("No font styles found.");
    } catch {
      return message.reply("Error fetching font styles.");
    }
  }

  const [number, ...textParts] = args;
  const text = textParts.join(" ");
  if (!text || isNaN(number)) return message.reply("Invalid usage. Format: style <number> <text>");

  try {
    const { data: { data: fontData } } = await axios.post(`${apiUrl}/api/font`, { number, text });
    const fontStyle = fontData[number];
    const convertedText = text.split("").map(char => fontStyle[char] || char).join("");
    return message.reply(convertedText);
  } catch {
    return message.reply("Error processing your request.");
  }
};
