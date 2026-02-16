// Imports your SCSS stylesheet
import "@/styles/index.scss";

let attemptsLeft = 3; //Set "lives" here
let gameOver = false; //Sets clean gamestate
const attemptsDisplay = document.getElementById("attempts") as HTMLSpanElement; //Grab the attempts/lives counter line

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
} //Enum of cards so they are tracked more smoothly.

interface Card {
  id: number;
  value: CardValue;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
} //Interface used here to track the detailed states of each card

const cardElement = document.createElement("div");
cardElement.classList.add("card");

const CARD_VALUES = Object.values(CardValue).filter(
  (v) => typeof v === "number",
) as number[]; //Create a set from the enum values and ensures they are numbers.

let deck: Card[] = [];
let firstCard: Card | null = null;
let secondCard: Card | null = null;
let lockBoard = false;

const board = document.getElementById("board") as HTMLDivElement;

// Create deck
function createDeck(): Card[] {
  let id = 0;

  // Step 1: Shuffle all possible values with a function.
  const shuffledValues = shuffle([...CARD_VALUES]);

  // Step 2: Take only first 3 values of the new shuffled cards
  const selectedValues = shuffledValues.slice(0, 3);

  // Step 3: Create pairs of the 3 cards made.
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

// Shuffle function, takes the fed array, randomizing the array item location
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; //Unsort array via location swaps
  }
  return array;
}

// Handle card click
function selectCard(card: Card) {
  if (lockBoard || card.isFlipped || card.isMatched || gameOver) return; //If game isnt playable or card is flipped already, do nothing.

  card.isFlipped = true;

  if (!firstCard) {
    firstCard = card;
    render();
    return;
  } //if there is no firstcard - set it to card clicked, render, and return.

  secondCard = card;
  lockBoard = true;
  render();

  checkMatch(); //On second card clicked, Check if they are a match.
}

function checkMatch() {
  if (!firstCard || !secondCard) return; //Error catching - if called early.

  if (firstCard.value === secondCard.value) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    resetTurn();
    checkWin(); //If card 1 and 2 match, Check if last cards to match.
  } else {
    attemptsLeft--; //No match = lose a "life"
    attemptsDisplay.textContent = attemptsLeft.toString();
    setTimeout(() => {
      firstCard!.isFlipped = false;
      secondCard!.isFlipped = false;
      resetTurn();
      render(); //Unflip both cards, render update.
      if (attemptsLeft === 0) {
        endGame(); //Game Over
      }
    }, 1000); //How long till the card flips back over when wrong. Felt this is long enough.
    return;
  }

  render();
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
} //Resets turn to a clean state using cards to null and board no longer locked.

//End States
function checkWin() {
  if (deck.every((card) => card.isMatched)) {
    message.textContent = "You Won!";
  }
}

function endGame() {
  gameOver = true;
  message.textContent = "Game Over!";
}

// Render board - all the game board updates.
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
} //Resets attempts, gameover tracking, Set cards back to null to clear them, reset board lockout, recreate a new play deck, reset attempts, clear gameover/win messaging. Render new game.

document.getElementById("restart")!.addEventListener("click", restartGame);
