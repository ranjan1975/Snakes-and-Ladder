/**
 * Game Engine for Snake and Ladders
 */

const GameConfig = {
  boardSize: 100,
  ladders: {
    8: 83,
    23: 45,
    31: 49,
    35: 82,
    48: 71,
    55: 88,
    63: 79,
    65: 86
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
    question: "Who played the lead role of Cobb in the 2010 sci-fi film 'Inception'?",
    options: ["Brad Pitt", "Leonardo DiCaprio", "Johnny Depp", "Christian Bale"],
    correct: 1,
    category: "Cinema",
    trivia: "Leonardo DiCaprio starred as Cobb, a professional thief who steals secrets through dream-sharing technology."
  },
  {
    question: "Which actor played Tony Stark / Iron Man in the Marvel Cinematic Universe?",
    options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"],
    correct: 1,
    category: "Cinema",
    trivia: "Robert Downey Jr. kicked off the Marvel Cinematic Universe with his iconic portrayal of Iron Man in 2008."
  },
  {
    question: "Who starred as Neo in the iconic 1999 sci-fi film 'The Matrix'?",
    options: ["Keanu Reeves", "Tom Cruise", "Will Smith", "Brad Pitt"],
    correct: 0,
    category: "Cinema",
    trivia: "Keanu Reeves played Thomas Anderson, alias Neo, the hacker who discovers the truth about the Matrix."
  },
  {
    question: "Who won the Academy Award for Best Actress for her lead role in the film 'La La Land'?",
    options: ["Jennifer Lawrence", "Emma Stone", "Scarlett Johansson", "Natalie Portman"],
    correct: 1,
    category: "Cinema",
    trivia: "Emma Stone won her first Oscar for playing Mia, an aspiring actress, in the 2016 musical romance."
  },
  {
    question: "Who played the character of Jack Dawson in the 1997 blockbuster movie 'Titanic'?",
    options: ["Matt Damon", "Ben Affleck", "Leonardo DiCaprio", "Johnny Depp"],
    correct: 2,
    category: "Cinema",
    trivia: "Leonardo DiCaprio starred alongside Kate Winslet in James Cameron's record-breaking film Titanic."
  },
  {
    question: "Which actor portrayed the Joker in the 2008 film 'The Dark Knight'?",
    options: ["Joaquin Phoenix", "Heath Ledger", "Jared Leto", "Jack Nicholson"],
    correct: 1,
    category: "Cinema",
    trivia: "Heath Ledger won a posthumous Academy Award for his legendary performance as the Joker."
  },
  {
    question: "Who played the lead role of Captain Jack Sparrow in the 'Pirates of the Caribbean' series?",
    options: ["Orlando Bloom", "Johnny Depp", "Geoffrey Rush", "Jude Law"],
    correct: 1,
    category: "Cinema",
    trivia: "Johnny Depp received an Oscar nomination for his legendary portrayal of Captain Jack Sparrow in 2003."
  },
  {
    question: "Which actress starred as Katniss Everdeen in 'The Hunger Games' film series?",
    options: ["Jennifer Lawrence", "Emma Watson", "Kristen Stewart", "Shailene Woodley"],
    correct: 0,
    category: "Cinema",
    trivia: "Jennifer Lawrence achieved international stardom portraying Katniss Everdeen in the Hunger Games trilogy."
  },
  {
    question: "Who played the lead role of astronaut Cooper in the 2014 film 'Interstellar'?",
    options: ["Matt Damon", "Matthew McConaughey", "Brad Pitt", "Christian Bale"],
    correct: 1,
    category: "Cinema",
    trivia: "Matthew McConaughey starred as Cooper, a former NASA pilot who travels through a wormhole to find a new home for humanity."
  },
  {
    question: "Which actor played the character of Wolverine in the X-Men film franchise?",
    options: ["Hugh Jackman", "Christian Bale", "Robert Downey Jr.", "Ryan Reynolds"],
    correct: 0,
    category: "Cinema",
    trivia: "Hugh Jackman played Wolverine for 17 years, setting a Guinness World Record for the longest career as a live-action Marvel character."
  },
  {
    question: "Who starred as Barbie in the 2023 live-action 'Barbie' movie?",
    options: ["Margot Robbie", "Emma Stone", "Florence Pugh", "Saoirse Ronan"],
    correct: 0,
    category: "Cinema",
    trivia: "Margot Robbie produced and starred in the Greta Gerwig-directed blockbuster Barbie."
  },
  {
    question: "Which actor played the lead role in the biographical drama 'Oppenheimer' (2023)?",
    options: ["Cillian Murphy", "Robert Downey Jr.", "Matt Damon", "Emily Blunt"],
    correct: 0,
    category: "Cinema",
    trivia: "Cillian Murphy won the Academy Award for Best Actor for his portrayal of J. Robert Oppenheimer."
  },
  {
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correct: 2,
    category: "Geography",
    trivia: "Canberra was selected as the capital in 1908 as a compromise between rivals Sydney and Melbourne."
  },
  {
    question: "What is the capital city of Canada?",
    options: ["Toronto", "Vancouver", "Ottawa", "Montreal"],
    correct: 2,
    category: "Geography",
    trivia: "Ottawa was chosen as Canada's capital by Queen Victoria in 1857 due to its strategic and secure location."
  },
  {
    question: "Which city is the capital of Japan?",
    options: ["Kyoto", "Osaka", "Hiroshima", "Tokyo"],
    correct: 3,
    category: "Geography",
    trivia: "Tokyo became the official capital after the Emperor moved his seat from Kyoto to Edo (renamed Tokyo) in 1869."
  },
  {
    question: "What is the capital city of Brazil?",
    options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
    correct: 2,
    category: "Geography",
    trivia: "Brasília is a planned city, inaugurated in 1960 to move the capital from Rio de Janeiro to the interior."
  },
  {
    question: "Which of these cities is the capital of Switzerland?",
    options: ["Zurich", "Geneva", "Bern", "Basel"],
    correct: 2,
    category: "Geography",
    trivia: "Bern is the federal city and de facto capital of Switzerland, founded in the 12th century."
  },
  {
    question: "What is the capital of South Africa?",
    options: ["Johannesburg", "Durban", "Pretoria, Cape Town & Bloemfontein", "Nairobi"],
    correct: 2,
    category: "Geography",
    trivia: "South Africa is unique in having three capital cities: Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial)."
  },
  {
    question: "Which city is the capital of Egypt?",
    options: ["Alexandria", "Cairo", "Giza", "Luxor"],
    correct: 1,
    category: "Geography",
    trivia: "Cairo is the capital of Egypt and the largest metropolitan area in the Arab world."
  },
  {
    question: "What is the capital of Spain?",
    options: ["Barcelona", "Seville", "Valencia", "Madrid"],
    correct: 3,
    category: "Geography",
    trivia: "Madrid is the capital and largest city of Spain, serving as its political and cultural center since 1561."
  },
  {
    question: "What is the capital city of New Zealand?",
    options: ["Auckland", "Wellington", "Christchurch", "Queenstown"],
    correct: 1,
    category: "Geography",
    trivia: "Wellington is the world's southernmost capital city of a sovereign state."
  },
  {
    question: "What is the capital of Argentina?",
    options: ["Santiago", "Lima", "Buenos Aires", "Bogota"],
    correct: 2,
    category: "Geography",
    trivia: "Buenos Aires is situated on the western shore of the estuary of the Río de la Plata."
  },
  {
    question: "According to the United Nations, how many official member states are there in the world?",
    options: ["185", "193", "201", "210"],
    correct: 1,
    category: "Geography",
    trivia: "There are 193 member states of the United Nations, plus 2 non-member observer states: the Holy See and Palestine."
  },
  {
    question: "Which is currently the most populated country in the world?",
    options: ["China", "India", "United States", "Indonesia"],
    correct: 1,
    category: "Geography",
    trivia: "India surpassed China as the world's most populous country in mid-2023, according to UN estimates."
  },
  {
    question: "Which country is the third most populated in the world?",
    options: ["Brazil", "Pakistan", "United States", "Nigeria"],
    correct: 2,
    category: "Geography",
    trivia: "The United States is the third most populous nation, trailing behind India and China."
  },
  {
    question: "Which continent contains the highest number of countries?",
    options: ["Asia", "Africa", "Europe", "North America"],
    correct: 1,
    category: "Geography",
    trivia: "Africa has 54 fully recognized sovereign countries, more than any other continent."
  },
  {
    question: "Which country is the largest in the world by land area?",
    options: ["Canada", "China", "United States", "Russia"],
    correct: 3,
    category: "Geography",
    trivia: "Russia spans over 17 million square kilometers, covering more than one-eighth of Earth's inhabited land area."
  },
  {
    question: "Which country has the largest population in Europe (excluding Russia)?",
    options: ["France", "Germany", "United Kingdom", "Italy"],
    correct: 1,
    category: "Geography",
    trivia: "Germany has a population of over 83 million people, making it the most populous EU state."
  },
  {
    question: "Which island nation is the world's fourth most populous country?",
    options: ["Japan", "Philippines", "Indonesia", "United Kingdom"],
    correct: 2,
    category: "Geography",
    trivia: "Indonesia consists of over 17,000 islands and has a population of more than 275 million people."
  },
  {
    question: "Which is the most populous country in South America?",
    options: ["Argentina", "Colombia", "Brazil", "Peru"],
    correct: 2,
    category: "Geography",
    trivia: "Brazil accounts for nearly half of South America's total population and land area."
  },
  {
    question: "Which is the most populous country in Africa?",
    options: ["Egypt", "Ethiopia", "Nigeria", "South Africa"],
    correct: 2,
    category: "Geography",
    trivia: "Nigeria has over 220 million inhabitants, making it the sixth most populous country in the world."
  },
  {
    question: "Approximately what is the total current human population of the Earth?",
    options: ["6 Billion", "7 Billion", "8 Billion", "9 Billion"],
    correct: 2,
    category: "Geography",
    trivia: "The world's human population officially reached the 8 billion milestone in November 2022."
  },
  {
    question: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"],
    correct: 1,
    category: "History",
    trivia: "George Washington served as President from 1789 to 1797 and is revered as the 'Father of His Country'."
  },
  {
    question: "Who was the first female Prime Minister of the United Kingdom?",
    options: ["Theresa May", "Margaret Thatcher", "Liz Truss", "Angela Merkel"],
    correct: 1,
    category: "History",
    trivia: "Margaret Thatcher, known as the 'Iron Lady', served as UK Prime Minister from 1979 to 1990."
  },
  {
    question: "Who is the Prime Minister of India as of 2024?",
    options: ["Narendra Modi", "Rahul Gandhi", "Manmohan Singh", "Amit Shah"],
    correct: 0,
    category: "History",
    trivia: "Narendra Modi assumed office in 2014 and led the BJP to multiple general election victories."
  },
  {
    question: "Who served as the President of South Africa from 1994 to 1999 after spending 27 years in prison?",
    options: ["F. W. de Klerk", "Nelson Mandela", "Thabo Mbeki", "Jacob Zuma"],
    correct: 1,
    category: "History",
    trivia: "Nelson Mandela led the fight against apartheid and became South Africa's first black president in a democratic election."
  },
  {
    question: "Who became the President of France in 2017, becoming the youngest president in French history?",
    options: ["François Hollande", "Nicolas Sarkozy", "Emmanuel Macron", "Marine Le Pen"],
    correct: 2,
    category: "History",
    trivia: "Emmanuel Macron was elected President of France at the age of 39."
  },
  {
    question: "Who served as the long-running Chancellor of Germany from 2005 to 2021?",
    options: ["Gerhard Schröder", "Helmut Kohl", "Angela Merkel", "Olaf Scholz"],
    correct: 2,
    category: "History",
    trivia: "Angela Merkel was Germany's first female Chancellor and one of the longest-serving leaders in European history."
  },
  {
    question: "Who was the Prime Minister of the United Kingdom during most of World War II?",
    options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Franklin D. Roosevelt"],
    correct: 1,
    category: "History",
    trivia: "Winston Churchill's speeches and leadership rallied British resistance during World War II."
  },
  {
    question: "Who is the President of China as of 2024?",
    options: ["Xi Jinping", "Hu Jintao", "Jiang Zemin", "Mao Zedong"],
    correct: 0,
    category: "History",
    trivia: "Xi Jinping assumed the office of President of the People's Republic of China in 2013."
  },
  {
    question: "Which US President signed the Emancipation Proclamation in 1863?",
    options: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "Theodore Roosevelt"],
    correct: 2,
    category: "History",
    trivia: "Abraham Lincoln led the United States during the American Civil War and ended slavery."
  },
  {
    question: "Who is the President of the United States as of 2024?",
    options: ["Donald Trump", "Joe Biden", "Barack Obama", "George W. Bush"],
    correct: 1,
    category: "History",
    trivia: "Joe Biden took office as the 46th President of the United States on January 20, 2021."
  },
  {
    question: "Which planet in our solar system is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
    category: "Science",
    trivia: "Mars appears red due to the iron oxide (rust) on its surface."
  },
  {
    question: "Which gas do plants absorb from the atmosphere for photosynthesis?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correct: 2,
    category: "Science",
    trivia: "Plants use sunlight, water, and carbon dioxide to produce oxygen and sugars."
  },
  {
    question: "Who wrote the famous play 'Hamlet'?",
    options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
    correct: 1,
    category: "General Knowledge",
    trivia: "Hamlet was written by Shakespeare around 1599–1601 and is his longest play."
  },
  {
    question: "What is the primary gas that makes up Earth's atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
    correct: 1,
    category: "Science",
    trivia: "Earth's atmosphere is composed of about 78% Nitrogen and 21% Oxygen."
  },
  {
    question: "What is the currency of Japan?",
    options: ["Won", "Yen", "Yuan", "Ringgit"],
    correct: 1,
    category: "General Knowledge",
    trivia: "The Japanese Yen is the third most traded currency in the foreign exchange market."
  },
  {
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean"],
    correct: 3,
    category: "Geography",
    trivia: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions, covering 30% of the globe."
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Quartz"],
    correct: 2,
    category: "Science",
    trivia: "Diamond is carbon arranged in a face-centered cubic structure, making it incredibly hard."
  },
  {
    question: "Which element has the chemical symbol 'O' on the Periodic Table?",
    options: ["Gold", "Silver", "Oxygen", "Iron"],
    correct: 2,
    category: "Science",
    trivia: "Oxygen is highly reactive and forms oxides with almost all other elements."
  },
  {
    question: "What is the boiling point of water at standard atmospheric pressure?",
    options: ["50°C", "100°C", "150°C", "200°C"],
    correct: 1,
    category: "Science",
    trivia: "Water boils at 100°C (212°F) under standard sea-level atmospheric conditions."
  },
  {
    question: "Which organ in the human body is primarily responsible for pumping blood?",
    options: ["Lungs", "Brain", "Liver", "Heart"],
    correct: 3,
    category: "Science",
    trivia: "The human heart beats about 100,000 times a day to pump blood throughout the body."
  },
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
    question: "Which AI concept mimics the structure and function of the human brain?",
    options: ["Quantum Computing", "Relational Databases", "Artificial Neural Networks", "Decentralized Ledgers"],
    correct: 2,
    category: "Technology",
    trivia: "Neural networks consist of layers of interconnected nodes (neurons) that process and learn from data."
  },
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Power Utility", "Core Processing Unit", "Central Program Utility"],
    correct: 0,
    category: "Technology",
    trivia: "The CPU is often referred to as the 'brain' of the computer, executing instructions of computer programs."
  },
  {
    question: "What does RAM stand for in computer hardware?",
    options: ["Read Access Memory", "Random Access Memory", "Rapid Action Module", "Real-time Active Memory"],
    correct: 1,
    category: "Technology",
    trivia: "RAM is volatile memory used to temporarily store data that the CPU needs to access quickly."
  },
  {
    question: "Which protocol is used to encrypt and secure communication between a web browser and a website?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    correct: 2,
    category: "Technology",
    trivia: "HTTPS stands for Hypertext Transfer Protocol Secure and uses TLS/SSL to encrypt data."
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
