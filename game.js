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
  }

  reset() {
    this.players = [];
    this.activePlayerIndex = 0;
    this.gameState = 'setup';
    this.winner = null;
    this.history = [];
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
        bites: 0
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
    } else if (GameConfig.snakes[targetPos]) {
      finalPosition = GameConfig.snakes[targetPos];
      snakeOrLadder = {
        type: 'snake',
        start: targetPos,
        end: finalPosition
      };
      player.stats.bites++;
      this.log(`🐍 Oh no! ${player.name} got bit by a snake at ${targetPos} and slid down to ${finalPosition}!`);
    }

    player.position = finalPosition;

    // Check win condition
    if (player.position === GameConfig.boardSize) {
      this.gameState = 'finished';
      this.winner = player;
      this.log(`🎉 VICTORY! ${player.name} won the game in ${player.stats.rolls} rolls!`);
    } else {
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

  nextPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
  }

  notifyChange() {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }
}
