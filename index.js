const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const schedule = require("node-schedule");

const client = new Client({
  authStrategy: new LocalAuth(),
});

let reminders = {};

client.on("qr", (qr) => {
  console.log("Scan QR ini di WhatsApp Web:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Bot siap digunakan!");
  console.log(`Nomor bot: ${client.info.wid._serialized}`);
});

function scheduleReminder(user, date, message) {
  const job = schedule.scheduleJob(date, function () {
    client.sendMessage(user, `⏰ Pengingat: ${message}`);
    delete reminders[user];
  });

  reminders[user] = job;
}

client.on("message", async (msg) => {
  console.log(`Pesan dari ${msg.from}: ${msg.body}`);

  let contact = await msg.getContact();
  let userName = contact.pushname || "Pengguna";
  let text = msg.body.toLowerCase().normalize("NFKD").trim();

  if (text === "halo") {
    let welcomeMessage =
      `✨ Selamat datang, *${userName}*! ✨\n\n` +
      `📌 *help* - Menampilkan daftar perintah\n` +
      `📌 *info* - Informasi tentang bot\n` +
      `📌 *ingatkan* - Tambahkan pengingat\n` +
      `📌 *hapus ingatkan* - Hapus semua pengingat\n` +
      `📌 *logout* - Logout dari bot\n\n` +
      `Silakan ketik perintah yang tersedia untuk melanjutkan. 🚀`;

    await msg.reply(welcomeMessage);
  } else if (text === "help") {
    let helpMessage =
      `📖 *Daftar Perintah Bot:*\n\n` +
      `✅ *halo* - Ucapan selamat datang dan bantuan\n` +
      `✅ *info* - Menampilkan informasi tentang bot\n` +
      `✅ *ingatkan* - Tambahkan pengingat\n` +
      `✅ *hapus ingatkan* - Hapus semua pengingat\n` +
      `✅ *logout* - Logout dari bot\n\n`;

    await msg.reply(helpMessage);
  } else if (text === "info") {
    let infoMessage =
      `🤖 *Informasi Bot*\n\n` +
      `📌 Nama: WhatsApp Bot\n` +
      `📌 Dibuat dengan: *whatsapp-web.js*\n` +
      `📌 Developer: ekik the GOAT (kambing njir)\n\n` +
      `📌 WhatsApp: wa.me/6281946425962 \n` +
      `📌 Instagram: instagram.com/filenya_ekik.zip \n\n` +
      `Bot ini masih dalam pengembangan. Nantikan fitur-fitur terbaru! 🚀`;

    await msg.reply(infoMessage);
  } else if (text.startsWith("ingatkan")) {
    let args = msg.body.split(" ");
    if (args.length < 4) {
      return msg.reply(
        "⚠ Format salah! Gunakan: *ingatkan YYYY-MM-DD HH:MM Pesan Pengingat*"
      );
    }

    let dateTime = args[1] + " " + args[2];
    let reminderMsg = args.slice(3).join(" ");
    let date = new Date(dateTime);

    if (isNaN(date.getTime())) {
      return msg.reply("⚠ Format tanggal atau waktu salah!");
    }

    scheduleReminder(msg.from, date, reminderMsg);
    msg.reply(
      `✅ Pengingat berhasil disimpan! Saya akan mengingatkan Anda pada ${dateTime}.`
    );
  } else if (text === "hapus ingatkan") {
    if (reminders[msg.from]) {
      reminders[msg.from].cancel();
      delete reminders[msg.from];
      msg.reply("✅ Semua pengingat telah dihapus!");
    } else {
      msg.reply("⚠ Anda tidak memiliki pengingat aktif.");
    }
  } else if (text === "logout") {
    await msg.reply("Bot akan logout... 🔴");
    await client.logout();
  } else {
    let unknownCommandMessage = `⚠ Saya tidak mengerti. Silakan ketik *help* untuk bantuan.`;
    await msg.reply(unknownCommandMessage);
  }
});

client.initialize();
