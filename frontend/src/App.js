// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    const response = await fetch('http://localhost:3001/api/game');
    const data = await response.json();
    setGameState(data);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      submitGuess();
    } else if (event.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (event.key.match(/^[a-zA-Z]$/) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + event.key.toUpperCase());
    }
  };

  const submitGuess = async () => {
    if (currentGuess.length !== 5) return;

    const response = await fetch('http://localhost:3001/api/guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guess: currentGuess,
        userId: 'temp-user-id' // Replace with actual user ID from Cognito
      }),
    });

    const data = await response.json();
    setGuesses(prev => [...prev, data.result]);
    setCurrentGuess('');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGuess]);

  return (
    <div className="App">
      <h1>Wordle Clone</h1>
      <div className="game-board">
        {guesses.map((guess, i) => (
          <div key={i} className="guess-row">
            {guess.map((letter, j) => (
              <div key={j} className={`letter ${letter.result}`}>
                {letter.letter}
              </div>
            ))}
          </div>
        ))}
        <div className="current-guess">
          {currentGuess.padEnd(5, ' ').split('').map((letter, i) => (
            <div key={i} className="letter">
              {letter}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

