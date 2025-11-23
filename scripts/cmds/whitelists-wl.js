const { writeFileSync } = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "whitelists",
		aliases: ["wl"],
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			en: "Add, remove, edit whiteListIds role"
		},
		category: "admin",
		guide: {
			en: '   {pn} [add | -a] <uid | @tag>: Add whiteListIds role for user'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Remove whiteListIds role of user'
				+ '\n	  {pn} [list | -l]: List all whiteListIds'
				+ "   {pn} -m [on | off]: turn on/off the mode only whitelistIds can use bot"
				+ "\n {pn} -m noti [on | off]: turn on/off the notification when user is not whitelistIds use bot"
		}
	},

	langs: {
		en: {
			added: `╭✦✅ | 𝙰𝚍𝚍𝚎𝚍 %1 𝚞𝚜𝚎𝚛/𝚜\n%2`,
			alreadyAdmin: `\n╭✦⚠️ | 𝙰𝚕𝚛𝚎𝚊𝚍𝚢 𝚊𝚍𝚍𝚎d %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			missingAdd: "⚠️ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛 𝚄𝙸𝙳 𝚝𝚘 𝚊𝚍𝚍 𝚠𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝 𝚛𝚘𝚕𝚎",
			removed: `╭✦✅ | 𝚁𝚎𝚖𝚘𝚟𝚎𝚍 %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			notAdmin: `╭✦⚠️ | 𝙳𝚒𝚍𝚗'𝚝 𝚊𝚍𝚍𝚎𝚍 %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			missingIdRemove: "⚠️ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛 𝚄𝙸𝙳 𝚝𝚘 𝚛𝚎𝚖𝚘𝚟𝚎 𝚠𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝 𝚛𝚘𝚕𝚎",
			listAdmin: `╭✦✨ | 𝙻𝚒𝚜𝚝 𝚘𝚏 𝚄𝚜𝚎𝚛𝙸𝙳s\n%1\n╰───────────────────⧕`,
			turnedOn: "✅ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚗 𝚝𝚑𝚎 𝚖𝚘𝚍𝚎 𝚘𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚋𝚘𝚝",
			turnedOff: "❎ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚏𝚏 𝚝𝚑𝚎 𝚖𝚘𝚍𝚎 𝚘𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚋𝚘𝚝",
			turnedOnNoti: "✅ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚗 𝚝𝚑𝚎 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 𝚠𝚑𝚎𝚗 𝚞𝚜𝚎𝚛 𝚒𝚜 𝚗𝚘𝚝 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚞𝚜𝚎 𝚋𝚘𝚝",
			turnedOffNoti: "❎ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚏𝚏 𝚝𝚑𝚎 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 𝚠𝚑𝚎𝚗 𝚞𝚜𝚎𝚛 𝚒𝚜 𝚗𝚘𝚝 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚞𝚜𝚎 𝚋𝚘𝚝"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang, api }) {
		const permission = global.GoatBot.config.adminBot;
		if (!permission.includes(event.senderID)) {
			api.sendMessage(args.join(" "), event.threadID, event.messageID);
			return;
		}
		switch (args[0]) {
			case "add":
			case "-a":
			case "+": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const authorIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							authorIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.whiteListMode.whiteListIds.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `├‣ 𝚄𝚂𝙴𝚁 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
						+ (authorIds.length > 0 ? getLang("alreadyAdmin", authorIds.length, authorIds.map(uid => `├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "rm":
			case "-r":
			case "-": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions)[0];
					else
						uids = args.filter(arg => !isNaN(arg)) || event.messageReply.senderID;
					const notAdminIds = [];
					const authorIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							authorIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of authorIds)
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
					const getNames = await Promise.all(authorIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(authorIds.length > 0 ? getLang("removed", authorIds.length, getNames.map(({ uid, name }) => `├‣ 𝚄𝚂𝙴𝚁 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n├\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.whiteListMode.whiteListIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `├‣ 𝚄𝚂𝙴𝚁 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")));
			}
			case "m":
			case "mode":
			case "-m": {
					let isSetNoti = false;
					let value;
					let indexGetVal = 1;

					if (args[1] == "noti") {
						isSetNoti = true;
						indexGetVal = 2;
					}

					if (args[indexGetVal] == "on")
						value = true;
					else if (args[indexGetVal] == "off")
						value = false;
					if (isSetNoti) {
						config.hideNotiMessage.whiteListMode = !value;
						message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
					}
					else {
						config.whiteListMode.enable = value;
						message.reply(getLang(value ? "turnedOn" : "turnedOff"));
					}

					writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
		}
			default:
		}
	}
};
