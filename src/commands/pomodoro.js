const { workMinutes, breakMinutes } = require('../config');
const MINUTE_MS = 60 * 1000;

const state = {
  active: false,
  onBreak: false,
  sessionName: '',
  timer: null,
  startTime: null,
};

function clearTimer() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function resetState() {
  clearTimer();
  state.active = false;
  state.onBreak = false;
  state.sessionName = '';
  state.startTime = null;
}

function getMinutesRemaining(totalMinutes) {
  if (!state.startTime) {
    return totalMinutes;
  }

  const elapsed = (Date.now() - state.startTime) / MINUTE_MS;
  return Number(Math.max(0, totalMinutes - elapsed).toFixed(1));
}

function start(msg, telegram, sessionName) {
  if (!sessionName) {
    telegram.sendMessage(msg.chat.id, 'Please provide a session name, for example: /pomodoro Study');
    return;
  }

  if (state.active) {
    telegram.sendMessage(msg.chat.id, `A session is already running: "${state.sessionName}". Send /pomodoro status or /pomodoro clear.`);
    return;
  }

  if (state.onBreak) {
    clearTimer();
    state.onBreak = false;
  }

  state.sessionName = sessionName;
  state.active = true;
  state.startTime = Date.now();
  state.timer = setTimeout(() => finishWork(msg, telegram), workMinutes * MINUTE_MS);

  telegram.sendMessage(msg.chat.id, `Session "${sessionName}" started. I will notify you in ${workMinutes} minutes.`);
}

function finishWork(msg, telegram) {
  state.active = false;
  state.onBreak = true;
  state.startTime = Date.now();
  state.timer = setTimeout(() => endBreak(msg, telegram), breakMinutes * MINUTE_MS);

  telegram.sendMessage(msg.chat.id, `25 minutes done! Take a break from "${state.sessionName}".`);
}

function endBreak(msg, telegram) {
  state.onBreak = false;
  state.sessionName = '';
  state.startTime = null;
  state.timer = null;

  telegram.sendMessage(msg.chat.id, `7 minutes done. Back to work! You can start a new session with /pomodoro <name>.`);
}

function status(msg, telegram) {
  if (!state.active && !state.onBreak) {
    telegram.sendMessage(msg.chat.id, 'No pomodoro session is currently running. Start one with /pomodoro <name>.');
    return;
  }

  if (state.active) {
    const minutesLeft = getMinutesRemaining(workMinutes);
    telegram.sendMessage(msg.chat.id, `Session "${state.sessionName}" is currently running. You have ${minutesLeft} minute(s) left.`);
    return;
  }

  const minutesLeft = getMinutesRemaining(breakMinutes);
  telegram.sendMessage(msg.chat.id, `You're on break from "${state.sessionName}"! You have ${minutesLeft} minute(s) left before work.`);
}

function breakNow(msg, telegram) {
  if (!state.active) {
    telegram.sendMessage(msg.chat.id, 'No active session to pause. Start one with /pomodoro <name>.');
    return;
  }

  clearTimer();
  state.active = false;
  state.onBreak = true;
  state.startTime = Date.now();
  state.timer = setTimeout(() => endBreak(msg, telegram), breakMinutes * MINUTE_MS);

  telegram.sendMessage(msg.chat.id, `Break started early from "${state.sessionName}". I will notify you in ${breakMinutes} minutes.`);
}

function stop(msg, telegram) {
  if (!state.active && !state.onBreak) {
    telegram.sendMessage(msg.chat.id, 'No pomodoro session is currently running.');
    return;
  }

  resetState();
  telegram.sendMessage(msg.chat.id, 'Pomodoro session stopped. You can start a new session with /pomodoro <name>.');
}

module.exports = {
  start,
  status,
  clear: stop,
  breakNow,
};
