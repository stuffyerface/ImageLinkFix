//This module uses STuF
//github.com/stuffyerface/STuF

// Before:
// https://i.imgur.com/wFNORYo.png
// After:
// l$H117|iimgurcom/wFNORYo

// Rules:
// Prefix with l$
// Replace http:// with h and https:// with H
// Follow with 0 for other, 1 for png, 2 for jpg, 3 forjpeg, 4 for gif 
// in the remaining string, get index of "." <= 9 and add indices as ints followed by |
// The rest of the string is shifted by one character

import settings from "./config";

register('chat', (event) => {
  if(!settings.globalToggle){
    return;
  }
  let modified = false
  const message = new Message(EventLib.getMessage(event)).getMessageParts()
  let newMessage = new Message()
  for(let component of message){
    let filtered = resolveTextComponent(component)
    if(filtered[0]){
      modified = true
      if(settings.arrowToggle){
        newMessage.addTextComponent(new TextComponent("&9➭").setHoverValue("This link was decoded by ImageLinkFix"))
      }
      newMessage.addTextComponent(filtered[1])
    } else {
      newMessage.addTextComponent(component)
    }
  }
  if(modified){
    cancel(event)
    newMessage.chat()
  }
})

register('messageSent', (msg, event) => {
  if(settings.linksToEncode == 2 || !settings.globalToggle){
    return;
  }
  let words = msg.split(" ")
  let modified = false

  for (let i = 0; i < words.length; i++) {
    let currentWord = words[i]
    if(settings.linksToEncode == 1 && currentWord.includes("youtube.com") || currentWord.includes("youtu.be") || currentWord.includes("hypixel.net") || currentWord.includes("plancke.io")){ 
      continue;
    }
    if (currentWord.startsWith("http")) {
      words[i] = stufEncode(currentWord)
      modified = true
    }
  }

  if (modified) {
    let newMessage = words.join(" ")
    ChatLib.say(newMessage)
    cancel(event)
  }
})

function resolveTextComponent(text){
  let words = text.getText().split(" ")
  let modifiedIndices = []

  for (let i = 0; i < words.length; i++) {
    let working = stripFormatting(words[i])
    if (working.startsWith("l$")) {
      let link = stufDecode(working)
      words[i] = link
      modifiedIndices.push(i)
    }
  }

  if (modifiedIndices.length > 0) {
    let retVal = [true, new TextComponent(words.join(" "))]
    return retVal;
  } else {
    return [false]
  }
}

function stripFormatting(input){
  let regex = /§[0-9A-FK-OR]/gi;
  return input.replace(regex, "")
}

function stufDecode(encoded) {
  if (!encoded.startsWith('l$')) {
    throw new Error('Invalid encoded string');
  }
  let prefix = encoded[2];
  let suffix = encoded[3];
  let dotIndices = encoded.slice(4, encoded.indexOf('|')).split('').map(Number);
  let urlBody = encoded.slice(encoded.indexOf('|') + 1);

  let first9 = urlBody.slice(0, 9 - dotIndices.length);
  let then = urlBody.slice(9 - dotIndices.length).replace(/\^/g, '.');

  let url = first9 + then;
  url = charInc(url,-1)

  // Restore the dots in the first part of the URL
  dotIndices.forEach((index) => {
    url = url.slice(0, index) + '.' + url.slice(index);
  });

  // Add the prefix back
  if (prefix === 'h') {
    url = 'http://' + url;
  } else if (prefix === 'H') {
    url = 'https://' + url;
  }

  // Add the suffix back
  if (suffix === '1') {
    url += '.png';
  } else if (suffix === '2') {
    url += '.jpg';
  } else if (suffix === '3') {
    url += '.jpeg';
  } else if (suffix === '4') {
    url += '.gif';
  }

  return url;
}

function stufEncode(url) {
  let encoded = "l$"
  if (url.startsWith('http://')) {
    encoded += 'h';
    url = url.slice(7); // Remove the 'http://' part
  } else if (url.startsWith('https://')) {
    encoded += 'H';
    url = url.slice(8); // Remove the 'https://' part
  }

  if (url.endsWith('.png')) {
    encoded += '1';
    url = url.slice(0, -4); // Remove the '.png' part
  } else if (url.endsWith('.jpg')) {
    encoded += '2';
    url = url.slice(0, -4); // Remove the '.jpg' part
  } else if (url.endsWith('.jpeg')) {
    encoded += '3';
    url = url.slice(0, -5); // Remove the '.jpeg' part
  } else if (url.endsWith('.gif')) {
    encoded += '4';
    url = url.slice(0, -4); // Remove the '.gif' part
  } else {
    encoded += '0';
  }

  let dotIndices = [];
  for (let i = 0; (i < url.length) && (i <= 9); i++) {
    if (url[i] === '.') {
      dotIndices.push(i);
      if (dotIndices.length === 9) break; // Stop after 9 dots
    }
  }

  let first9 = url.substring(0, 9)
  let then = url.substring(9).replace(/\./g, '^');
  first9 = first9.replace(/\./g, '');
  let shifted = charInc(first9+then,1)

  encoded += dotIndices.map(index => index.toString()).join('') + '|';
  encoded += shifted


  return encoded;
}

function charInc(str, int) {
  const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let incrementedStr = '';
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    let index = charSet.indexOf(char);

    if (index !== -1) {
      // Get the next character in the set, wrap around using modulo operator
      let nextChar = charSet[(index + int) % charSet.length];
      incrementedStr += nextChar;
    } else {
      // If the character is not in the set, keep it unchanged
      incrementedStr += char;
    }
  }
  return incrementedStr;
}

register('command', (...args) => {
  link = args.join(" ")
  link = stufEncode(link)
  ChatLib.chat(`new link: &b&n${link}`)
}).setName("stufe")


register('command', (...args) => {
  link = args.join(" ")
  link = stufDecode(link)
  ChatLib.chat(`${link}`)
}).setName("stufd")

register('command', () => {
  settings.openGUI();
  return
}).setCommandName("imagelinkfix").setAliases("ilf").setAliases("stuf")