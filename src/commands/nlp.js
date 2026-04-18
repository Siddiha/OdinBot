const natural = require('natural');
const classifierJSON = require('../data/classifier.json');

const NLGgreetings = ["Hey.", "Hi.", "Hello.", "Greetings.", "Hi, friend.", "Hello, human."];
const NLGfarewells = ["Bye!", "See you.", "Nice working with you.", "Later!", "Goodbye, human!", "Bye bye."];
const NLGsmalltalk = ["Okay.", "Alrighty.", "Yup.", "Uh-huh.", "Hmmm.", "Alright.", "Mhmm.", "Yeah."];

function addIntents(classifier) {
  classifier.addDocument('hello', 'greeting');
  classifier.addDocument('hi', 'greeting');
  classifier.addDocument('howdy', 'greeting');
  classifier.addDocument('hey', 'greeting');
  classifier.addDocument('hola', 'greeting');
  classifier.addDocument('yo', 'greeting');

  classifier.addDocument('bye', 'bye');
  classifier.addDocument('goodbye', 'bye');
  classifier.addDocument('good bye', 'bye');
  classifier.addDocument('later', 'bye');
  classifier.addDocument('farewell', 'bye');
  classifier.addDocument('see ya', 'bye');

  classifier.addDocument('ok', 'smalltalk');
  classifier.addDocument('okay', 'smalltalk');
  classifier.addDocument('alright', 'smalltalk');
  classifier.addDocument('ya', 'smalltalk');
  classifier.addDocument('yeah', 'smalltalk');
  classifier.addDocument('haha', 'smalltalk');

  classifier.train();
}

function checkMatch(label, text) {
  const stemmedWord = natural.PorterStemmer.stem(text.toLowerCase());
  let actualWord = null;

  for (const item of classifierJSON.docs) {
    if (item.label === label) {
      actualWord = item.text[0];
      break;
    }
  }

  if (!actualWord) {
    return false;
  }

  return natural.JaroWinklerDistance(stemmedWord, actualWord) > 0.5;
}

module.exports = {
  addIntents,
  checkMatch,
  NLGgreetings,
  NLGfarewells,
  NLGsmalltalk,
};
  