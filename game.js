/**
 * Game Engine for Snake and Ladders
 */

const GameConfig = {
  boardSize: 100,
  ladders: {
    4: 14,
    9: 31,
    20: 38,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91
  },
  snakes: {
    17: 7,
    54: 34,
    62: 18,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    99: 78
  }
};

const QuestionBank = [
  {
    question: "Which company developed the Gemini AI model?",
    options: ["OpenAI", "Google", "Microsoft", "Meta"],
    correct: 1,
    category: "Technology",
    trivia: "Gemini is Google's next-generation family of multimodal AI models, launched in late 2023."
  },
  {
    question: "What does AI stand for in computer science?",
    options: ["Advanced Integration", "Artificial Intelligence", "Automated Information", "Algorithmic Indexing"],
    correct: 1,
    category: "Technology",
    trivia: "Artificial Intelligence was coined by John McCarthy in 1956 at the Dartmouth Conference."
  },
  {
    question: "Which country hosted the 2024 Summer Olympic Games?",
    options: ["Japan", "United Kingdom", "France", "United States"],
    correct: 2,
    category: "Current Affairs",
    trivia: "Paris, France hosted the 2024 Summer Olympics, marking the third time the city hosted the games."
  },
  {
    question: "What is the primary programming language used to structure web pages?",
    options: ["Python", "C++", "Java", "HTML"],
    correct: 3,
    category: "Technology",
    trivia: "HTML stands for HyperText Markup Language, first created by Tim Berners-Lee in 1991."
  },
  {
    question: "Which of the following is a key technology behind modern AI chatbots like ChatGPT and Gemini?",
    options: ["Blockchains", "SQL Databases", "Large Language Models (LLMs)", "Virtual Private Networks (VPNs)"],
    correct: 2,
    category: "Technology",
    trivia: "LLMs are neural networks trained on massive text datasets to predict and generate human-like text."
  },
  {
    question: "What does URL stand for in web browsing?",
    options: ["Universal Routing Link", "Uniform Resource Locator", "Unified Registry Locator", "User Redirect Link"],
    correct: 1,
    category: "Technology",
    trivia: "A URL specifies the address of a resource (like a webpage) on the computer network."
  },
  {
    question: "In computing, what does SQL stand for?",
    options: ["Structured Query Language", "System Query Link", "Simple Query Logic", "Sequential Query List"],
    correct: 0,
    category: "Technology",
    trivia: "SQL is the standard language used to manage and manipulate relational databases."
  },
  {
    question: "Who is the CEO of SpaceX and Tesla?",
    options: ["Jeff Bezos", "Bill Gates", "Elon Musk", "Mark Zuckerberg"],
    correct: 2,
    category: "Current Affairs",
    trivia: "Elon Musk founded SpaceX in 2002 and joined Tesla as an early investor and CEO."
  },
  {
    question: "Which planet in our solar system is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
    category: "General Knowledge",
    trivia: "Mars appears red due to the iron oxide (rust) on its surface."
  },
  {
    question: "Which AI concept mimics the structure and function of the human brain?",
    options: ["Quantum Computing", "Relational Databases", "Artificial Neural Networks", "Decentralized Ledgers"],
    correct: 2,
    category: "Technology",
    trivia: "Neural networks consist of layers of interconnected nodes (neurons) that process data."
  },
  {
    question: "What is the name of Google's flagship generative AI conversational agent?",
    options: ["Claude", "Copilot", "Gemini", "ChatGPT"],
    correct: 2,
    category: "Technology",
    trivia: "Google rebranded its AI agent Bard to Gemini in early 2024 to match its advanced model family."
  },
  {
    question: "What is the largest country in the world by land area?",
    options: ["Canada", "China", "United States", "Russia"],
    correct: 3,
    category: "General Knowledge",
    trivia: "Russia spans over 17 million square kilometers, covering more than one-eighth of Earth's inhabited land area."
  },
  {
    question: "Which technology is used to create secure, decentralized digital transaction ledgers?",
    options: ["Cloud Storage", "Blockchain", "Virtualization", "Fiber Optics"],
    correct: 1,
    category: "Technology",
    trivia: "Blockchain is the underlying technology behind cryptocurrencies like Bitcoin."
  },
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Power Utility", "Core Processing Unit", "Central Program Utility"],
    correct: 0,
    category: "Technology",
    trivia: "The CPU is often referred to as the 'brain' of the computer, executing instructions of computer programs."
  },
  {
    question: "Which programming language was created by Guido van Rossum and released in 1991?",
    options: ["Ruby", "JavaScript", "Python", "PHP"],
    correct: 2,
    category: "Technology",
    trivia: "Python was named after the British comedy group 'Monty Python'."
  },
  {
    question: "What is the currency of Japan?",
    options: ["Won", "Yen", "Yuan", "Ringgit"],
    correct: 1,
    category: "General Knowledge",
    trivia: "The Japanese Yen is the third most traded currency in the foreign exchange market."
  },
  {
    question: "What does RAM stand for in computer hardware?",
    options: ["Read Access Memory", "Random Access Memory", "Rapid Action Module", "Real-time Active Memory"],
    correct: 1,
    category: "Technology",
    trivia: "RAM is volatile memory used to temporarily store data that the CPU needs to access quickly."
  },
  {
    question: "Which gas do plants absorb from the atmosphere for photosynthesis?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correct: 2,
    category: "General Knowledge",
    trivia: "Plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar."
  },
  {
    question: "Who wrote the famous play 'Hamlet'?",
    options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
    correct: 1,
    category: "General Knowledge",
    trivia: "Hamlet was written by Shakespeare around 1599–1601 and is his longest play."
  },
  {
    question: "Which protocol is used to encrypt and secure communication between a web browser and a website?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    correct: 2,
    category: "Technology",
    trivia: "HTTPS stands for Hypertext Transfer Protocol Secure and uses SSL/TLS to encrypt data."
  },
  {
    question: "What is the primary gas that makes up Earth's atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
    correct: 1,
    category: "General Knowledge",
    trivia: "Earth's atmosphere is composed of about 78% Nitrogen and 21% Oxygen."
  },
  {
    question: "Which technology company developed the Windows operating system?",
    options: ["Apple", "IBM", "Google", "Microsoft"],
    correct: 3,
    category: "Technology",
    trivia: "Microsoft introduced Windows in 1985 as a graphical operating system shell for MS-DOS."
  },
  {
    question: "Which device is used to route data packets across different computer networks?",
    options: ["Switch", "Router", "Hub", "Modem"],
    correct: 1,
    category: "Technology",
    trivia: "Routers operate at the network layer of the OSI model to forward traffic between networks."
  },
  {
    question: "What is the term for a malicious software designed to lock access to a computer system until money is paid?",
    options: ["Adware", "Ransomware", "Spyware", "Trojan"],
    correct: 1,
    category: "Technology",
    trivia: "Ransomware attacks often encrypt files and demand payment in cryptocurrency to provide the decryption key."
  },
  {
    question: "Which space agency successfully landed the Perseverance rover on Mars in 2021?",
    options: ["ESA", "ISRO", "NASA", "JAXA"],
    correct: 2,
    category: "Current Affairs",
    trivia: "NASA's Perseverance rover landed in the Jezero Crater on Mars on February 18, 2021."
  }
];

