const { ovlcmd, cmd } = require("../framework/ovlcmd");
const config = require("../set");
const { translate } = require('@vitalets/google-translate-api');
const prefixe = config.PREFIXE;
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { TempMail } = require("tempmail.lol");
const JavaScriptObfuscator = require('javascript-obfuscator');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

ovlcmd(
    {
        nom_cmd: "test",
        classe: "Outils",
        react: "🌟",
        desc: "Tester la connectivité du bot"
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const mess = `🌐 Bienvenue sur *OVL-MD*, votre bot WhatsApp multi-device.🔍 Tapez *${prefixe}menu* pour voir toutes les commandes disponibles.\n> ©2025 OVL-MD By *AINZ*`;
            const img = 'https://telegra.ph/file/8173c870f9de5570db8c3.jpg';
            await ovl.sendMessage(ms_org, { 
                image: { url: img }, 
                caption: mess 
            }, { quoted: cmd_options.ms });
        } catch (error) {
            console.error("Erreur lors de l'envoi du message de test :", error.message || error);
        }
    }
);


ovlcmd(
    {
        nom_cmd: "description",
        classe: "Outils",
        desc: "Affiche la liste des commandes avec leurs descriptions ou les détails d'une commande spécifique.",
        alias: ["desc", "help"],
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const { arg, ms } = cmd_options;
            const commandes = cmd;

            if (arg.length) {
                const recherche = arg[0].toLowerCase();
                const commandeTrouvee = commandes.find(
                    (c) =>
                        c.nom_cmd.toLowerCase() === recherche ||
                        c.alias.some((alias) => alias.toLowerCase() === recherche)
                );

                if (commandeTrouvee) {
                    const message = `📜 *Détails de la commande :*\n\n` +
                        `Nom : *${commandeTrouvee.nom_cmd}*\n` +
                        `Alias : [${commandeTrouvee.alias.join(", ")}]\n` +
                        `Description : ${commandeTrouvee.desc}`;
                    return await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
                } else {
                    return await ovl.sendMessage(ms_org, {
                        text: `❌ Commande ou alias "${recherche}" introuvable. Vérifiez et réessayez.`,
                    }, { quoted: ms });
                }
            }

            let descriptionMsg = "📜 *Liste des commandes disponibles :*\n\n";
            commandes.forEach((cmd) => {
                descriptionMsg += `Nom : *${cmd.nom_cmd}*\nAlias : [${cmd.alias.join(", ")}]\nDescription : ${cmd.desc}\n\n`;
            });

            await ovl.sendMessage(ms_org, { text: descriptionMsg }, { quoted: ms });
        } catch (error) {
            console.error("Erreur lors de l'affichage des descriptions :", error.message || error);
            await ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de l'affichage des descriptions." }, { quoted: cmd_options.ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "menu",
        classe: "Outils",
        react: "🔅",
        desc: "affiche le menu du bot",
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const seconds = process.uptime();
            const j = Math.floor(seconds / 86400);
            const h = Math.floor((seconds / 3600) % 24);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            let uptime = '';
            if (j > 0) uptime += `${j}J `;
            if (h > 0) uptime += `${h}H `;
            if (m > 0) uptime += `${m}M `;
            if (s > 0) uptime += `${s}S`;

            const lien = `${config.MENU}`;
            const commandes = cmd;
            let menu = `╭───❏ 🄾🅅🄻 🄼🄳 ❏
│ ✿ Prefixe => ${config.PREFIXE}
│ ✿ Owner => ${config.NOM_OWNER}
│ ✿ Commandes => ${commandes.length}
│ ✿ Uptime => ${uptime.trim()}
│ ✿ Développeur => AINZ
╰══════════════⊷\n\n`;

            // Regrouper les commandes par classe
            const cmd_classe = {};
            commandes.forEach((cmd) => {
                if (!cmd_classe[cmd.classe]) {
                    cmd_classe[cmd.classe] = [];
                }
                cmd_classe[cmd.classe].push(cmd);
            });

            // Trier chaque classe par nom_cmd
            for (const [classe, cmds] of Object.entries(cmd_classe)) {
                cmd_classe[classe] = cmds.sort((a, b) =>
                    a.nom_cmd.localeCompare(b.nom_cmd, undefined, { numeric: true })
                );
            }

            // Générer le menu
            for (const [classe, cmds] of Object.entries(cmd_classe)) {
                menu += `╭───❏ ${classe} ❏\n`;
                cmds.forEach((cmd) => {
                    menu += `│☞ ${cmd.nom_cmd}\n`;
                });
                menu += `╰═══════════════⊷\n\n`;
            }

            menu += "> ©2025 OVL-MD WA-BOT";
            await ovl.sendMessage(ms_org, { image: { url: lien }, caption: menu }, { quoted: cmd_options.ms });
        } catch (error) {
            console.error("Erreur lors de la génération du menu :", error);
        }
    }
);

