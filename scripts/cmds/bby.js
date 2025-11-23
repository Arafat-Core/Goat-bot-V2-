const axios = require('axios');
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe"," bot chan"],
    version: "6.9.0",
    author: "dipto edit by Arafat",
    countDown: 0,
    role: 0,
    description: "better then all sim simi",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type #baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, event.threadID, event.messageID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(da, event.threadID, event.messageID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit)
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || "Not found";
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(/\s*-\s*/)[1];
            if (command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`changed ${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply
}) => {
    try {
        if (event.type == "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message
}) => {
    try {
        const body = event.body ? event.body?.toLowerCase() : ""
        if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") || body.startsWith("jan") || body.startsWith("babu") || body.startsWith("janu")) {
            const arr = body.replace(/^\S+\s*/, "")
            const randomReplies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno","ʜᴇʏ ʙᴀʙʏ 😘 ᴋᴏᴛʜᴀʏ ᴄʜɪʟᴀ?",
    "ʙᴀʙʏ, ᴀᴍɪ ᴛᴏᴍᴀʀ ᴏᴘᴇᴋʜʏᴀʏ ᴄʜɪʟᴀᴍ 💖",
    "ᴋɪ ᴋᴏʀᴛᴇᴄʜᴏ ʙᴀʙʏ? 😍",
    "ᴍɪꜱꜱ ᴋᴏʀᴇᴄʜᴏ ᴀᴍᴀᴋᴇ? 🥰",
    "ʏᴇꜱ ʙᴀʙʏ, ᴀᴍɪ ʟɪꜱᴛᴇɴɪɴɢ 👂",
    "ʙᴀʙʏʏʏ~ ᴛᴜᴍɪ ᴀᴍᴀᴋᴇ ᴄᴀʟʟ ᴋᴏʀᴇᴄʜᴏ? 💌",
    "ᴏᴡᴡ ʙᴀʙʏ, ᴛᴜᴍɪ ᴏɴᴇᴋ ᴄᴜᴛᴇ 💕",
    "ʜᴇʏ ʟᴏᴠᴇʀʙᴏʏ/ʟᴏᴠᴇʀɢɪʀʟ 💞",
    "ᴋɪ ᴅᴏᴋᴛᴇ ʙᴀʙʏ~ ᴀᴍɪ ᴀᴄʜɪ 💗",
    "ʙᴀʙʏ, ᴛᴜᴍɪ ᴀᴍᴀʀ ꜱᴘᴇᴄɪᴀʟ ❤️",
    "ʙᴀʙʏ, ᴛᴜᴍɪ ᴄᴀʟʟ ᴋᴏʀʟᴇ ᴀᴍɪ ʀᴜɴ ᴋᴏʀᴇ ᴀꜱʜɪ 😚",
    "ᴀᴍᴀʀ ꜱʜᴏɴᴀ ʙᴀʙʏ ᴋᴏᴛʜᴀʏ ᴄʜɪʟᴏ 💖",
    "ʙᴀʙʏ, ᴛᴏᴍᴀʀ ᴍᴇꜱꜱᴀɢᴇ ᴅᴇᴋʜᴇ ʜᴇᴀʀᴛ ʜᴀᴘᴘʏ 💕",
    "ᴛᴜᴍɪ ᴄᴀʟʟ ᴋᴏʀʟᴇ ᴀᴍɪ ꜱᴍɪʟᴇ ᴋᴏʀɪ 😍",
    "ʙᴀʙʏ, ᴀᴍɪ ᴀᴄʜɪ ᴛᴏᴍᴀʀ ᴊᴏɴɴᴏ ʜᴍᴍ 💗",
    "ᴏʏᴇ ʙᴀʙʏ, ᴛᴜᴍɪ ᴀᴍᴀʀ ꜱᴡᴇᴇᴛ ᴘʀᴏʙʟᴇᴍ 😜",
    "ʙᴀʙʏ, ᴀᴍɪ ᴀᴄʜɪ ᴊᴜꜱᴛ ꜰᴏʀ ʏᴏᴜ 😚",
    "ᴛᴜᴍɪ ᴋᴀʟ ᴋᴏᴛʜᴀʏ ᴄʜɪʟᴏ ʙᴀʙʏ? 🥹",
    "ʙᴀʙʏ, ᴛᴏᴍᴀʀ ᴍᴇꜱꜱᴀɢᴇ ᴀᴍᴀʏ ꜰʟʏ ᴋᴏʀᴀʏ 🕊️",
    "ᴀʟᴡᴀʏꜱ ʏᴏᴜʀꜱ ʙᴀʙʏ 💖",
    "ʙᴀʙʏ, ᴀᴍᴀʀ ʜᴇᴀʀᴛ ᴛᴜᴍᴀʀ ᴡɪꜰɪ ᴛᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ 📶❤️",
    "ʙᴀʙʏ, ᴀᴍɪ ꜱᴜᴅᴜ ᴛᴜᴍᴀʀ ᴊᴏɴɴᴏ ᴏɴʟɪɴᴇ 🌐💗","এই যে আমার হার্ট চোর 😘",
    "বাবু, তোমার জন্য আমি তো সব ছেড়ে আসতে পারি 💖",
    "কি করছো, আমার ভবিষ্যৎ স্বামী ? 😍",
    "তোমার কথা ভাবতে ভাবতে চা ঠান্ডা হয়ে গেল ☕❤️",
    "তুমি কি GPS? কারণ তুমি ছাড়া আমি হারিয়ে যাই 🗺️💗",
    "বাবু, তোমার হাসি না দেখলে দিনটাই অফ 💕",
    "তুমি ডাকলে আমার চার্জ 100% হয়ে যায় 🔋😘",
    "তুমি ছাড়া আমি WiFi ছাড়া ফোনের মতো 📶💔",
    "আমার হৃৎপিণ্ডের অ্যাডমিন তুমি ❤️‍🔥",
    "তুমি কি জাদুকর? দেখলেই মন ভাল হয়ে যায় ✨",
    "বাবু, তুমি আমার গুগল... কারণ আমার সব উত্তর তুমি 💌",
    "তুমি না থাকলে ফেসবুকও বোরিং লাগে 📱💗",
    "আমার হৃদয়ের সিমে শুধু তোমার নাম সেভ আছে 📞❤️",
    "তুমি আসলেই আবহাওয়া সুন্দর হয়ে যায় 🌤️😘",
    "আমার হোয়াটসঅ্যাপের টপ চ্যাট শুধু তুমি 💚",
    "তুমি না থাকলে মনে হয় চার্জার খুলে গেছে 🔌💔",
    "আমার হার্টে তোমার নটিফিকেশন সবসময় অন 📲💖",
    "তুমি কি কফি? তোমাকে ছাড়া ঘুম ভাঙে না ☕😍",
    "তুমি আমার লাইফের VIP গ্রুপে অ্যাড আছো 👑",
    "তুমি পাশে থাকলেই মনে হয় নেট ফাস্ট হয়ে গেছে ⚡💗",
    "তুমি কি মেঘ? আমার মন বৃষ্টিতে ভিজিয়ে দাও 🌧️❤️",
    "তুমি ছাড়া আমি অফলাইন ইউজারের মতো 😅",
    "বাবু, তুমি আমার হাসির রিমিক্স ভার্সন 🎶💓"
];
            if (!arr) {

                await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    if (!info) message.reply("info obj not found")
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID)
            }
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID)
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};
