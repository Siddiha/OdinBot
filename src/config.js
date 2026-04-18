const path = require('path');

const workMinutes = 25;
const breakMinutes = 7;

const helpText = [
  'Odin Bot — available commands:',
  '/start — show the welcome image and bot status',
  '/help — show this help message',
  '/pomodoro <session name> — start a 25-minute focus session',
  '/pomodoro status — check the current session or break status',
  '/pomodoro clear — stop the current session',
  '/break — start your break early',
  '/stop or /cancel — stop the current session',
].join('\n');

module.exports = {
  workMinutes,
  breakMinutes,
  helpText,
  imagePath: path.join(__dirname, '..', 'images', 'odin.png'),
};
