const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = { 
  config: { 
    name: "album", 
    version: "1.7", 
    role: 0, 
    author: "MahMUD", 
    category: "media", 
    guide: { 
      en: "{p}{n} [page number] (e.g., {p}{n} 2 to view the next page)\n{p}{n} add [category] [URL] - Add a video to a category\n{p}{n} list - View total videos in each category",
    }, 
  },

  onStart: async function ({ api, event, usersData, args }) {     
     const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);  if (module.exports.config.author !== obfuscatedAuthor) { return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID); }
     const apiUrl = await baseApiUrl();

      if (args[0] === "add") {
        if (!args[1]) {
        return api.sendMessage("Please specify a category. Usage: !a add [category]", event.threadID, event.messageID);   }
        const category = args[1].toLowerCase(); if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type !== "video") {
        return api.sendMessage("❌ Only video attachments are allowed.", event.threadID, event.messageID);
     }

       try {
        const response = await axios.post("https://api.imgur.com/3/image", {image: attachment.url,type: "url"  },  {headers: {
        Authorization: "Client-ID"} }   );
        const imgurLink = response.data?.data?.link;
        if (!imgurLink) throw new Error("Imgur upload failed");  try {
        const uploadResponse = await axios.post(`${apiUrl}/api/add`, {  category,  videoUrl: imgurLink,  });
        return api.sendMessage(uploadResponse.data.message, event.threadID, event.messageID);  } catch (error) {
        return api.sendMessage(`Failed to upload video.\n${error.response?.data?.error || error.message}`, event.threadID, event.messageID);   }    } catch (error) {
        return api.sendMessage(`Failed to upload to Imgur.\n${error.message}`, event.threadID, event.messageID);   }
      }

        
       if (!args[2]) {
       return api.sendMessage("❌ Please provide a video URL or reply to a video message.", event.threadID, event.messageID);   }
       const videoUrl = args[2];   try {
       const response = await axios.post(`${apiUrl}/api/add`, {    category,    videoUrl,  });
       return api.sendMessage(response.data.message, event.threadID, event.messageID);  } catch (error) {
       return api.sendMessage(`${error.response?.data?.error || error.message}`, event.threadID, event.messageID);
     }

        
     } else if (args[0] === "list") {try {
       const response = await axios.get(`${apiUrl}/api/album/mahmud/list`);
       api.sendMessage(response.data.message, event.threadID, event.messageID); } catch (error) {
       api.sendMessage(`${error.message}`, event.threadID, event.messageID);  } } else {
       const displayNames = 
         [
         "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐂𝐚𝐫 𝐄𝐝𝐢𝐭 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐁𝐢𝐤𝐞 𝐄𝐝𝐢𝐭 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐌𝐞𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐌𝐨𝐧𝐞𝐲 𝐯𝐢𝐝𝐞𝐨 🎀",
         "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐃𝐫𝐚𝐠𝐨𝐧 𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐁𝐥𝐞𝐚𝐜𝐡 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐃𝐞𝐦𝐨𝐧 𝐬𝐲𝐥𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐉𝐮𝐣𝐮𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐯𝐢𝐝𝐞𝐨 🎀",
         "𝐒𝐨𝐥𝐨 𝐥𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐓𝐨𝐤𝐲𝐨 𝐫𝐞𝐯𝐞𝐧𝐠𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐁𝐥𝐮𝐞 𝐥𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐃𝐞𝐚𝐭𝐡 𝐧𝐨𝐭𝐞 𝐯𝐢𝐝𝐞𝐨 🎀",
         "𝐎𝐧𝐞 𝐏𝐢𝐞𝐜𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐒𝐚𝐤𝐚𝐦𝐨𝐭𝐨 𝐃𝐚𝐲𝐬 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐰𝐢𝐧𝐝 𝐛𝐫𝐞𝐚𝐤𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐎𝐧𝐞 𝐩𝐮𝐧𝐜𝐡 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐀𝐥𝐲𝐚 𝐑𝐮𝐬𝐬𝐢𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐁𝐥𝐮𝐞 𝐛𝐨𝐱 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐇𝐮𝐧𝐭𝐞𝐫 𝐱 𝐇𝐮𝐧𝐭𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐋𝐨𝐧𝐞𝐫 𝐥𝐢𝐟𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐇𝐚𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐍𝐞𝐲𝐦𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐌𝐞𝐬𝐬𝐢 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐑𝐨𝐧𝐚𝐥𝐝𝐨 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐕𝐢𝐧𝐢 𝐉𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐌𝐛𝐚𝐩𝐩𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐘𝐚𝐦𝐚𝐥 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐑𝐚𝐩𝐢𝐧𝐡𝐚 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐃𝐲𝐛𝐚𝐥𝐚 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐏𝐞𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐌𝐚𝐫𝐚𝐝𝐨𝐧𝐚 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐖𝐡𝐢𝐭𝐞 𝟒𝟒𝟒 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐑𝐮𝐨𝐤 𝐟𝐟 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐁𝟐𝐤 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐁𝐧𝐥 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐕𝐢𝐧𝐜𝐞𝐧𝐳𝐨 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐒𝐲𝐛𝐥𝐮𝐬 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐑𝐚𝐢𝐬𝐭𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐒𝐦𝐨𝐨𝐭𝐡 𝟒𝟒𝟒 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐀𝐬𝐭𝐚𝐭𝐢𝐧𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
         "𝐅𝐅 𝐄𝐬𝐩𝐨𝐫𝐭𝐬 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐏𝐮𝐛𝐠 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐂𝐚𝐥𝐥 𝐨𝐟 𝐃𝐮𝐭𝐲 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐂𝐥𝐚𝐬𝐡 𝐨𝐟 𝐂𝐥𝐚𝐧𝐬 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐌𝐨𝐛𝐢𝐥𝐞 𝐋𝐞𝐠𝐞𝐧𝐝 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐞𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐌𝐢𝐧𝐞𝐜𝐫𝐚𝐟𝐭 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐆𝐭𝐚 𝐕𝐜 𝐕𝐢𝐝𝐞𝐨🎀",
         "𝐖𝐡𝐞𝐫𝐞 𝐰𝐢𝐧𝐝𝐬 𝐦𝐞𝐞𝐭🎀",
         "𝐆𝐞𝐧𝐬𝐡𝐢𝐧 𝐈𝐦𝐩𝐚𝐜𝐭🎀"
        ];
       const itemsPerPage = 10;
       const page = parseInt(args[0]) || 1;
       const totalPages = Math.ceil(displayNames.length / itemsPerPage);
       if (page < 1 || page > totalPages) {
       return api.sendMessage(`❌ Invalid page! Please choose between 1 - ${totalPages}.`, event.threadID, event.messageID);
      }

       const startIndex = (page - 1) * itemsPerPage;
       const endIndex = startIndex + itemsPerPage;
       const displayedCategories = displayNames.slice(startIndex, endIndex);
       const message = `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨\n` +
       "𐙚━━━━━━━━━━━━━━━━━━━━━ᡣ𐭩\n" +
       displayedCategories.map((option, index) => `${startIndex + index + 1}. ${option}`).join("\n") +
       "\n𐙚━━━━━━━━━━━━━━━━━━━━━ᡣ𐭩" +
      `\n♻ | 𝐏𝐚𝐠𝐞 [${page}/${totalPages}]<😘\nℹ | 𝐓𝐲𝐩𝐞 !album ${page + 1} - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞.`.repeat(page < totalPages);
       await api.sendMessage(message, event.threadID, (error, info) => {
       global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, type: "reply",   messageID: info.messageID,  author: event.senderID,  page,  startIndex,  displayNames,
     realCategories: 
       [
        "funny", "islamic",  "sad",  "anime",  "lofi",  "attitude",  "horny", "couple",  "car", "bike", "love",  "lyrics", "cat", "18+","meme",
        "football",  "baby", "friend", "money", "flower",  "naruto", "dragon", "bleach", "demon", "jjk", "solo", "tokyo",  "bluelock",  "cman", "deathnote","onepiece", "attack",
        "sakamoto", "wind",  "onepman","alya", "bluebox",  "hunter", "loner",  "hanime", 
        "neymar","messi", "ronaldo", "vini", "mbappe",  "yamal",  "rapinha",  "dybala",  "pele",  "maradona",  "white",  "ruok",  "b2k",
        "bnl",  "vincenzo", "syblus",  "raistar",  "smooth",  "astatine",  "esports",
        "freefire", "pubg", "cod", "coc", "mlbb",   "efootball",   "minecraft",   "gta",   "wwmeet",    "genshin"                
       ],
        
    captions: 
      [
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😺",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <✨",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😢",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎶",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <☠ ",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💑",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌸",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐢𝐤𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐯𝐞 𝐯𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <❤",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎵",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐱",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝟖+ 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐞𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🔥",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐥",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👭",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐨𝐧𝐞𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐥",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐫𝐚𝐠𝐨𝐧 𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐞𝐚𝐜𝐡 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐞𝐦𝐨𝐧 𝐬𝐲𝐥𝐞𝐫 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐉𝐮𝐣𝐮𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐨𝐥𝐨 𝐥𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐓𝐨𝐤𝐲𝐨 𝐫𝐞𝐯𝐞𝐧𝐠𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐮𝐞 𝐥𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐞𝐚𝐭𝐡 𝐧𝐨𝐭𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐎𝐧𝐞 𝐏𝐢𝐞𝐜𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐚𝐤𝐚𝐦𝐨𝐭𝐨 𝐃𝐚𝐲𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐰𝐢𝐧𝐝 𝐛𝐫𝐞𝐚𝐤𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟", 
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐎𝐧𝐞 𝐩𝐮𝐧𝐜𝐡 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐥𝐲𝐚 𝐑𝐮𝐬𝐬𝐢𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐮𝐞 𝐛𝐨𝐱 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟", 
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐮𝐧𝐭𝐞𝐫 𝐱 𝐇𝐮𝐧𝐭𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",  
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐧𝐞𝐫 𝐥𝐢𝐟𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐚𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐍𝐞𝐲𝐦𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐞𝐬𝐬𝐢 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐑𝐨𝐧𝐚𝐥𝐝𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐕𝐢𝐧𝐢 𝐉𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐛𝐚𝐩𝐩𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐘𝐚𝐦𝐚𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐑𝐚𝐩𝐢𝐧𝐡𝐚 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐲𝐛𝐚𝐥𝐚 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐏𝐞𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐚𝐫𝐚𝐝𝐨𝐧𝐚 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐖𝐡𝐢𝐭𝐞 𝟒𝟒𝟒 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐑𝐮𝐨𝐤 𝐟𝐟 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝟐𝐤  𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐧𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐕𝐢𝐧𝐜𝐞𝐧𝐳𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐲𝐛𝐥𝐮𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐑𝐚𝐢𝐬𝐭𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐦𝐨𝐨𝐭𝐡 𝟒𝟒𝟒 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐬𝐭𝐚𝐭𝐢𝐧𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐅 𝐄𝐬𝐩𝐨𝐫𝐭𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐏𝐮𝐛𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐥𝐥 𝐨𝐟 𝐃𝐮𝐭𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐥𝐚𝐬𝐡 𝐨𝐟 𝐂𝐥𝐚𝐧𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐨𝐛𝐢𝐥𝐞 𝐋𝐞𝐠𝐞𝐧𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐞𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐢𝐧𝐞𝐜𝐫𝐚𝐟𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐆𝐭𝐚 𝐕𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐖𝐡𝐞𝐫𝐞 𝐰𝐢𝐧𝐝𝐬 𝐦𝐞𝐞𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
       "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐆𝐞𝐧𝐬𝐡𝐢𝐧 𝐈𝐦𝐩𝐚𝐜𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘"       ]
        });
      }, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
      api.unsendMessage(Reply.messageID);
      const reply = parseInt(event.body);
      const index = reply - 1;
      if (isNaN(reply) || index < 0 || index >= Reply.realCategories.length) {
      return api.sendMessage("Please reply with a valid number from the list.", event.threadID, event.messageID);
    }

      const category = Reply.realCategories[index];
      const caption = Reply.captions[index];
      const userID = event.senderID; try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/album/mahmud/videos/${category}?userID=${userID}`);
      if (!response.data.success) {
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
     }

      const videoUrls = response.data.videos;
      if (!videoUrls || videoUrls.length === 0) {
      return api.sendMessage("❌ | 𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.", event.threadID, event.messageID);  }
      const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
      const filePath = path.join(__dirname, "temp_video.mp4");
      const downloadFile = async (url, filePath) => {
      const response = await axios({ url, method: "GET", responseType: "stream", headers: { 'User-Agent': 'Mozilla/5.0' }
     });

      return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject); });
    };

    try {
     await downloadFile(randomVideoUrl, filePath);
     api.sendMessage(
     { body: caption, attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);} catch (error) {
     api.sendMessage("❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨, 🥹error, contact MahMUD", event.threadID, event.messageID); }} catch (error) {
     api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
