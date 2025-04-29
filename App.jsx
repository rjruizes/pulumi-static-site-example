import React, { useState, useEffect, useRef } from 'react';
import { CodeBlock, AnimatedText as AnimatedBlank } from './components';
import './App.css';

const LINES_DATA = [
  {
    sentence: [
      { type: 'text', content: 'def hasDuplicate(self, nums: List[int]) -> bool:\n  ' },
      { type: 'blank', id: 0 },
      { type: 'text', content: ' = set()\n  for ' },
      { type: 'blank', id: 1 },
      { type: 'text', content: ' in nums:' }
    ],
    words: ['seen', 'num'],
    hint: 'Initialize an empty set to keep track of numbers we\'ve seen, and start a loop to iterate through each number in the array.',
    solution: ['seen', 'num']
  },
  {
    sentence: [
      { type: 'text', content: 'def hasDuplicate(self, nums: List[int]) -> bool:\n  seen = set()\n  for num in nums:\n    if ' },
      { type: 'blank', id: 0 },
      { type: 'text', content: ' in ' },
      { type: 'blank', id: 1 },
      { type: 'text', content: ':' }
    ],
    words: ['num', 'seen'],
    hint: 'Check if the current number is already in our set of seen numbers.',
    solution: ['num', 'seen']
  },
  {
    sentence: [
      { type: 'text', content: 'def hasDuplicate(self, nums: List[int]) -> bool:\n  seen = set()\n  for num in nums:\n    if num in seen:\n      return ' },
      { type: 'blank', id: 0 },
      { type: 'text', content: '\n    seen.add(' },
      { type: 'blank', id: 1 },
      { type: 'text', content: ')' }
    ],
    words: ['True', 'num'],
    hint: 'If we found a duplicate, return True. Otherwise, add the current number to our set of seen numbers.',
    solution: ['True', 'num']
  },
  {
    sentence: [
      { type: 'text', content: 'def hasDuplicate(self, nums: List[int]) -> bool:\n  seen = set()\n  for num in nums:\n    if num in seen:\n      return True\n    seen.add(num)\n  return ' },
      { type: 'blank', id: 0 },
      { type: 'text', content: '' }
    ],
    words: ['False', 'True'],
    hint: 'If we\'ve checked all numbers and found no duplicates, return False.',
    solution: ['False']
  }
];

// Move shuffleArray outside the component
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper function to convert the line data to a code string with placeholders
const convertLineDataToCode = (lineData) => {
  let code = '';
  lineData.sentence.forEach(part => {
    if (part.type === 'text') {
      code += part.content;
    } else if (part.type === 'blank') {
      code += '___'; // Use the placeholder pattern expected by CodeBlock
    }
  });
  return code;
};

function App() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [words, setWords] = useState(shuffleArray([...LINES_DATA[0].words]));
  const [blanks, setBlanks] = useState(['', '']);
  const [previousCode, setPreviousCode] = useState('');

  const currentLine = LINES_DATA[currentLineIndex];

  const checkLineCompletion = (newBlanks) => {
    if (newBlanks.every((blank, i) => blank === currentLine.solution[i])) {
      setTimeout(() => {
        if (currentLineIndex < LINES_DATA.length - 1) {
          // Save current code before moving to next line
          setPreviousCode(codeString);
          setCurrentLineIndex(currentLineIndex + 1);
          setBlanks(['', '']);
          setWords(shuffleArray([...LINES_DATA[currentLineIndex + 1].words]));
        }
      }, 500);
    }
  };

  const handleWordSelect = (word) => {
    // Find the first empty blank
    const firstEmptyIndex = blanks.findIndex(blank => blank === '');

    // If there's an empty blank, fill it
    if (firstEmptyIndex !== -1) {
      const newBlanks = [...blanks];
      newBlanks[firstEmptyIndex] = word;
      setBlanks(newBlanks);

      // Remove the word from the word bank
      const newWords = words.filter((_, idx) => idx !== words.findIndex(w => w === word));
      setWords(newWords);

      checkLineCompletion(newBlanks);
    }
  };

  const resetGame = () => {
    setCurrentLineIndex(0);
    setWords(shuffleArray([...LINES_DATA[0].words]));
    setBlanks(['', '']);
  };



  // Convert the current line data to a code string with placeholders
  const codeString = convertLineDataToCode(currentLine);

  // Create components array for the blanks with refs to control animations
  const blankRefs = useRef([]);

  // Keep track of which blanks have been animated
  const animatedBlanksRef = useRef(new Set());

  // Initialize refs array and reset animated blanks tracking when line changes
  useEffect(() => {
    blankRefs.current = currentLine.sentence
      .filter(part => part.type === 'blank')
      .map(() => React.createRef());

    // Reset the set of animated blanks when moving to a new line
    animatedBlanksRef.current = new Set();
  }, [currentLineIndex]);

  // Trigger animation only for newly filled blanks
  useEffect(() => {
    blanks.forEach((blank, index) => {
      // Only animate if:
      // 1. The blank has content
      // 2. We have a valid ref
      // 3. This blank hasn't been animated before
      if (blank &&
          blankRefs.current[index] &&
          blankRefs.current[index].current &&
          !animatedBlanksRef.current.has(index)) {

        // Mark this blank as animated
        animatedBlanksRef.current.add(index);

        // Slight delay to ensure the component is ready
        setTimeout(() => {
          blankRefs.current[index].current.setIsRevealed(true);
        }, 50);
      }
    });
  }, [blanks]);

  // Find the index of the first empty blank (if any)
  const firstEmptyBlankIndex = blanks.findIndex(blank => blank === '');

  // Create components array for the blanks
  const blankComponents = currentLine.sentence
    .filter(part => part.type === 'blank')
    .map((part, index) => (
      <AnimatedBlank
        key={part.id}
        ref={blankRefs.current[index]}
        text={blanks[part.id] || '___'}
        color={blanks[part.id] ? '#3b82f6' : '#2F4F4F'}
        duration={500}
        language="python"
        theme="github-dark"
        isActive={firstEmptyBlankIndex === part.id} // Set active state for the first empty blank
      />
    ));

  return (
    <div className="App">
      <h1>Complete the Code</h1>
      <div className="problem-statement">
        <p>
          <strong>Problem:</strong> Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>more than once</strong> in the array, otherwise return <code>false</code>.
        </p>
      </div>

      <CodeBlock
        code={codeString}
        previousCode={previousCode}
        language="python"
        theme="github-dark"
        typewriterSpeed={50}
        autoStart={true}
        components={blankComponents}
      />

      <p key={`hint-${currentLineIndex}`} className="hint">{currentLine.hint}</p>

      <div className="word-bank">
        <h2>Available Code Snippets</h2>
        <div className="words">
          {words.map((word, index) => (
            <div
              key={index}
              className="word"
              onClick={() => handleWordSelect(word)}
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      <button className="reset-button" onClick={resetGame}>
        Reset
      </button>
    </div>
  );
}

export default App;
