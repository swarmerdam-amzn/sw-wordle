const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { config } = require('dotenv');

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize AWS clients with proper configuration
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Daily word management
let currentWord = 'WORLD'; // This will be replaced with proper word selection logic
let lastReset = new Date().setHours(0, 0, 0, 0);

// Endpoint to get game state
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Endpoint to get game state
app.get('/api/game', async (req, res) => {
  res.json({
    gameId: new Date().setHours(0, 0, 0, 0),
    wordLength: currentWord.length
  });
});

// Endpoint to submit a guess
app.post('/api/guess', async (req, res) => {
  const { guess, userId } = req.body;

  if (!guess || guess.length !== currentWord.length) {
    return res.status(400).json({ error: 'Invalid guess' });
  }

  const result = evaluateGuess(guess.toUpperCase(), currentWord);

  // Store the guess in DynamoDB
  try {
    await ddbDocClient.send(new PutCommand({
      TableName: 'WordleCloneUserData',
      Item: {
        userId,
        timestamp: Date.now(),
        guess,
        result
      }
    }));
  } catch (error) {
    console.error('Error storing guess:', error);
  }

  res.json({ result });
});

// Admin endpoint to reset the game
app.post('/api/admin/reset', (req, res) => {
  // Add proper admin authentication here
  currentWord = getNewWord();
  lastReset = new Date().setHours(0, 0, 0, 0);
  res.json({ success: true });
});

function evaluateGuess(guess, target) {
  return guess.split('').map((letter, i) => {
    if (letter === target[i]) {
      return { letter, result: 'correct' };
    }
    if (target.includes(letter)) {
      return { letter, result: 'present' };
    }
    return { letter, result: 'absent' };
  });
}

function getNewWord() {
  // Add proper word selection logic here
  const words = ['WORLD', 'HELLO', 'PAPER', 'DREAM', 'CLOUD'];
  return words[Math.floor(Math.random() * words.length)];
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
