// Written by Erick Mora
// A discord bot that plays youtube audio and can gather information from webpages for the user.
const Discord = require('discord.js');
const {
  prefix,
  token,
} = require('./config.json');
const inosuke = new Discord.Client();
let chrome = require ('selenium-webdriver/chrome');
const { Builder, By, Key, until, promise, Actions,} = require('selenium-webdriver');
var axis = 20;
const webdriver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments("--window-size=1920,1080")).build();
const fs = require('fs');
const queue = new Map();

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
  const body = (await webdriver).findElement(By.xpath('/html/body'));
  console.log(body);
  if (args[1] == `help`) {
    return message.channel.send(`
      List of current commands: 
      chegg help - This command is working.
      chegg help <command> NOT WORKING YET.
      chegg link <link> - In development...
      chegg bypass - bypass captcha when shown.
      chegg next (Might be temporary)
      chegg options - NOT WORKING YET.
      chegg enable - NOT WORKING YET.
      chegg reset - NOT WORKING YET.
      chegg error <error message> - Not a command yet, Send errors or problems to Erick Mora :D`);
  } else if (args[1] == `link`) {
    let cheggLink = args[2];
    await webdriver.get(cheggLink);
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
    return message.channel.send(args[1] + " Command is incomplete or not a valid chegg command.");
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
      * Implement everything else in -chegg help command.
      - Figure out how to make bot DM Users.
      * DM users chegg images to avoid spam in channels. Another option would be to
      constantly clear chat using bot.
  `)
}

inosuke.login(token);