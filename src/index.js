const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const natural = require('natural');
const config = require('./config');
const nlpControl = require('./commands/nlp');
const pomo = require('./commands/pomodoro');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('Missing TELEGRAM_TOKEN. Create a .env file with TELEGRAM_TOKEN=your_token or set the env var.');
  process.exit(1);
}

const telegram = new TelegramBot(token, { polling: true });
const classifier = new natural.BayesClassifier();

nlpControl.addIntents(classifier);

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

telegram.onText(/^\/start$/, (msg) => {
  try {
    telegram.sendPhoto(msg.chat.id, fs.createReadStream(config.imagePath), { caption: 'Welcome to Odin Bot' });
  } catch (err) {
    telegram.sendMessage(msg.chat.id, 'Welcome to Odin Bot');
  }
});

telegram.onText(/^\/help$/, (msg) => {
  telegram.sendMessage(msg.chat.id, config.helpText);
});

telegram.onText(/^\/(stop|cancel)$/, (msg) => {
  pomo.clear(msg, telegram);
});

telegram.onText(/^\/break$/, (msg) => {
  pomo.breakNow(msg, telegram);
});

telegram.onText(/\/pomodoro (.+)/, (msg, match) => {
  const prompt = match[1].trim();

  if (/^status$/i.test(prompt)) {
    pomo.status(msg, telegram);
    return;
  }

  if (/^clear$/i.test(prompt)) {
    pomo.clear(msg, telegram);
    return;
  }

  pomo.start(msg, telegram, prompt);
});

telegram.on('message', (message) => {
  if (!message.text) {
    return;
  }

  const text = message.text.trim();
  if (text.startsWith('/')) {
    const knownCommand = /^\/(start|help|pomodoro|break|stop|cancel)/i.test(text);
    if (!knownCommand) {
      telegram.sendMessage(message.chat.id, 'Unknown command. Send /help for a list of available commands.');
    }
    return;
  }

  const classifications = classifier.getClassifications(text);
  const best = classifications[0] || {};

  const isGreeting = best.label === 'greeting' && nlpControl.checkMatch('greeting', text);
  const isBye = best.label === 'bye' && nlpControl.checkMatch('bye', text);
  const isSmalltalk = best.label === 'smalltalk' && nlpControl.checkMatch('smalltalk', text);

  if (isGreeting) {
    telegram.sendMessage(message.chat.id, randomItem(nlpControl.NLGgreetings));
  } else if (isBye) {
    telegram.sendMessage(message.chat.id, randomItem(nlpControl.NLGfarewells));
  } else if (isSmalltalk) {
    telegram.sendMessage(message.chat.id, randomItem(nlpControl.NLGsmalltalk));
  } else {
    telegram.sendMessage(message.chat.id, 'Sorry, I did not understand that. Send /help for commands.');
  }
});
