const axios = require("axios");

const API_URL = "https://true-false-jade.vercel.app/api/tf";

module.exports = {
  config: {
    name: "tf",
    aliases: ["truefalse"],
    version: "5.1",
    author: "Arafat",
    countDown: 5,
    role: 0,
    category: "game"
  },
  
  onStart: async function ({ api, event, args }) {
    try {
    
      const lang = args[0] === "en" ? "en" : "bn";

      const res = await axios.get(`${API_URL}?lang=${lang}`);
      const data = res.data;

      if (!data?.question || !data?.answer) {
        return api.sendMessage(
          "❌ NO QUESTION AVAILABLE",
          event.threadID
        );
      }

      const questionBox =
        `╭──✦ 𝐓𝐑𝐔𝐄 / 𝐅𝐀𝐋𝐒𝐄 𝐆𝐀𝐌𝐄\n` +
        `├‣ ${data.question}\n` +
        `├‣ 𝗧) 𝐓𝐑𝐔𝐄\n` +
        `├‣ 𝗙) 𝐅𝐀𝐋𝐒𝐄\n` +
        `╰──────────────────‣\n` +
        `𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐓 𝐨𝐫 𝐅`;

      api.sendMessage(questionBox, event.threadID, (err, info) => {
        if (err) return;

       
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          qid: info.messageID,
          answer: data.answer,
          lang
        });
      });
    } catch (err) {
      api.sendMessage(
        "❌ API ERROR · TRY AGAIN",
        event.threadID
      );
    }
  },

  
  onReply: async function ({ api, event, Reply, usersData }) {
    const { author, qid, answer, lang } = Reply;

    
    if (event.senderID !== author) return;

    const userAns = event.body.trim().toUpperCase();
    if (!["T", "F"].includes(userAns)) return;


    await api.unsendMessage(qid);


    const isWin = userAns === answer;

    
    if (isWin) {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } else {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }

    
    let resultText = "";

    if (isWin) {
      const user = await usersData.get(author);
      await usersData.set(author, {
        money: (user.money || 0) + 1000,
        exp: (user.exp || 0) + 200,
        data: user.data || {}
      });

      resultText =
        `╭──✦ 𝐂𝐎𝐑𝐑𝐄𝐂𝐓 𝐀𝐍𝐒𝐖𝐄𝐑\n` +
        `├‣ 🎁 𝐑𝐄𝐖𝐀𝐑𝐃\n` +
        `├‣ 💰 +𝟏𝟎𝟎𝟎 𝐂𝐎𝐈𝐍𝐒\n` +
        `├‣ ✨ +𝟐𝟎𝟎 𝐄𝐗𝐏\n` +
        `╰──────────────────‣`;
    } else {
      resultText =
        `╭──✦ 𝐖𝐑𝐎𝐍𝐆 𝐀𝐍𝐒𝐖𝐄𝐑\n` +
        `├‣ 𝐂𝐎𝐑𝐑𝐄𝐂𝐓: ${answer}\n` +
        `╰──────────────────‣`;
    }

    
    api.sendMessage(resultText, event.threadID, (err, info) => {
      if (err) return;

      const resultMsgID = info.messageID;

      
      setTimeout(async () => {
        const res = await axios.get(`${API_URL}?lang=${lang}`);
        const next = res.data;
        if (!next?.question || !next?.answer) return;

        api.editMessage(
          `╭──✦ 𝐓𝐑𝐔𝐄 / 𝐅𝐀𝐋𝐒𝐄 𝐆𝐀𝐌𝐄\n` +
          `├‣ ${next.question}\n` +
          `├‣ 𝗧) 𝐓𝐑𝐔𝐄\n` +
          `├‣ 𝗙) 𝐅𝐀𝐋𝐒𝐄\n` +
          `╰──────────────────‣\n` +
          `𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐓 𝐨𝐫 𝐅`,
          resultMsgID
        );

        
        global.GoatBot.onReply.set(resultMsgID, {
          commandName: "tf",
          author,
          qid: resultMsgID,
          answer: next.answer,
          lang
        });
      }, 2000);
    });
  }
};
