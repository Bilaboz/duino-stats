const net = require('net');
const {MessageEmbed} = require('discord.js');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const axios = require('axios');
const WebSocket = require('ws');

const timeout = 5000;
const config = require('../utils/config.json');
dayjs.extend(customParseFormat);
let cooldown = new Set();

module.exports.run =
    async (client, message, args, color) => {
  if (cooldown.has(message.author.id)) {
    return message.channel.send(`**${
        message.author
            .username}** you can only execute this command every 10 seconds!`);
  } else {
    cooldown.add(message.author.id);
    setTimeout(() => {cooldown.delete(message.author.id)}, 10000)
  }

  const displayStatus =
      (serverStatus, AVRserverStatus, ESPserverStatus, walletServerStatus,
       statsStatus, webServicesStatus, PCserverStatus, PC2serverStatus,
       PC3serverStatus, webminerProxy, starStatus, beyondStatus,
       svkostatus, difference) => {
        const editedStatusEmbed =
            new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL())
                .setFooter(client.user.username, client.user.avatarURL())
                .setTimestamp()

        let finalstring = 'Status check results:\n'

        finalstring +=
            ' :point_right: Master server:\n'

        if (serverStatus) finalstring +=
            '2811: **General purpose port**: <:true:709441577503817799>\n';
        else finalstring +=
            '2811: **General purpose port**: ⚠️ (timeout)\n';

        if (walletServerStatus)
          finalstring +=
              '2812: **General purpose port**: <:true:709441577503817799>\n';
        else
          finalstring += '2812: **General purpose port**: ⚠️ (timeout)\n';

        if (PCserverStatus)
          finalstring +=
              '2813: **General purpose port**: <:true:709441577503817799>\n';
        else
          finalstring += '2813: **General purpose port**: ⚠️ (timeout)\n';

        if (AVRserverStatus)
          finalstring +=
              '2810: **Pool sync port**: <:true:709441577503817799>\n';
        else
          finalstring += '2810: **Pool sync port**: ⚠️ (timeout)\n';

        finalstring += 'Worker limit: **Mining disabled**\n';

        finalstring +=
            ' :point_right: StarPool:\n';

        if (starStatus)
          finalstring +=
              `6006: **General mining port**:  <:true:709441577503817799>\n`;
        else
          finalstring += `6006: **General mining port**: ⚠️ (timeout)\n`;

        finalstring += 'Worker limit: **50 miners**\n';

        finalstring += ' :point_right: BeyondPool:\n';

        if (beyondStatus)
          finalstring +=
              `6000: **General mining port**:  <:true:709441577503817799>\n`;
        else
          finalstring += `6000: **General mining port**: ⚠️ (timeout)\n`;

        finalstring += 'Worker limit: **50 miners**\n';

        finalstring += ' :point_right: SvkoPool:\n';

        if (svkostatus)
          finalstring +=
              `6000: **General mining port**:  <:true:709441577503817799>\n`;
        else
          finalstring += `6000: **General mining port**: ⚠️ (timeout)\n`;

        finalstring += 'Worker limit: **50 miners**\n';

        finalstring += ' :point_right: Other services:\n';

        if (difference > 60)
          difference = `${parseInt(difference / 60)} minutes`;
        else {
          if (difference === 0)
            difference = `now`;
          else if (difference === 1)
            difference = `${difference} second ago`;
          else
            difference = `${difference} seconds ago`;
        }

        if (statsStatus)
          finalstring +=
              `80: **Duino-Coin REST API**: <:true:709441577503817799> (Last update: ${
                  difference})\n`;
        else if (!statsStatus)
          finalstring +=
              `80: **Duino-Coin REST API**: <:nop:692067038453170283> (Last update: ${
                  difference})\n`;
        else
          finalstring += `80: **Duino-Coin REST API**: ⚠️ (Last update: ${
              difference})\n`;

        if (webminerProxy)
          finalstring +=
              `14808: **Web Miner websocket proxy**:  <:true:709441577503817799>\n`;
        else
          finalstring +=
              `14808: **Web Miner websocket proxy**: ⚠️ (timeout)\n`;

        finalstring +=
            `\nRemember to firstly check the <#677615873409941522> channel if something's wrong`;

        editedStatusEmbed.setColor(color.green);
        editedStatusEmbed.setDescription(finalstring);
        message.channel.stopTyping();
        m.edit(editedStatusEmbed);
      }

  const statusEmbed =
      new MessageEmbed()
          .setAuthor(message.author.username, message.author.avatarURL())
          .setFooter(client.user.username, client.user.avatarURL())
          .setTimestamp()
          .setDescription(
              'Please wait **' + Math.round(timeout / 1000) +
              ' seconds** - pinging **Duino-Coin** services...')

  const m = await message.channel.send(statusEmbed);

  let statsStatus, serverStatus, walletServerStatus, AVRserverStatus,
      ESPserverStatus, difference, webServicesStatus, PCserverStatus,
      PC2serverStatus, PC3serverStatus, webminerProxy, starStatus,
      svkostatus, beyondStatus;

  // ------------ Statistics Status ------------ //
  message.channel.startTyping();
  let response;
  try {
    response = await axios.get('http://127.0.0.1/statistics');
  } catch (err) {
    console.log(err);
    statsStatus = false;
  }

  try {
    let lastUpdate = response.data['Last update'].slice(0, -6);
    lastUpdate = dayjs(lastUpdate, 'DD/MM/YYYY hh:mm:ss');

    const now = dayjs()
    difference = now.diff(lastUpdate, 'seconds');

    if (difference <= 120) {
      statsStatus = true;
    } else if (difference > 120) {
      statsStatus = 'partial';
    } else {
      statsStatus = false;
    }
  } catch (err) {
    console.log(err);
    statsStatus = false;
  }

  // ------------ Webminer proxy status ------------ //
  try {
    const ws2 = new WebSocket(
        'wss://server.duinocoin.com:14808',
        {origin: 'https://51.15.127.80'});

    ws2.on('message', () => {
      webminerProxy = true;
    });

    ws2.on('timeout', () => {
      webminerProxy = false;
    });

    ws2.on('error', () => {
      webminerProxy = false;
    });
  } catch (err) {
    webminerProxy = false;
  }

  // ------------ Legacy Server Status ------------ //

  const socket_l = new net.Socket();
  socket_l.setEncoding('utf8');
  socket_l.setTimeout(timeout);
  socket_l.connect(2811, '127.0.0.1');

  socket_l.on('error', () => {
    serverStatus = false;
  });

  socket_l.on('timeout', () => {
    serverStatus = false;
    socket_l.end();
  })

  socket_l.once('data', () => {
    serverStatus = true;
    socket_l.end();
  })


  // ------------ PC Server Status ------------ //

  const socket_pc = new net.Socket();
  socket_pc.setEncoding('utf8');
  socket_pc.setTimeout(timeout);
  socket_pc.connect(2813, '127.0.0.1');

  socket_pc.on('error', () => {
    PCserverStatus = false;
  });

  socket_pc.on('timeout', () => {
    PCserverStatus = false;
    socket_pc.end();
  })

  socket_pc.once('data', () => {
    PCserverStatus = true;
    socket_pc.end();
  })

  // ------------ PC2 Server Status ------------ //

  const socket_pc2 = new net.Socket();
  socket_pc2.setEncoding('utf8');
  socket_pc2.setTimeout(timeout);
  socket_pc2.connect(2816, '127.0.0.1');

  socket_pc2.on('error', () => {
    PC2serverStatus = false;
  });

  socket_pc2.on('timeout', () => {
    PC2serverStatus = false;
    socket_pc2.end();
  })

  socket_pc2.once('data', () => {
    PC2serverStatus = true;
    socket_pc2.end();
  })

  // ------------ Arduino Server Status ------------ //

  const socket_avr = new net.Socket();
  socket_avr.setEncoding('utf8');
  socket_avr.setTimeout(timeout);
  socket_avr.connect(2810, '127.0.0.1');

  socket_avr.on('error', () => {
    AVRserverStatus = false;
  });

  socket_avr.on('timeout', () => {
    AVRserverStatus = false;
    socket_avr.end();
  })

  socket_avr.once('data', () => {
    AVRserverStatus = true;
    socket_avr.end();
  })

  // ------------ ESP Server Status ------------ //

  const socket_esp = new net.Socket();
  socket_esp.setEncoding('utf8');
  socket_esp.setTimeout(timeout);
  socket_esp.connect(2809, '127.0.0.1');

  socket_esp.on('error', () => {
    ESPserverStatus = false;
  });

  socket_esp.on('timeout', () => {
    ESPserverStatus = false;
    socket_esp.end();
  });

  socket_esp.once('data', () => {
    ESPserverStatus = true;
    socket_esp.end();
  });

  // ------------ Wallet Server Status ------------ //

  const socket_w = new net.Socket();
  socket_w.setEncoding('utf8');
  socket_w.setTimeout(timeout);
  socket_w.connect(2812, '127.0.0.1');

  socket_w.on('error', () => {
    walletServerStatus = false;
  });

  socket_w.on('timeout', () => {
    walletServerStatus = false;
    socket_w.end();
  });

  socket_w.once('data', () => {
    walletServerStatus = true;
    socket_w.end();
  });

  // ------------ PC3 Server Status ------------ //

  const socket_pc3 = new net.Socket();
  socket_pc3.setEncoding('utf8');
  socket_pc3.setTimeout(timeout);
  socket_pc3.connect(2817, '127.0.0.1');

  socket_pc3.on('error', () => {
    PC3serverStatus = false;
  });

  socket_pc3.on('timeout', () => {
    PC3serverStatus = false;
    socket_pc3.end();
  });

  socket_pc3.once('data', () => {
    PC3serverStatus = true;
    socket_pc3.end();
  });

  // ------------ Star pool status ------------ //

  const socket_star = new net.Socket();
  socket_star.setEncoding('utf8');
  socket_star.setTimeout(timeout);
  socket_star.connect(6006, '51.158.182.90');

  socket_star.on('error', () => {
    starStatus = false;
  });

  socket_star.on('timeout', () => {
    starStatus = false;
    socket_star.end();
  })

  socket_star.once('data', () => {
    starStatus = true;
    socket_star.end();
  })

  // ------------ Beyond pool status ------------ //

  const socket_beyond = new net.Socket();
  socket_beyond.setEncoding('utf8');
  socket_beyond.setTimeout(timeout);
  socket_beyond.connect(6000, 'beyondpool.io');

  socket_beyond.on('error', () => {
    beyondStatus = false;
  });

  socket_beyond.on('timeout', () => {
    beyondStatus = false;
    socket_beyond.end();
  })

  socket_beyond.once('data', () => {
    beyondStatus = true;
    socket_beyond.end();
  })

  // ------------ Beyond pool status ------------ //

  const socket_svko = new net.Socket();
  socket_svko.setEncoding('utf8');
  socket_svko.setTimeout(timeout);
  socket_svko.connect(6000, '5.230.69.132');

  socket_svko.on('error', () => {
    svkostatus = false;
  });

  socket_svko.on('timeout', () => {
    svkostatus = false;
    socket_svko.end();
  })

  socket_svko.once('data', () => {
    svkostatus = true;
    socket_svko.end();
  })

  setTimeout(() => {
    displayStatus(
        serverStatus, AVRserverStatus, ESPserverStatus, walletServerStatus,
        statsStatus, webServicesStatus, PCserverStatus, PC2serverStatus,
        PC3serverStatus, webminerProxy, starStatus, beyondStatus,
        svkostatus, difference);
  }, timeout);
}

module.exports.config = {
  name: 'serverstatus',
  aliases: ['status', 'server', 'servers', 'nodes', 'node'],
  category: 'general',
  desc: 'Display the status of the servers',
  usage: ''
}