class SnakeAndLaddersGame {
  constructor() {
    this.players = [];
    this.activePlayerIndex = 0;
    this.gameState = 'setup'; // 'setup', 'playing', 'finished'
    this.winner = null;
    this.exactRollToWin = true;
    this.history = [];
    this.onStateChange = () => {};
    this.onMoveStep = () => {};
    
    // Monetization and rescue statistics
    this.totalMockRevenue = 0.00;
    this.mockImpressions = 0;
    this.mockRewardedAdsWatched = 0;
  }

  reset() {
    this.players = [];
    this.activePlayerIndex = 0;
    this.gameState = 'setup';
    this.winner = null;
    this.history = [];
    
    this.totalMockRevenue = 0.00;
    this.mockImpressions = 0;
    this.mockRewardedAdsWatched = 0;
    
    this.log("Game reset. Ready for setup.");
    this.notifyChange();
  }

  addPlayer(name, color, avatar, isBot = false) {
    if (this.players.length >= 4) {
      throw new Error("Maximum 4 players allowed.");
    }
    const player = {
      id: this.players.length + 1,
      name: name || `Player ${this.players.length + 1}`,
      color: color || '#ff3b30',
      avatar: avatar || '🧙‍♂️',
      position: 1, // Start at square 1
      isBot: isBot,
      stats: {
        rolls: 0,
        climbs: 0,
        bites: 0,
        escapes: 0
      }
    };
    this.players.push(player);
    this.log(`${player.name} (${player.avatar}) joined the game.`);
    this.notifyChange();
    return player;
  }

  startGame() {
    if (this.players.length === 0) {
      throw new Error("Add at least one player to start.");
    }
    this.gameState = 'playing';
    this.activePlayerIndex = 0;
    this.winner = null;
    this.players.forEach(p => {
      p.position = 1;
      p.stats = { rolls: 0, climbs: 0, bites: 0 };
    });
    this.history = [];
    this.log("Game started! Player 1's turn.");
    this.notifyChange();
  }

