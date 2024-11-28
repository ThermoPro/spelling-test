const wordsInput = document.getElementById('wordsInput');
const startBtn = document.getElementById('startBtn');
const gameContainer = document.getElementById('gameContainer');
const spokenWord = document.getElementById('spokenWord');
const userInput = document.getElementById('userInput');
const checkBtn = document.getElementById('checkBtn');
const repeatBtn = document.getElementById('repeatBtn');
const feedback = document.getElementById('feedback');
const definitionEl = document.getElementById('definition');
const nextBtn = document.getElementById('nextBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScore = document.getElementById('finalScore');

let words = [];
let currentWordIndex = 0;
let score = { correct: 0, incorrect: 0 };

startBtn.addEventListener('click', () => {
  words = wordsInput.value.split(',').map(word => word.trim());
  if (words.length === 0) {
    alert('Please enter some words!');
    return;
  }
  startGame();
});

function updateScoreDisplay() {
  scoreDisplay.textContent = `Correct: ${score.correct} | Incorrect: ${score.incorrect}`;
}

async function startGame() {
  currentWordIndex = 0;
  score = { correct: 0, incorrect: 0 };
  updateScoreDisplay();
  gameContainer.classList.remove('hidden');
  startBtn.classList.add('hidden');
  wordsInput.classList.add('hidden');
  nextWord();
}

async function nextWord() {
  if (currentWordIndex >= words.length) {
    endGame();
    return;
  }

  const word = words[currentWordIndex];
  definitionEl.classList.add('hidden'); // Hide definitions initially
  feedback.textContent = ''; // Clear feedback

  spokenWord.textContent = `Listen to the word.`;
  speakWord(word);
}

async function fetchDefinitions(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error('Word not found');
    const data = await response.json();
    return data[0]?.meanings.flatMap(meaning => meaning.definitions.map(def => def.definition)) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(utterance);
}

repeatBtn.addEventListener('click', () => {
  const word = words[currentWordIndex];
  speakWord(word); // Replay the current word
});

checkBtn.addEventListener('click', async () => {
  const userSpelling = userInput.value.trim().toLowerCase();
  const correctSpelling = words[currentWordIndex].toLowerCase();

  if (userSpelling === correctSpelling) {
    feedback.textContent = 'Correct!';
    feedback.style.color = 'green';
    score.correct++;
  } else {
    feedback.textContent = `Incorrect! The correct spelling is "${correctSpelling}".`;
    feedback.style.color = 'red';
    score.incorrect++;
  }

  updateScoreDisplay();

  // Fetch and show definitions after checking spelling
  const definitions = await fetchDefinitions(words[currentWordIndex]);
  if (definitions.length > 0) {
    definitionEl.classList.remove('hidden');
    definitionEl.innerHTML = `<strong>Definitions (up to 5):</strong><br>` +
      definitions.slice(0, 5).map((def, index) => `${index + 1}. ${def}`).join('<br>');
  } else {
    definitionEl.classList.remove('hidden');
    definitionEl.innerHTML = 'No definitions available.';
  }

  userInput.value = ''; // Clear input field
  nextBtn.classList.remove('hidden');
  checkBtn.classList.add('hidden');
  repeatBtn.classList.add('hidden');
});

nextBtn.addEventListener('click', () => {
  nextBtn.classList.add('hidden');
  checkBtn.classList.remove('hidden');
  repeatBtn.classList.remove('hidden');
  currentWordIndex++;
  nextWord();
});

function endGame() {
  gameContainer.classList.add('hidden');
  finalScore.classList.remove('hidden');
  finalScore.textContent = `Final Score: Correct: ${score.correct}, Incorrect: ${score.incorrect}`;
  startBtn.textContent = 'Restart';
  startBtn.classList.remove('hidden');
  wordsInput.classList.remove('hidden');
}
