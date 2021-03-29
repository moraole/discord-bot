// Written by Erick Mora
// A discord bot that plays youtube audio and can gather information from webpages for the user.
const Discord = require('discord.js');
const {
  prefix,
  token,
} = require('./config.json');
const inosuke = new Discord.Client();
let chrome = require ('selenium-webdriver/chrome');
const { Builder, By, Key, until } = require('selenium-webdriver');
const width = 3000
const height = 2000
const webdriver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless().windowSize({ width, height})).build();
const fs = require('fs')
const queue = new Map();
const ytdl = require('ytdl-core');


inosuke.once("ready", () => {
  console.log("Ready!");
});

inosuke.once("reconnecting", () => {
  console.log("Reconnecting!");
});

inosuke.once("disconnect", () => {
  console.log("Disconnect!");
});

inosuke.on("message", async message => {

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);
  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}todo`)) {
    toDo(message)
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}chegg`) || message.content.startsWith(`${prefix}c`)) {
    chegg(message);
  }
  else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function chegg(message) {
  const args = message.content.split(" ");
  if (args[1] == `help`) {
    return message.channel.send(`
      List of current commands: 
      chegg help - This command is working.
      chegg help <command> NOT WORKING YET.
      chegg link <link> - In development...
      chegg options - NOT WORKING YET.
      chegg enable - NOT WORKING YET.
      chegg reset - NOT WORKING YET.
      chegg error <error message> - Not a command yet, Send errors or problems to Erick Mora :D`);
  } else if (args[1] == `link`) {
    let cheggLink = args[2];
    await webdriver.get(cheggLink);
    webdriver.wait(until.elementLocated(By.name('answers-h2')), 5 * 1000);
    
    await webdriver.takeScreenshot().then(function (data) {
      fs.writeFileSync('./images/img.png', data, 'base64');
    });
    message.channel.send("", { files: ["./images/img.png"] });
  } else {
    return message.channel.send(args[1] + " Command is incomplete or not a valid chegg command.");
  }
}

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();

}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}
inosuke.login(token);