  log(message) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.history.push({ time, message });
  }

  getCurrentPlayer() {
    return this.players[this.activePlayerIndex];
  }

  /**
   * Processes a turn for the current player
   * Returns an object detailing the roll and movements for UI animation
   */
  async playTurn(forcedRoll = null) {
    if (this.gameState !== 'playing') return null;

    const player = this.getCurrentPlayer();
    const roll = forcedRoll || Math.floor(Math.random() * 6) + 1;
    player.stats.rolls++;
    
    this.log(`${player.name} rolled a ${roll}.`);

    let currentPos = player.position;
    let targetPos = currentPos + roll;
    let path = [];

    // Rule: Exact roll to win
    if (targetPos > GameConfig.boardSize) {
      if (this.exactRollToWin) {
        this.log(`${player.name} needs an exact roll of ${GameConfig.boardSize - currentPos} to win. Stayed at ${currentPos}.`);
        path = [currentPos]; // No movement
        this.nextPlayer();
        const result = { player, roll, path, snakeOrLadder: null, stay: true };
        this.notifyChange();
        return result;
      } else {
        // Bounce back rule
        const overshoot = targetPos - GameConfig.boardSize;
        targetPos = GameConfig.boardSize - overshoot;
      }
    }

    // Generate step-by-step path for normal rolling movement
    if (targetPos <= GameConfig.boardSize) {
      if (currentPos < targetPos) {
        for (let i = currentPos + 1; i <= targetPos; i++) {
          path.push(i);
        }
      } else {
        // Bounce back path
        for (let i = currentPos + 1; i <= GameConfig.boardSize; i++) {
          path.push(i);
        }
        for (let i = GameConfig.boardSize - 1; i >= targetPos; i--) {
          path.push(i);
        }
      }
    }

    player.position = targetPos;
    let snakeOrLadder = null;
    let finalPosition = targetPos;

    // Check for snakes or ladders at the landing position
    if (GameConfig.ladders[targetPos]) {
      finalPosition = GameConfig.ladders[targetPos];
      snakeOrLadder = {
        type: 'ladder',
        start: targetPos,
        end: finalPosition
      };
      player.stats.climbs++;
      this.log(`✨ Spectacular! ${player.name} climbed a ladder from ${targetPos} to ${finalPosition}!`);
      player.position = finalPosition;
    } else if (GameConfig.snakes[targetPos]) {
      finalPosition = GameConfig.snakes[targetPos];
      snakeOrLadder = {
        type: 'snake',
        start: targetPos,
        end: finalPosition
      };
      // Keep player position at targetPos (the head) for now to await rescue result
      player.position = targetPos;
    } else {
      player.position = targetPos;
    }

    const isSnake = (snakeOrLadder && snakeOrLadder.type === 'snake');

    // Check win condition (only if it wasn't a snake landing)
    if (!isSnake && player.position === GameConfig.boardSize) {
      this.gameState = 'finished';
      this.winner = player;
      this.log(`🎉 VICTORY! ${player.name} won the game in ${player.stats.rolls} rolls!`);
    } else if (!isSnake) {
      this.nextPlayer();
    }

    const result = {
      player,
      roll,
      path, // Step path to initial target
      snakeOrLadder, // Snake or ladder info if triggered
      finalPosition // Where they end up after snake/ladder
    };

    this.notifyChange();
    return result;
  }

  resolveSnakeRescue(escaped, actualTailPos = null) {
    if (this.gameState !== 'playing') return;
    const player = this.getCurrentPlayer();
    const startPos = player.position;
    
    if (escaped) {
      // Stay at the snake head
      player.stats.escapes++;
      this.log(`🧠 Clever! ${player.name} answered correctly and escaped the snake at ${startPos}!`);
    } else {
      // Slide down to the snake tail
      const tailPos = actualTailPos !== null ? actualTailPos : GameConfig.snakes[startPos];
      GameConfig.snakes[startPos] = tailPos; // Sync the game config map
      player.position = tailPos;
      player.stats.bites++;
      this.log(`🐍 Oh no! ${player.name} answered incorrectly and slid down to ${tailPos}!`);
    }
    
    // Check win condition after rescue resolving
    if (player.position === GameConfig.boardSize) {
      this.gameState = 'finished';
      this.winner = player;
      this.log(`🎉 VICTORY! ${player.name} won the game!`);
    } else {
      this.nextPlayer();
    }
    
    this.notifyChange();
  }

  nextPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
  }

  notifyChange() {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }
}
