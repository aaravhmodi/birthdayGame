import { useEffect, useRef, useState } from "react";

const fallingEmojis = ["🎉", "🎂", "⭐", "🎁", "🍰", "❤️"];

type FallingItem = {
  id: number;
  emoji: string;
  x: number;
  y: number;
};

export default function BirthdayGame() {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [basketX, setBasketX] = useState(150);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const gameRef = useRef(null);
  const basketXRef = useRef(basketX);
  const scoreRef = useRef(score);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("birthdayGameHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (showInstructions || gameOver) return;
    const interval = setInterval(() => {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          emoji: fallingEmojis[Math.floor(Math.random() * fallingEmojis.length)],
          x: Math.random() * 280,
          y: 0,
        },
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, [showInstructions, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setBasketX((prev) => Math.max(prev - 30, 0));
      if (e.key === "ArrowRight") setBasketX((prev) => Math.min(prev + 30, 300));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (showInstructions || gameOver) return;
    const fallInterval = setInterval(() => {
      setItems((prev) => {
        const updated = prev
          .map((item) => ({ ...item, y: item.y + 5 }))
          .filter((item) => {
            // check catch
            if (
              item.y >= 440 &&
              item.x >= basketXRef.current - 20 &&
              item.x <= basketXRef.current + 70
            ) {
              setScore((s) => {
                const newScore = s + 1;
                // Update high score in real-time
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem("birthdayGameHighScore", newScore.toString());
                }
                return newScore;
              });
              return false;
            }
            // Game over if item missed (went past bottom)
            if (item.y >= 500) {
              setGameOver(true);
              // Update high score on game over
              if (scoreRef.current > highScore) {
                setHighScore(scoreRef.current);
                localStorage.setItem("birthdayGameHighScore", scoreRef.current.toString());
              }
              return false;
            }
            return true;
          });
        return updated;
      });
    }, 50);
    return () => clearInterval(fallInterval);
  }, [showInstructions, gameOver, highScore]);

  const handleRestart = () => {
    setScore(0);
    setItems([]);
    setBasketX(150);
    setGameOver(false);
  };

  const handleStart = () => {
    setShowInstructions(false);
  };

  const handleMoveLeft = () => {
    setBasketX((prev) => Math.max(prev - 30, 0));
  };

  const handleMoveRight = () => {
    setBasketX((prev) => Math.min(prev + 30, 300));
  };

  // Add keyboard shortcut for restart (R key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        handleRestart();
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  return (
    <div
      ref={gameRef}
      className="relative w-[320px] max-w-full h-[500px] border bg-blue-50 overflow-hidden rounded-lg select-none"
      style={{ maxWidth: '100vw', maxHeight: '100vh' }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-2xl"
          style={{ left: item.x, top: item.y }}
        >
          {item.emoji}
        </div>
      ))}
      <div
        className="absolute bottom-0 w-[60px] h-[30px] bg-pink-400 rounded"
        style={{ left: basketX }}
      ></div>
      
      {/* Score Display */}
      <div className="absolute top-2 left-2 text-lg font-bold">Score: {score}</div>
      <div className="absolute top-2 right-2 text-lg font-bold text-purple-600">
        High: {highScore}
      </div>
      
      {/* Mobile Control Buttons */}
      {!showInstructions && !gameOver && (
        <>
          <button
            onClick={handleMoveLeft}
            onTouchStart={(e) => {
              e.preventDefault();
              handleMoveLeft();
            }}
            className="absolute bottom-12 left-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-2xl font-bold w-14 h-14 rounded-full shadow-lg touch-manipulation select-none flex items-center justify-center transition"
            aria-label="Move left"
          >
            ←
          </button>
          <button
            onClick={handleMoveRight}
            onTouchStart={(e) => {
              e.preventDefault();
              handleMoveRight();
            }}
            className="absolute bottom-12 right-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-2xl font-bold w-14 h-14 rounded-full shadow-lg touch-manipulation select-none flex items-center justify-center transition"
            aria-label="Move right"
          >
            →
          </button>
        </>
      )}

      {/* Restart Button */}
      {!showInstructions && !gameOver && (
        <button
          onClick={handleRestart}
          className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1 px-3 rounded transition touch-manipulation"
          title="Press R to restart"
        >
          Restart
        </button>
      )}

      {/* Instructions Screen */}
      {showInstructions && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col justify-center items-center p-6">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">🎂 Birthday Game 🎂</h1>
          <div className="text-center mb-6">
            <p className="text-lg mb-2">How to Play:</p>
            <p className="mb-2">Move the basket to catch items</p>
            <div className="flex justify-center gap-2 mb-2">
              <span className="bg-gray-200 px-3 py-1 rounded font-bold">←</span>
              <span className="bg-gray-200 px-3 py-1 rounded font-bold">→</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Desktop: Use arrow keys</p>
            <p className="text-sm text-gray-600 mb-2">Mobile: Tap the buttons on screen</p>
            <p className="text-sm text-gray-600">Catch items - don't let them hit the bottom!</p>
            <p className="text-sm text-purple-600 font-bold mt-1">Beat your high score!</p>
          </div>
          <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition touch-manipulation"
          >
            Start Game
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col justify-center items-center p-6">
          <h1 className="text-3xl font-bold mb-2 text-red-500">Game Over!</h1>
          <p className="text-lg mb-4">You missed one! 😢</p>
          <div className="mb-6">
            <p className="text-2xl font-bold text-blue-600">Score: {score}</p>
            <p className="text-xl font-bold text-purple-600 mt-2">High Score: {highScore}</p>
          </div>
          <button
            onClick={handleRestart}
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition touch-manipulation"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
