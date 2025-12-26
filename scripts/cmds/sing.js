const axios = require("axios");
const fs = require("fs");
const ytSearch = require("yt-search");

async function downloadFile(url, fileName) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(fileName, Buffer.from(response));
  return fs.createReadStream(fileName);
}

async function getThumbnailStream(url) {
  const response = await axios.get(url, { responseType: "stream" });
  return response.data;
}

module.exports = {
  config: {
    name: "sing",
    version: "4.1",
    aliases: [],
    author: "Arafat",
    role: 0,
    description: { en: "Music downloader" },
    category: "media"
  },

  onStart: async ({ api, args, event, commandName }) => {
    const keyword = args.join(" ");
    if (!keyword)
      return api.sendMessage("𝑷𝒍𝒆𝒂𝒔𝒆 𝒕𝒚𝒑𝒆 𝒂 𝒔𝒐𝒏𝒈 𝒏𝒂𝒎𝒆.", event.threadID, event.messageID);

    try {
      const apiJson = await axios.get(
        "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json"
      );
      const BASE_API = apiJson.data.api;

      const results = (await ytSearch(keyword)).videos.slice(0, 6);

      if (!results.length)
        return api.sendMessage("𝑵𝒐 𝒔𝒐𝒏𝒈𝒔 𝒇𝒐𝒖𝒏𝒅.", event.threadID, event.messageID);

      let msg = "🎵 𝑺𝒐𝒏𝒈 𝑹𝒆𝒔𝒖𝒍𝒕𝒔:\n\n";
      for (let i = 0; i < results.length; i++) {
        const v = results[i];
        msg += `✨ *${i + 1}.* 𝑻𝒊𝒕𝒍𝒆: ${v.title}\n⏳ 𝑫𝒖𝒓𝒂𝒕𝒊𝒐𝒏: ${v.timestamp}\n📺 𝑪𝒉𝒂𝒏𝒏𝒆𝒍: ${v.author.name}\n\n`;
      }

      const thumbs = await Promise.all(results.map(v => getThumbnailStream(v.thumbnail)));

      api.sendMessage(
        {
          body: msg + "𝑹𝒆𝒑𝒍𝒚 𝒘𝒊𝒕𝒉 𝒂 𝒏𝒖𝒎𝒃𝒆𝒓 (1–6) 𝒕𝒐 𝒅𝒐𝒘𝒏𝒍𝒐𝒂𝒅.",
          attachment: thumbs
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            results,
            BASE_API
          });
        },
        event.messageID
      );

    } catch (err) {
      api.sendMessage("𝑨𝒑𝒊 𝒍𝒐𝒂𝒅 𝒇𝒂𝒊𝒍𝒆𝒅.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply }) => {
    try {
      const { results, BASE_API } = Reply;
      const choice = parseInt(event.body);

      if (isNaN(choice) || choice < 1 || choice > results.length)
        return api.sendMessage("𝑷𝒍𝒆𝒂𝒔𝒆 𝒆𝒏𝒕𝒆𝒓 𝒂 𝒗𝒂𝒍𝒊𝒅 𝒐𝒑𝒕𝒊𝒐𝒏 (1–6).", event.threadID, event.messageID);

      const video = results[choice - 1];

      const apiURL = `${BASE_API}/song?url=${encodeURIComponent(video.url)}`;

      let response, attempts = 0;

      while (attempts < 15) {
        response = await axios.get(apiURL);
        if (response.data.link && response.data.error === false) break;

        attempts++;
        await new Promise(r => setTimeout(r, 1500));
      }

      if (!response.data.link)
        return api.sendMessage("𝑺𝒐𝒏𝒈 𝒏𝒐𝒕 𝒓𝒆𝒂𝒅𝒚. 𝑻𝒓𝒚 𝒂𝒈𝒂𝒊𝒏.", event.threadID, event.messageID);

      const fileName = "audio.mp3";
      await downloadFile(response.data.link, fileName);

      await api.unsendMessage(Reply.messageID);

      api.sendMessage(
        {
          body: `🎧 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅𝒆𝒅:\n${response.data.title}`,
          attachment: fs.createReadStream(fileName)
        },
        event.threadID,
        () => fs.unlinkSync(fileName),
        event.messageID
      );

    } catch (err) {
      api.sendMessage("𝑭𝒂𝒊𝒍𝒆𝒅 𝒕𝒐 𝒇𝒆𝒕𝒄𝒉 𝒂𝒖𝒅𝒊𝒐.", event.threadID, event.messageID);
    }
  }
};
