const axios = require("axios");
const availableCmdsUrl = "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/CMDSRUL.json";
const cmdUrlsJson = "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/CMDS.json";
const ITEMS_PER_PAGE = 10;

module.exports.config = {
  name: "cmdstore",
  aliases: ["cmds", "cs"],
  author: "Arafat",
  role: 0,
  version: "1.7",
  description: {
    en: "Commands Store of Arafat",
  },
  countDown: 3,
  category: "general",
  guide: {
    en: "{pn} [command name | single character | page number]",
  },
};

module.exports.onStart = async function ({ api, event, args }) {
  const query = args.join(" ").trim().toLowerCase();
  try {
    const response = await axios.get(availableCmdsUrl);
    let cmds = response.data.cmdName;
    let finalArray = cmds;
    let page = 1;

    if (query) {
      if (!isNaN(query)) {
        page = parseInt(query);
      } else if (query.length === 1) {
        finalArray = cmds.filter(cmd => cmd.cmd.startsWith(query));
        if (finalArray.length === 0) {
          return api.sendMessage(`❌ | No commands found starting with "${query}".`, event.threadID, event.messageID);
        }
      } else {
        finalArray = cmds.filter(cmd => cmd.cmd.includes(query));
        if (finalArray.length === 0) {
          return api.sendMessage(`❌ | Command "${query}" not found.`, event.threadID, event.messageID);
        }
      }
    }

    const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) {
      return api.sendMessage(
        `❌ | Invalid page number. Please enter a number between 1 and ${totalPages}.`,
        event.threadID,
        event.messageID
      );
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const cmdsToShow = finalArray.slice(startIndex, endIndex);

    let msg = `╭─‣ 𝐁𝐎𝐓 𝐂𝐇𝐀𝐍 𝐒𝐓𝐎𝐑𝐄 🎀\n├‣ 𝐀𝐝𝐦𝐢𝐧: 𝐀𝐑𝐀𝐅𝐀𝐓\n├‣ 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${finalArray.length}\n╰────────────◊\n`;

    cmdsToShow.forEach((cmd, index) => {
      msg += `╭─‣ ${startIndex + index + 1}: ${cmd.cmd}\n├‣ Author: ${cmd.author}\n├‣ Update: ${cmd.update}\n╰────────────◊\n`;
    });

    msg += `\n📄 | 𝐏𝐚𝐠𝐞 [${page}-${totalPages}]\nℹ | 𝐓𝐲𝐩𝐞 #cmds ${page + 1} - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞.`;

    api.sendMessage(
      msg,
      event.threadID,
      (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          cmdName: finalArray,
          page: page
        });
      },
      event.messageID
    );
  } catch (error) {
    api.sendMessage(
      "❌ | Failed to retrieve commands.",
      event.threadID,
      event.messageID
    );
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author != event.senderID) {
    return api.sendMessage("not your reaply baby 🐸", event.threadID, event.messageID);
  }
  const reply = parseInt(event.body);
  const startIndex = (Reply.page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  if (isNaN(reply) || reply < startIndex + 1 || reply > endIndex) {
    return api.sendMessage(
      `❌ | Please reply with a number between ${startIndex + 1} and ${Math.min(endIndex, Reply.cmdName.length)}.`,
      event.threadID,
      event.messageID
    );
  }
  try {
    const cmdName = Reply.cmdName[reply - 1].cmd;
    const response = await axios.get(cmdUrlsJson);
    const selectedCmdUrl = response.data[cmdName];
    if (!selectedCmdUrl) {
      return api.sendMessage(
        "❌ | Command URL not found.",
        event.threadID,
        event.messageID
      );
    }
    api.unsendMessage(Reply.messageID);
    const msg = `╭────────◊\n├‣ Command URL: ${selectedCmdUrl}\n╰─────────────◊`;
    api.sendMessage(msg, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(
      "❌ | Failed to retrieve the command URL.",
      event.threadID,
      event.messageID
    );
  }
};