ovlcmd(
    {
        nom_cmd: "vv",
        classe: "Outils",
        react: "👀",
        desc: "Affiche un message envoyé en vue unique",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms, msg_Repondu, repondre } = cmd_options;

        if (!msg_Repondu) {
            return repondre("Veuillez mentionner un message en vue unique.");
        }

        let viewOnceKey = Object.keys(msg_Repondu).find(key => key.startsWith("viewOnceMessage"));
        let vue_Unique_Message = msg_Repondu;

        if (viewOnceKey) {
            vue_Unique_Message = msg_Repondu[viewOnceKey].message;
        }

        if (vue_Unique_Message) {
            if (
                (vue_Unique_Message.imageMessage && vue_Unique_Message.imageMessage.viewOnce !== true) ||
                (vue_Unique_Message.videoMessage && vue_Unique_Message.videoMessage.viewOnce !== true) ||
                (vue_Unique_Message.audioMessage && vue_Unique_Message.audioMessage.viewOnce !== true)
            ) {
                return repondre("Ce message n'est pas un message en vue unique.");
            }
        }

        try {
            let media;
            let options = { quoted: ms };

            if (vue_Unique_Message.imageMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.imageMessage);
                await ovl.sendMessage(
                    ms_org,
                    { image: { url: media }, caption: vue_Unique_Message.imageMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.videoMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.videoMessage);
                await ovl.sendMessage(
                    ms_org,
                    { video: { url: media }, caption: vue_Unique_Message.videoMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.audioMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.audioMessage);
                await ovl.sendMessage(
                    ms_org,
                    { audio: { url: media }, mimetype: "audio/mp4", ptt: false },
                    options
                );

            } else {
                return repondre("Ce type de message en vue unique n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("❌ Erreur lors de l'envoi du message en vue unique :", _error.message || _error);
            return repondre("Une erreur est survenue lors du traitement du message.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "vv2",
        classe: "Outils",
        react: "👀",
        desc: "Affiche un message envoyé en vue unique en inbox",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms, msg_Repondu, repondre } = cmd_options;

        if (!msg_Repondu) {
            return repondre("Veuillez mentionner un message en vue unique.");
        }

        let viewOnceKey = Object.keys(msg_Repondu).find(key => key.startsWith("viewOnceMessage"));
        let vue_Unique_Message = msg_Repondu;

        if (viewOnceKey) {
            vue_Unique_Message = msg_Repondu[viewOnceKey].message;
        }

        if (vue_Unique_Message) {
            if (
                (vue_Unique_Message.imageMessage && vue_Unique_Message.imageMessage.viewOnce !== true) ||
                (vue_Unique_Message.videoMessage && vue_Unique_Message.videoMessage.viewOnce !== true) ||
                (vue_Unique_Message.audioMessage && vue_Unique_Message.audioMessage.viewOnce !== true)
            ) {
                return repondre("Ce message n'est pas un message en vue unique.");
            }
        }

        try {
            let media;
            let options = { quoted: ms };

            if (vue_Unique_Message.imageMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.imageMessage);
                await ovl.sendMessage(
                    ovl.user.id,
                    { image: { url: media }, caption: vue_Unique_Message.imageMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.videoMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.videoMessage);
                await ovl.sendMessage(
                    ovl.user.id,
                    { video: { url: media }, caption: vue_Unique_Message.videoMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.audioMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.audioMessage);
                await ovl.sendMessage(
                    ovl.user.id,
                    { audio: { url: media }, mimetype: "audio/mp4", ptt: false },
                    options
                );

            } else {
                return repondre("Ce type de message en vue unique n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("❌ Erreur lors de l'envoi du message en vue unique :", _error.message || _error);
            return repondre("Une erreur est survenue lors du traitement du message.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "ping",
        classe: "Outils",
        react: "🏓",
        desc: "Mesure la latence du bot.",
    },
    async (ms_org, ovl, cmd_options ) => {
        const start = Date.now();
        await ovl.sendMessage(ms_org, { text: "Ping..." }, { quoted: cmd_options.ms });
        const end = Date.now();
        const latency = end - start;
        await ovl.sendMessage(ms_org, { text: `🏓 Pong ! Latence : ${latency}ms` }, { quoted: cmd_options.ms });
    }
);

ovlcmd(
    {
        nom_cmd: "uptime",
        classe: "Outils",
        react: "⏱️",
        desc: "Affiche le temps de fonctionnement du bot.",
        alias: ["upt"],
    },
    async (ms_org, ovl, cmd_options) => {
        const seconds = process.uptime();
        const j = Math.floor(seconds / 86400);
        const h = Math.floor((seconds / 3600) % 24);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        let uptime = '';
        if (j > 0) uptime += `${j}J `;
        if (h > 0) uptime += `${h}H `;
        if (m > 0) uptime += `${m}M `;
        if (s > 0) uptime += `${s}S`;
        await ovl.sendMessage(ms_org, { text: `⏳ Temps de fonctionnement : ${uptime}` }, { quoted: cmd_options.ms });
    }
);

ovlcmd(
    {
        nom_cmd: "translate",
        classe: "Outils",
        react: "🌍",
        desc: "Traduit un texte dans la langue spécifiée.",
        alias: ["trt"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, msg_Repondu } = cmd_options;
        let lang, text;

        if (msg_Repondu && arg.length === 1) {
            lang = arg[0];
            text = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
        } else if (arg.length >= 2) {
            lang = arg[0];
            text = arg.slice(1).join(" ");
        } else {
            return await ovl.sendMessage(ms_org, { text: `Utilisation : ${prefixe}translate <langue> <texte> ou répondre à un message avec : ${prefixe}translate <langue>` }, { quoted: ms });
        }

        try {
            const result = await translate(text, { to: lang });
            await ovl.sendMessage(ms_org, { text: `🌐Traduction (${lang}) :\n${result.text}` }, { quoted: ms });
        } catch (error) {
            console.error("Erreur lors de la traduction:", error);
            await ovl.sendMessage(ms_org, { text: "Erreur lors de la traduction. Vérifiez la langue et le texte fournis." }, { quoted: ms });
        }
    }
);

/*const apiKeys = [
  'eb1ac1cc00374b7eab9ce2cfdc0f32c1',
  '7da8a6dfb4e14b9a94eae88c0e28d91b',
  'd945dda8cec14d93abcfdc34699d6972',
  'ac178ffa00c643dab03d520b20f55834',
  '03cfff7ed6694c7bbb516582d945c996',
  '0884920bcc334ff8974289ee96f03d70',
  'c40c653724d34e6db1f2f4be05a31e90',
  'aad767f8993f42c881b43ba72138d449',
  '970b11fa69ca4edb936a73a74c003380',
  '751ef792c29b465492ec455d6d6e5ddf',
  '3348a0db815243b782fbc88041527d1a',
  '3f1206ea1cc64243bcf975260ab74fd4',
  '8320407ae8b54d5dae19c518dcab5e18',
  '495bb083bc51463faab491fc2226bbba',
  '37bc96866acb47a98bc4ed058684d2db'
];

async function captureScreenshot(url) {
  for (const apiKey of apiKeys) {
    try {
      const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&wait_until=page_loaded&url=${url}`;
      console.log(`Essai avec la clé API: ${apiKey}`); // Log pour vérifier quelle clé est utilisée
      const response = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "GoogleBot",
      },
    });
      console.log('Capture réussie avec la clé API:', apiKey); // Log pour succès
      return response.data;
    } catch (error) {
      console.error(`Erreur avec la clé API ${apiKey}:`, error.message); // Log d'erreur
    }
  }
  throw new Error('Impossible de récupérer la capture d\'écran, toutes les clés API ont échoué.');
}*/

ovlcmd(
  {
    nom_cmd: "capture",
    classe: "Outils",
    react: "📸",
    desc: "Prend une capture d'écran d'un site web.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, prefixe, ms } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: `Entrez un lien`,
      }, { quoted: ms });
    }

  /*  const url = arg[0];

    try {
      const screenshot = await captureScreenshot(url);

      await ovl.sendMessage(ms_org, {
        image:  Buffer.from(screenshot),
        caption: `Voici la capture d'écran de: ${url}`,
      });
*/
      try { 
          await ovl.sendMessage(ms_org, {
        image: `https://image.thum.io/get/fullpage/${arg[0]}`,
        caption: `Voici la capture d'écran de: ${url}`,
      }, { quoted: ms });
    } catch (error) {
      console.error('Erreur lors de la capture de l\'écran:', error.message); // Log pour l'erreur générale
      return ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de la capture du site. Veuillez réessayer plus tard.",
      }, { quoted: ms });
    }
  }
);

const os = require('os');

ovlcmd(
  {
    nom_cmd: "system_status",
    classe: "Outils",
    react: "🖥️",
    desc: "Affiche les informations du système en temps réel"
  },
  async (ms_org, ovl, cmd_options) => {
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();
    const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const hostname = os.hostname();
    const loadAverage = os.loadavg();
    const uptimeSeconds = os.uptime();

    const j = Math.floor(uptimeSeconds / 86400);
    const h = Math.floor((uptimeSeconds / 3600) % 24);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = Math.floor(uptimeSeconds % 60);
    let uptime = '';
    if (j > 0) uptime += `${j}J `;
    if (h > 0) uptime += `${h}H `;
    if (m > 0) uptime += `${m}M `;
    if (s > 0) uptime += `${s}S`;

    const cpuUsage = cpus.map(cpu => {
      let total = 0;
      for (type in cpu.times) {
        total += cpu.times[type];
      }
      const usage = ((100 - (cpu.times.idle / total) * 100)).toFixed(2);
      return usage + "%";
    }).join(", ");

    const serverSpeed = (100 - loadAverage[0] * 100 / cpus.length).toFixed(2);

    await ovl.sendMessage(ms_org, {
      text: `🖥️ *ÉTAT DU SYSTÈME*\n\n` +
            `⚡ *Vitesse du serveur*: ${serverSpeed} %\n` +
            `🖧 *Charge Moyenne*: ${loadAverage.map(l => l.toFixed(2)).join(", ")}\n` +
            `⏳ *Uptime*: ${uptime.trim()}\n` +
            `💻 *Plateforme*: ${platform}\n` +
            `🔧 *Architecture*: ${arch}\n` +
            `🖧 *Processeur*: ${cpus.length} Cœur(s) (${cpuUsage})\n` +
            `💾 *Mémoire Totale*: ${totalMemory} GB\n` +
            `🆓 *Mémoire Libre*: ${freeMemory} GB\n` +
            `🌐 *Nom de l'Hôte*: ${hostname}\n` +
            `🎉 *Version*: OVL-MD 1.0.0`
    }, { quoted: cmd_options.ms });
  }
);

ovlcmd(
    {
        nom_cmd: "qr",
        classe: "Outils",
        desc: "Génère un QR code pour obtenir une session_id.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms } = cmd_options;
        
        try {
            const response = await axios.get(`https://quickest-elise-ainz-oest-org-53269c8e.koyeb.app/qr`);
            const qrImageBase64 = response.data;

            const filePath = path.join(__dirname, 'qr_code.png');  

            fs.writeFile(filePath, qrImageBase64, 'base64', async (err) => {
                if (err) {
                    console.error("Erreur lors de l'écriture du fichier :", err);
                    await ovl.sendMessage(ms_org, { text: "Désolé, il y a eu une erreur lors de la génération du QR code." }, { quoted: ms });
                } else {
                    console.log("Image sauvegardée avec succès !");
                    
                    await ovl.sendMessage(ms_org, {
                        image: { url: filePath, caption: "Scannez ce QR code" }
                    }, { quoted: ms });
                }
            });

        } catch (error) {
            console.error("Erreur lors de la génération du QR code:", error);
            await ovl.sendMessage(ms_org, { text: "Désolé, il y a eu une erreur lors de la génération du QR code." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "pair",
        classe: "Outils",
        desc: "Génère un pair_code pour obtenir une session_id",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
       if(!arg) {
            return await ovl.sendMessage(ms_org, { text: "entrer un numéro de téléphone" }, { quoted: ms });
        }
        const bc = arg.join(" ");

        try {
            let response = await axios(`https://quickest-elise-ainz-oest-org-53269c8e.koyeb.app/code?number=${bc}`);
            let code = response.data.code || "indisponible";

            await ovl.sendMessage(ms_org, {
                text: `CODE : ${code}`,
            }, { quoted: ms });
        } catch (error) {
            console.error("Erreur lors de la génération du code:", error);
            await ovl.sendMessage(ms_org, { text: "Désolé, il y a eu une erreur lors de la génération du code." }, { quoted: ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "tempmail",
    classe: "Outils",
    react: "📧",
    desc: "Crée un email temporaire."
  },
  async (ms_org, ovl, cmd_options) => {
    const { ms } = cmd_options;

    try {
      const tempmail = new TempMail();
      const inbox = await tempmail.createInbox();
      
      const emailMessage = `Voici votre adresse email temporaire : ${inbox.address}\n\nVotre token est : ${inbox.token}\n\nPour récupérer vos messages, utilisez <tempinbox votre-token>.`;

      await ovl.sendMessage(ms_org, { text: emailMessage }, {quoted: ms});
      
    } catch (error) {
      console.error(error);
      return ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la création de l'email temporaire." }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tempinbox",
    classe: "Outils",
    react: "📩",
    desc: "Récupère les messages d'un email temporaire."
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0]) return ovl.sendMessage(ms_org, { text: "Pour récupérer les messages de votre email temporaire, fournissez le token qui a été émis." });

    try {
      const tempmail = new TempMail();
      const emails = await tempmail.checkInbox(arg[0]);

      if (!emails || emails.length === 0) {
        return ovl.sendMessage(ms_org, { text: "Aucun message trouvé pour ce token." }, {quoted: ms});
      }

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const sender = email.sender;
        const subject = email.subject;
        const date = new Date(email.date).toLocaleString();

        const messageBody = email.body;

        const mailMessage = `👥 Expéditeur : ${sender}\n📝 Sujet : ${subject}\n🕜 Date : ${date}\n📩 Message : ${messageBody}`;

        await ovl.sendMessage(ms_org, { text: mailMessage }, {quoted: ms});
      }
      
    } catch (error) {
      console.error(error);
      return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de la récupération des messages de l'email temporaire." }, {quoted: ms});
    }
  }
);

ovlcmd(
  {
    nom_cmd: "obfuscate",
    classe: "Outils",
    react: "📥",
    desc: "Obfusque du code JavaScript",
    alias: ['obf'],
  },  
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, ms } = cmd_options;
    if (!arg || arg.length === 0) return repondre("Veuillez fournir le code JavaScript à obfusquer.");
    const codeToObfuscate = arg.join(" ");
    try {
      repondre('🔄obfucation en cours...');
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(codeToObfuscate, { compact: true, controlFlowFlattening: true }).getObfuscatedCode();
      const tempFilePath = path.join(__dirname, 'obfuscate.js');
      fs.writeFileSync(tempFilePath, obfuscatedCode);
      await ovl.sendMessage(ms_org, { document: { url: tempFilePath }, mimetype: 'application/javascript', fileName: 'obfuscate.js' }, { quoted: ms });
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error(error);
      repondre("Une erreur est survenue lors de l'obfuscation du code.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "gitclone",
    classe: "Outils",
    react: "📥",
    desc: "clone un repo Git",
    alias: ['gcl'],
  },  
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, ms } = cmd_options;
    if (!arg || arg.length < 1) return repondre("Veuillez fournir l'URL du dépôt Git à cloner.");
    const dp = arg[0];
    const repoUrl = dp + '.git';
    const destination = arg[1] ? arg[1] : path.basename(repoUrl, '.git');
    const tempZipPath = `${destination}.zip`;
    const gitUrlPattern = /^(https?:\/\/|git@)([\w.@:\/-]+)(\.git)(\/?)$/;
    if (!gitUrlPattern.test(repoUrl)) return repondre("URL de dépôt Git invalide.");
    try {
      repondre(`🔄Clonage du dépôt en cours...`);
      exec(`git clone ${repoUrl} ${destination}`, (error, stdout, stderr) => {
        if (error) return repondre(`Erreur lors du clonage du dépôt : ${error.message}`);
        try {
          const zip = new AdmZip();
          zip.addLocalFolder(destination);
          zip.writeZip(tempZipPath);
          const documentMessage = { document: fs.readFileSync(tempZipPath), mimetype: 'application/zip', fileName: `${destination}.zip` };
          ovl.sendMessage(ms_org, documentMessage, { quoted: ms });
          fs.rmSync(destination, { recursive: true, force: true });
          fs.unlinkSync(tempZipPath);
        } catch (zipError) {
          repondre(`Erreur lors de la compression en zip : ${zipError.message}`);
        }
      });
    } catch (error) {
      console.error(error);
      repondre("Une erreur est survenue lors du clonage du dépôt.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "owner",
    classe: "Outils",
    react: "🔅",
    desc: "Numero du propriétaire du bot",
  },  
  async (ms_org, ovl, cmd_options) => {
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + config.NOM_OWNER + '\n' +
      'ORG:undefined;\n' +
      'TEL;type=CELL;type=VOICE;waid=' + config.NUMERO_OWNER + ':+' + config.NUMERO_OWNER + '\n' + 
      'END:VCARD';

    ovl.sendMessage(ms_org, {
      contacts: {
        displayName: config.NOM_OWNER,
        contacts: [{ vcard }],
      },
    }, { quoted: cmd_options.ms });
  }
);

ovlcmd(
  {
    nom_cmd: "developpeur",
    classe: "Outils",
    react: "🔅",
    desc: "Numero du créateur du bot",
    alias: ['dev'],
  },  
  async (ms_org, ovl, cmd_options) => {
    const devNum = '22651463203';
    const devNom = 'Ainz';

    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + devNom + '\n' +
      'ORG:undefined;\n' +
      'TEL;type=CELL;type=VOICE;waid=' + devNum + ':+' + devNum + '\n' + 
      'END:VCARD';

    ovl.sendMessage(ms_org, {
      contacts: {
        displayName: devNom,
        contacts: [{ vcard }],
      },
    }, { quoted: cmd_options.ms });
  }
);


ovlcmd(
  {
    nom_cmd: "support",
    classe: "Outils",
    react: "📩",
    desc: "Lien vers le groupe de support du bot",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, repondre, auteur_msg, ms } = cmd_options;

    const inviteLink = 'https://chat.whatsapp.com/HzhikAmOuYhFXGLmcyMo62';
    const message = `📩 *OVL-MD SUPPORT*\nVoici le lien pour rejoindre le groupe:\n${inviteLink}`;

    if (verif_Groupe) {
      await repondre("📩 Le lien d'invitation a été envoyé en message privé.");
      await ovl.sendMessage(auteur_msg, { text: message }, { quoted: ms });
    } else {
      await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
    }
  }
);
