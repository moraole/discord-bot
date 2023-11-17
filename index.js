// Written by Erick Mora
// A discord bot that plays youtube audio and can gather information from webpages for the user.
const Discord = require('discord.js');
const {
  prefix,
  token,
} = require('./config.json');
const DBot = new Discord.Client();
let chrome = require ('selenium-webdriver/chrome');
const { Builder, By, Key, until, promise, Actions,} = require('selenium-webdriver');
var axis = 20;
const webdriver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments("--window-size=1920,1080")).build();
const fs = require('fs');
const queue = new Map();

DBot.once("ready", () => {
  
  console.log("Ready!");
});

DBot.once("reconnecting", () => {
  console.log("Reconnecting!");
});

DBot.once("disconnect", () => {
  console.log("Disconnect!");
});

DBot.on("message", async message => {

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
  } else if (message.content.startsWith(`${prefix}DBot`) || message.content.startsWith(`${prefix}c`)) {
    DBot(message);
  }
  else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function DBot(message) {
  const args = message.content.split(" ");
  const body = (await webdriver).findElement(By.xpath('/html/body'));
  console.log(body);
  if (args[1] == `help`) {
    return message.channel.send(`
      List of current commands: 
      DBot help - This command is working.
      DBot help <command> NOT WORKING YET.
      DBot link <link> - In development...
      DBot bypass - bypass captcha when shown.
      DBot next (Might be temporary)
      DBot options - NOT WORKING YET.
      DBot enable - NOT WORKING YET.
      DBot reset - NOT WORKING YET.
      DBot error <error message> - Not a command yet, Send errors or problems to Erick Mora :D`);
  } else if (args[1] == `link`) {
    let DBotLink = args[2];
    await webdriver.get(DBotLink);
    webdriver.wait(until.elementLocated(By.xpath('/html/body')), 5 * 1000);
    
    await webdriver.takeScreenshot().then(function (data) {
      fs.writeFileSync('./images/img.png', data, 'base64');
    });
    message.channel.send("", { files: ["./images/img.png"] });
  }else if (args[1] == `next`) {
    body.sendKeys(Key.PAGE_DOWN);
    webdriver.wait(until.elementLocated(By.xpath('/html/body')), 5 * 1000);
    await webdriver.takeScreenshot().then(function (data) {
      fs.writeFileSync('./images/img.png', data, 'base64');
    });
    message.channel.send("", { files: ["./images/img.png"] });
  } else if (args[1] == `bypass`) {
    
  }
  else {
    return message.channel.send(args[1] + " Command is incomplete or not a valid DBot command.");
  }
}
/**
 * Returns list of commands needing some work to be done.
 *
 * @param {string} 
 * @return {string} message.channel.send() a message with things to do to get the bot fully functioning.
 */
 function toDo(message) {
  return message.channel.send(
  `   fix all async functions (including toDo) using **module.exports**
      ** Answer only display **
      Final step: Remove elements and print results!
      - Add other commands
      * Implement everything else in -DBot help command.
      - Figure out how to make bot DM Users.
      * DM users DBot images to avoid spam in channels. Another option would be to
      constantly clear chat using bot.
  `)
}

DBot.login(token);
