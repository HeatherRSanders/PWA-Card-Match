// Imports your SCSS stylesheet
import "@/styles/index.scss";

let attemptsLeft = 3;
let gameOver = false;
const attemptsDisplay = document.getElementById("attempts") as HTMLSpanElement;
const message = document.getElementById("message") as HTMLHeadingElement;

attemptsDisplay.textContent = attemptsLeft.toString();

enum CardValue {
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
}

interface Card {
  id: number;
  value: CardValue;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const cardElement = document.createElement("div");
cardElement.classList.add("card");

const CARD_VALUES = Object.values(CardValue).filter(
  (v) => typeof v === "number",
) as number[]; //Create a set from the enum values and ensures they are numbers.

let deck: Card[] = [];
let firstCard: Card | null = null;
let secondCard: Card | null = null;
let lockBoard = false;

const board = document.getElementById("game-board") as HTMLDivElement;

// Create deck
function createDeck(): Card[] {
  let id = 0;

  // Step 1: Shuffle all possible values
  const shuffledValues = shuffle([...CARD_VALUES]);

  // Step 2: Take only first 3 values
  const selectedValues = shuffledValues.slice(0, 3);

  // Step 3: Create pairs
  const cards: Card[] = selectedValues.flatMap((value) => [
    {
      id: id++,
      value,
      image: `images/${value}.png`,
      isFlipped: false,
      isMatched: false,
    },
    {
      id: id++,
      value,
      image: `images/${value}.png`,
      isFlipped: false,
      isMatched: false,
    },
  ]);

  // Step 4: Shuffle the 6 cards
  return shuffle(cards);
}

// Shuffle
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Handle card click
function selectCard(card: Card) {
  if (lockBoard || card.isFlipped || card.isMatched || gameOver) return;

  card.isFlipped = true;

  if (!firstCard) {
    firstCard = card;
    render();
    return;
  }

  secondCard = card;
  lockBoard = true;
  render();

  checkMatch();
}

function checkMatch() {
  if (!firstCard || !secondCard) return;

  if (firstCard.value === secondCard.value) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    resetTurn();
    checkWin();
  } else {
    attemptsLeft--;
    attemptsDisplay.textContent = attemptsLeft.toString();
    setTimeout(() => {
      firstCard!.isFlipped = false;
      secondCard!.isFlipped = false;
      resetTurn();
      render();
      if (attemptsLeft === 0) {
        endGame();
      }
    }, 1000);
    return;
  }

  render();
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function checkWin() {
  if (deck.every((card) => card.isMatched)) {
    message.textContent = "You Won!";
  }
}

function endGame() {
  gameOver = true;
  message.textContent = "Game Over!";
}

// Render board
function render() {
  board.innerHTML = "";

  deck.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");

    const img = document.createElement("img");
    img.src =
      card.isFlipped || card.isMatched ? card.image : "images/card-image.png";

    cardElement.appendChild(img);

    cardElement.addEventListener("click", () => {
      selectCard(card);
    });

    board.appendChild(cardElement);
  });
}

// Init game
deck = createDeck();
render();

function restartGame() {
  attemptsLeft = 3;
  gameOver = false;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  deck = createDeck();
  attemptsDisplay.textContent = attemptsLeft.toString();
  message.textContent = "";
  render();
}

document.getElementById("restart")!.addEventListener("click", restartGame);
