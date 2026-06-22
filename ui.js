/**
 * UI Controller for Snake and Ladders
 */

class UIController {
  constructor(game, sound) {
    this.game = game;
    this.sound = sound;
    this.isAnimating = false;
    this.confettiParticles = [];
    this.confettiActive = false;
    
    // WebRTC Online Multiplayer state variables
    this.isOnlineMode = false;
    this.onlineRoomType = 'host'; // 'host' or 'join'
    this.peer = null;
    this.conn = null;
    this.onlineMyColor = '#00f2fe'; // Default cyan
    this.onlineMyAvatarData = ''; // Store custom uploaded photo if any
    this.onlinePartnerData = null; // Store partner's config
    this.quizResultResolver = null; // Promise resolver for online snake quiz sync
    
    // Canvas Face Cropper state variables
    this.cropImg = null;
    this.cropX = 0;
    this.cropY = 0;
    this.cropScale = 1;
    this.isDraggingCrop = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.cropCallback = null;
    
    // Binding DOM element references
    this.dom = {
      setupScreen: document.getElementById('setup-screen'),
      playScreen: document.getElementById('play-screen'),
      boardWrapper: document.getElementById('board-wrapper'),
      boardGrid: document.getElementById('board-grid'),
      boardSvg: document.getElementById('board-svg'),
      tokensContainer: document.getElementById('tokens-container'),
      
      // Setup controls
      playerCountBtns: document.querySelectorAll('.setup-number-players .player-count-btn'),
      playerSetupList: document.getElementById('player-setup-list'),
      startGameBtn: document.getElementById('start-game-btn'),
      exactRollToggle: document.getElementById('exact-roll-toggle'),
      soundToggle: document.getElementById('sound-toggle'),
      
      // Game Mode Toggles
      modeLocalBtn: document.getElementById('mode-local-btn'),
      modeOnlineBtn: document.getElementById('mode-online-btn'),
      localSetupOptions: document.getElementById('local-setup-options'),
      onlineSetupOptions: document.getElementById('online-setup-options'),
      onlineHostTab: document.getElementById('online-host-tab'),
      onlineJoinTab: document.getElementById('online-join-tab'),
      onlineHostPanel: document.getElementById('online-host-panel'),
      onlineJoinPanel: document.getElementById('online-join-panel'),
      generateCodeBtn: document.getElementById('generate-code-btn'),
      hostCodeDisplay: document.getElementById('host-code-display'),
      roomCodeVal: document.getElementById('room-code-val'),
      joinCodeInput: document.getElementById('join-code-input'),
      connectGameBtn: document.getElementById('connect-game-btn'),
      onlinePlayerName: document.getElementById('online-player-name'),
      onlinePlayerAvatar: document.getElementById('online-player-avatar'),
      onlinePlayerAvatarFile: document.getElementById('online-player-avatar-file'),
      
      // HUD
      currentPlayerAvatar: document.getElementById('current-player-avatar'),
      currentPlayerName: document.getElementById('current-player-name'),
      currentPlayerStatus: document.getElementById('current-player-status'),
      diceScene: document.getElementById('dice-scene'),
      diceCube: document.getElementById('dice-cube'),
      rollBtn: document.getElementById('roll-btn'),
      historyLog: document.getElementById('history-log'),
      
      // Modal (Victory)
      victoryModal: document.getElementById('victory-modal'),
      winnerAvatar: document.getElementById('winner-avatar'),
      winnerName: document.getElementById('winner-name'),
      winnerRolls: document.getElementById('winner-rolls'),
      winnerClimbs: document.getElementById('winner-climbs'),
      winnerBites: document.getElementById('winner-bites'),
      winnerEscapes: document.getElementById('winner-escapes'),
      restartBtn: document.getElementById('restart-btn'),
      
      // Toast and Canvas
      toastContainer: document.getElementById('toast-container'),
      confettiCanvas: document.getElementById('confetti-canvas'),

      // Live Ad Monetization Hub & Banners
      bannerAd: document.getElementById('banner-ad'),
      bannerAdTitle: document.getElementById('banner-ad-title'),
      bannerAdDesc: document.getElementById('banner-ad-desc'),
      bannerAdIcon: document.getElementById('banner-ad-icon'),
      bannerAdBtn: document.getElementById('banner-ad-btn'),
      revenueVal: document.getElementById('revenue-val'),
      impressionsVal: document.getElementById('impressions-val'),
      ctrVal: document.getElementById('ctr-val'),

      // Snake Rescue Modal elements
      rescueModal: document.getElementById('rescue-modal'),
      rescueCategory: document.getElementById('rescue-category'),
      rescueQuestion: document.getElementById('rescue-question'),
      rescueOptions: document.getElementById('rescue-options'),
      rescueAdActions: document.getElementById('rescue-ad-actions'),
      adHintBtn: document.getElementById('ad-hint-btn'),
      adSkipBtn: document.getElementById('ad-skip-btn'),
      rescueTriviaBox: document.getElementById('rescue-trivia-box'),
      rescueTriviaHeader: document.getElementById('trivia-result-header'),
      rescueTriviaText: document.getElementById('trivia-result-text'),
      rescueContinueBtn: document.getElementById('rescue-continue-btn'),

      // Rewarded Ad elements
      rewardedAdModal: document.getElementById('rewarded-ad-modal'),
      adCountdown: document.getElementById('ad-countdown'),
      adProgressBar: document.getElementById('ad-progress-bar'),
      adAdvertiserLogo: document.getElementById('ad-advertiser-logo'),
      adAdvertiserName: document.getElementById('ad-advertiser-name'),
      adAdvertiserDesc: document.getElementById('ad-advertiser-desc'),
      
      // Players HUD & Crop Modal
      rosterCard: document.getElementById('roster-card'),
      cropModal: document.getElementById('crop-modal'),
      cropCanvas: document.getElementById('crop-canvas'),
      cropZoom: document.getElementById('crop-zoom'),
      diceTurnIndicator: document.getElementById('dice-turn-indicator'),
      cropSaveBtn: document.getElementById('crop-save-btn'),
      cropCancelBtn: document.getElementById('crop-cancel-btn')
    };

    // Predefined Avatars and Neon Colors
    this.avatars = ['🧙‍♂️', '🥷', '🤖', '🦄', '👽', '🐯', '🦖', '👻'];
    this.colors = ['#00f2fe', '#ff007f', '#39ff14', '#ffd700', '#7f00ff', '#ff8800', '#00ffcc', '#ff3366'];
    
    this.setupConfig = {
      playerCount: 2,
      players: [
        { name: '🧙‍♂️ Mage', avatar: '🧙‍♂️', color: '#00f2fe', isBot: false },
        { name: '🥷 Shadow', avatar: '🤖', color: '#ff007f', isBot: true },
        { name: '🤖 Cyber', avatar: '👽', color: '#39ff14', isBot: true },
        { name: '🦄 Prism', avatar: '🦄', color: '#ffd700', isBot: true }
      ]
    };

    this.init();
  }

  renderAvatarHelper(avatar) {
    if (avatar && avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      return `<img src="${avatar}" style="width: 22px; height: 22px; object-fit: cover; border-radius: 50%; vertical-align: middle; border: 1px solid rgba(255,255,255,0.4);">`;
    }
    return avatar;
  }

  getBezierPoint(t, p0, c1, c2, p1) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x: mt3 * p0.x + 3 * mt2 * t * c1.x + 3 * mt * t2 * c2.x + t3 * p1.x,
      y: mt3 * p0.y + 3 * mt2 * t * c1.y + 3 * mt * t2 * c2.y + t3 * p1.y
    };
  }

  startSnakeAnimation() {
    if (this.snakeAnimationId) {
      cancelAnimationFrame(this.snakeAnimationId);
    }
    const animate = () => {
      this.updateSnakeWiggle();
      this.snakeAnimationId = requestAnimationFrame(animate);
    };
    this.snakeAnimationId = requestAnimationFrame(animate);
  }

  updateSnakeWiggle() {
    if (!this.snakeAnimations || this.snakeAnimations.length === 0) return;
    
    const time = Date.now() / 200;
    
    for (const anim of this.snakeAnimations) {
      const {
        snakeIdx,
        p0, p1, cx1, cy1, cx2, cy2, nx, ny,
        bodyPaths, shadowLines, maskLines
      } = anim;
      
      // Calculate wave wiggle offset (only wiggles near the tail, head remains still)
      const wOffset = Math.sin(time + snakeIdx * 1.5) * 1.1;
      
      // Wiggle tail tip and second control point
      const p1_anim = {
        x: p1.x + wOffset * nx,
        y: p1.y + wOffset * ny
      };
      const cx2_anim = {
        x: cx2 + wOffset * 0.45 * nx,
        y: cy2 + wOffset * 0.45 * ny
      };
      
      const newPathData = `M ${p0.x} ${p0.y} C ${cx1} ${cy1}, ${cx2_anim.x} ${cx2_anim.y}, ${p1_anim.x} ${p1_anim.y}`;
      
      // Update body paths
      for (const path of bodyPaths) {
        path.setAttribute("d", newPathData);
      }
      
      // Update shadow lines and mask lines
      const numSegments = shadowLines.length;
      const c1 = { x: cx1, y: cy1 };
      const c2 = cx2_anim;
      
      for (let i = 0; i < numSegments; i++) {
        const tA = i / numSegments;
        const tB = (i + 1) / numSegments;
        const ptA = this.getBezierPoint(tA, p0, c1, c2, p1_anim);
        const ptB = this.getBezierPoint(tB, p0, c1, c2, p1_anim);
        
        const sLine = shadowLines[i];
        if (sLine) {
          sLine.setAttribute("x1", ptA.x);
          sLine.setAttribute("y1", ptA.y);
          sLine.setAttribute("x2", ptB.x);
          sLine.setAttribute("y2", ptB.y);
        }
        
        const mLine = maskLines[i];
        if (mLine) {
          mLine.setAttribute("x1", ptA.x);
          mLine.setAttribute("y1", ptA.y);
          mLine.setAttribute("x2", ptB.x);
          mLine.setAttribute("y2", ptB.y);
        }
      }
    }
  }

  init() {
    this.renderBoardCells();
    this.setupEventListeners();
    this.renderPlayerSetupList();
    this.drawSnakesAndLadders();
    this.startAdEcosystem(); // Start mock advertising platform
    this.startSnakeAnimation(); // Start tail wiggling animations
    
    // Wire game state triggers
    this.game.onStateChange = (game) => this.handleGameStateChange(game);
    
    // Wire Canvas Crop handlers
    this.setupCropHandlers();
  }

  setupEventListeners() {
    // Player count selection
    this.dom.playerCountBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.dom.playerCountBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setupConfig.playerCount = parseInt(btn.dataset.count);
        this.renderPlayerSetupList();
      });
    });

    // Start Game
    this.dom.startGameBtn.addEventListener('click', () => {
      // Initialize Audio on click to bypass browser safety blocks
      this.sound.init();
      
      // Save exact roll setting
      this.game.exactRollToWin = this.dom.exactRollToggle.checked;
      
      if (this.isOnlineMode) {
        // Host starts the online match
        if (this.onlineRoomType === 'host' && this.conn && this.conn.open && this.onlinePartnerData) {
          const hostProfile = {
            name: this.dom.onlinePlayerName.value.trim() || "Host",
            avatar: this.dom.onlinePlayerAvatar.value === 'custom' ? this.onlineMyAvatarData : this.dom.onlinePlayerAvatar.value
          };
          
          // Choose random unique colors at game start
          const shuffledColors = [...this.colors].sort(() => 0.5 - Math.random());
          const hostColor = shuffledColors[0];
          const guestColor = shuffledColors[1];
          
          this.game.reset();
          this.game.exactRollToWin = this.dom.exactRollToggle.checked;
          this.game.addPlayer(hostProfile.name, hostColor, hostProfile.avatar, false);
          this.game.addPlayer(this.onlinePartnerData.name, guestColor, this.onlinePartnerData.avatar, false);
          
          // Send START_GAME message to partner with pre-randomized configurations
          this.conn.send({
            type: 'START_GAME',
            players: this.game.players.map(p => ({
              name: p.name,
              color: p.color,
              avatar: p.avatar
            })),
            exactRollToWin: this.game.exactRollToWin
          });
          
          this.game.startGame();
        }
      } else {
        // Add configure players to game (Local Mode)
        this.game.reset();
        
        // Choose random unique colors at game start
        const shuffledColors = [...this.colors].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < this.setupConfig.playerCount; i++) {
          const pConf = this.setupConfig.players[i];
          const nameInput = document.getElementById(`setup-name-${i}`);
          const nameVal = nameInput ? nameInput.value.trim() : pConf.name;
          const botToggle = document.getElementById(`setup-bot-${i}`);
          const isBotVal = botToggle ? botToggle.checked : pConf.isBot;
          
          const randColor = shuffledColors[i % shuffledColors.length];
          this.game.addPlayer(nameVal || `Player ${i+1}`, randColor, pConf.avatar, isBotVal);
        }
        this.game.startGame();
      }
    });

    // Toggle Game Modes: Local vs Online
    if (this.dom.modeLocalBtn) {
      this.dom.modeLocalBtn.addEventListener('click', () => {
        this.dom.modeLocalBtn.classList.add('active');
        this.dom.modeOnlineBtn.classList.remove('active');
        this.dom.localSetupOptions.classList.remove('hidden');
        this.dom.onlineSetupOptions.classList.add('hidden');
        this.dom.startGameBtn.classList.remove('hidden');
        this.dom.startGameBtn.innerText = "Launch Game 🚀";
        this.isOnlineMode = false;
        
        // Clean up peer if active
        this.disconnectPeer();
      });
    }
    
    if (this.dom.modeOnlineBtn) {
      this.dom.modeOnlineBtn.addEventListener('click', () => {
        this.dom.modeOnlineBtn.classList.add('active');
        this.dom.modeLocalBtn.classList.remove('active');
        this.dom.onlineSetupOptions.classList.remove('hidden');
        this.dom.localSetupOptions.classList.add('hidden');
        this.isOnlineMode = true;
        
        // Hide launch button until connected (Host will see it once connected)
        this.dom.startGameBtn.classList.add('hidden');
        
        this.updateOnlineSetupView();
      });
    }
    
    // Online Tabs: Host vs Join
    if (this.dom.onlineHostTab) {
      this.dom.onlineHostTab.addEventListener('click', () => {
        this.dom.onlineHostTab.classList.add('active');
        this.dom.onlineJoinTab.classList.remove('active');
        this.dom.onlineHostPanel.classList.remove('hidden');
        this.dom.onlineJoinPanel.classList.add('hidden');
        this.onlineRoomType = 'host';
        this.dom.startGameBtn.classList.add('hidden');
        this.disconnectPeer();
      });
    }
    
    if (this.dom.onlineJoinTab) {
      this.dom.onlineJoinTab.addEventListener('click', () => {
        this.dom.onlineJoinTab.classList.add('active');
        this.dom.onlineHostTab.classList.remove('active');
        this.dom.onlineJoinPanel.classList.remove('hidden');
        this.dom.onlineHostPanel.classList.add('hidden');
        this.onlineRoomType = 'join';
        this.dom.startGameBtn.classList.add('hidden');
        this.disconnectPeer();
      });
    }

    // Generate Room Code (Host)
    if (this.dom.generateCodeBtn) {
      this.dom.generateCodeBtn.addEventListener('click', () => {
        this.initHostPeer();
      });
    }
    
    // Connect to Host (Joiner)
    if (this.dom.connectGameBtn) {
      this.dom.connectGameBtn.addEventListener('click', () => {
        const code = this.dom.joinCodeInput.value.trim();
        if (code.length !== 4 || isNaN(code)) {
          this.showToast("Please enter a valid 4-digit code", "error");
          return;
        }
        this.initJoinerPeer(code);
      });
    }
    
    // Profile Selection Color Picker
    const colorBtns = document.querySelectorAll('.online-color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'transparent';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'white';
        this.onlineMyColor = btn.dataset.color;
      });
    });
    
    // Profile Selection Avatar upload triggers
    if (this.dom.onlinePlayerAvatar) {
      this.dom.onlinePlayerAvatar.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          this.dom.onlinePlayerAvatarFile.click();
        }
      });
    }
    
    if (this.dom.onlinePlayerAvatarFile) {
      this.dom.onlinePlayerAvatarFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.openCropModal(file, (croppedDataUrl) => {
            this.onlineMyAvatarData = croppedDataUrl;
            this.showToast("Face avatar saved for online profile! 📷", "info");
          });
        } else {
          // Reset avatar select if cancelled
          this.dom.onlinePlayerAvatar.value = '🦊';
        }
      });
    }

    // Dice Roll trigger
    this.dom.rollBtn.addEventListener('click', () => this.handleDiceRollRequest());
    this.dom.diceCube.addEventListener('click', () => this.handleDiceRollRequest());

    // Sound toggle
    this.dom.soundToggle.addEventListener('click', () => {
      const isEnabled = !this.sound.enabled;
      this.sound.toggle(isEnabled);
      this.dom.soundToggle.innerHTML = isEnabled ? '🔊' : '🔇';
      this.showToast(isEnabled ? "Audio Enabled" : "Audio Muted", 'info');
      
      if (isEnabled) {
        if (this.game.gameState === 'playing') {
          this.sound.startMusic();
        }
      } else {
        this.sound.stopMusic();
      }
    });

    // Restart Button
    this.dom.restartBtn.addEventListener('click', () => {
      this.dom.victoryModal.classList.remove('show');
      this.stopConfetti();
      
      if (this.isOnlineMode && this.conn && this.conn.open) {
        if (this.onlineRoomType === 'host') {
          // Send restart signal to guest
          this.conn.send({
            type: 'RESTART_GAME'
          });
        }
      }
      
      this.game.reset();
    });

    // Continue Game Button from Snake Rescue Modal
    this.dom.rescueContinueBtn.addEventListener('click', () => {
      this.dom.rescueModal.classList.remove('show');
      if (this.rescueResolveCallback) {
        const callback = this.rescueResolveCallback;
        const result = this.rescueIsCorrect;
        
        // Clear references
        this.rescueResolveCallback = null;
        this.rescueAdHintCallback = null;
        this.rescueAdSkipCallback = null;
        
        callback(result);
      }
    });

    // Hint Button from Snake Rescue Modal
    this.dom.adHintBtn.addEventListener('click', () => {
      if (this.rescueAdHintCallback) {
        this.rescueAdHintCallback();
      }
    });

    // Skip Button from Snake Rescue Modal
    this.dom.adSkipBtn.addEventListener('click', () => {
      if (this.rescueAdSkipCallback) {
        this.rescueAdSkipCallback();
      }
    });

    // Recalculate token positions and redrawing SVGs on resize
    window.addEventListener('resize', () => {
      this.updateTokensUI(false);
      this.drawSnakesAndLadders();
    });
  }

  renderBoardCells() {
    this.dom.boardGrid.innerHTML = '';
    // Loop rows from 9 down to 0, columns 0 to 9
    for (let r = 9; r >= 0; r--) {
      for (let c = 0; c < 10; c++) {
        let num;
        if (r % 2 === 0) {
          num = r * 10 + (c + 1);
        } else {
          num = r * 10 + (10 - c);
        }
        
        const cell = document.createElement('div');
        cell.className = `board-cell ${r % 2 === 1 ? 'even-row' : ''}`;
        cell.setAttribute('data-number', num);
        cell.setAttribute('id', `cell-${num}`);
        
        // Special decorations for start and end
        let label = `<span class="cell-num">${num}</span>`;
        if (num === 1) {
          label += `<span style="font-size:0.6rem; font-weight:bold; color:var(--neon-magenta)">START</span>`;
        } else if (num === 100) {
          label += `<span style="font-size:0.6rem; font-weight:bold; color:var(--neon-cyan)">PORTAL</span>`;
        }
        
        cell.innerHTML = label;
        this.dom.boardGrid.appendChild(cell);
      }
    }
  }

  renderPlayerSetupList() {
    this.dom.playerSetupList.innerHTML = '';
    
    for (let i = 0; i < this.setupConfig.playerCount; i++) {
      const pConf = this.setupConfig.players[i];
      const card = document.createElement('div');
      card.className = 'player-input-card';
      card.innerHTML = `
        <div class="player-settings-grid">
          <div class="player-num-tag" style="background: ${pConf.color}20; color: ${pConf.color}">P${i+1}</div>
          <input type="text" id="setup-name-${i}" class="player-name-input" value="${pConf.name}" placeholder="Name">
          
          <div class="avatar-selector">
            <button class="select-btn" id="avatar-btn-${i}">${this.renderAvatarHelper(pConf.avatar)}</button>
            <div class="dropdown-menu" id="avatar-menu-${i}">
              ${this.avatars.map(a => `<div class="dropdown-item select-avatar-item" data-avatar="${a}">${this.renderAvatarHelper(a)}</div>`).join('')}
            </div>
          </div>

          <!-- Face Photo Upload -->
          <div class="face-upload-container">
            <label for="face-upload-${i}" class="upload-face-label" title="Upload custom photo for character face">📷</label>
            <input type="file" id="face-upload-${i}" accept="image/*" style="display: none;">
          </div>
          
          <div class="color-selector">
            <button class="select-btn" id="color-btn-${i}">
              <div class="color-dot" style="background-color: ${pConf.color}"></div>
            </button>
            <div class="dropdown-menu" id="color-menu-${i}">
              ${this.colors.map(c => `<div class="dropdown-item select-color-item" style="background: ${c}; color: ${c}"></div>`).join('')}
            </div>
          </div>
          
          <div class="toggle-bot-container">
            <span style="font-size:0.8rem; color:var(--text-secondary)">🤖 Bot</span>
            <label class="switch">
              <input type="checkbox" id="setup-bot-${i}" ${pConf.isBot ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      
      this.dom.playerSetupList.appendChild(card);
      this.hookSetupCardDropdowns(i);
    }
  }

  hookSetupCardDropdowns(index) {
    const avatarBtn = document.getElementById(`avatar-btn-${index}`);
    const avatarMenu = document.getElementById(`avatar-menu-${index}`);
    const colorBtn = document.getElementById(`color-btn-${index}`);
    const colorMenu = document.getElementById(`color-menu-${index}`);
    const fileInput = document.getElementById(`face-upload-${index}`);
    
    // File Input Face Photo Upload Change Listener
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.openCropModal(file, (croppedDataUrl) => {
          this.setupConfig.players[index].avatar = croppedDataUrl;
          avatarBtn.innerHTML = this.renderAvatarHelper(croppedDataUrl);
          this.showToast(`Face avatar saved for Player ${index+1}! 📷`, 'info');
        });
      }
    });

    // Toggle Avatar Dropdown
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllDropdowns();
      avatarMenu.classList.toggle('show');
    });
    
    // Select Avatar
    avatarMenu.querySelectorAll('.select-avatar-item').forEach(item => {
      item.addEventListener('click', () => {
        const newAvatar = item.dataset.avatar;
        this.setupConfig.players[index].avatar = newAvatar;
        avatarBtn.innerHTML = this.renderAvatarHelper(newAvatar);
        
        // Also update name if unchanged
        const nameInput = document.getElementById(`setup-name-${index}`);
        const defaultName = `${this.setupConfig.players[index].name}`;
        if (nameInput.value === defaultName) {
          const names = {
            '🧙‍♂️': 'Mage', '🥷': 'Shadow', '🤖': 'Cyber', '🦄': 'Prism',
            '👽': 'Alien', '🐯': 'Tigress', '🦖': 'Rex', '👻': 'Phant'
          };
          const simpleName = names[newAvatar] || 'Player';
          nameInput.value = `${newAvatar} ${simpleName}`;
          this.setupConfig.players[index].name = nameInput.value;
        }
        
        avatarMenu.classList.remove('show');
      });
    });

    // Toggle Color Dropdown
    colorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllDropdowns();
      colorMenu.classList.toggle('show');
    });
    
    // Select Color
    colorMenu.querySelectorAll('.select-color-item').forEach(item => {
      item.addEventListener('click', () => {
        const newColor = item.style.backgroundColor;
        // Convert rgb to hex if needed
        const hexColor = this.rgbToHex(newColor);
        this.setupConfig.players[index].color = hexColor;
        
        colorBtn.querySelector('.color-dot').style.backgroundColor = hexColor;
        colorMenu.classList.remove('show');
      });
    });

    // Close on click outside
    document.addEventListener('click', () => {
      this.closeAllDropdowns();
    });
  }

  closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
  }

  rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues) return rgb;
    const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // Get cell center coordinate inside viewBox 0 0 100 100
  getCellCoordinates(cellNum) {
    const r = Math.floor((cellNum - 1) / 10);
    let c;
    if (r % 2 === 0) {
      c = (cellNum - 1) % 10;
    } else {
      c = 9 - ((cellNum - 1) % 10);
    }
    
    // Percentage coordinates (0-100)
    const x = (c + 0.5) * 10;
    const y = (9 - r + 0.5) * 10;
    return { x, y };
  }

  drawSnakesAndLadders() {
    if (this.snakeAnimations) {
      this.snakeAnimations.forEach(anim => {
        if (anim.resetTimeoutId) clearTimeout(anim.resetTimeoutId);
      });
    }
    this.snakeAnimations = [];
    this.dom.boardSvg.innerHTML = '';
    
    // Create gradients and glow filters in SVG definition
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff007f" />
        <stop offset="100%" stop-color="#7f00ff" />
      </linearGradient>
      <linearGradient id="realSnakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3ebd46" />
        <stop offset="50%" stop-color="#23852a" />
        <stop offset="100%" stop-color="#0e4a13" />
      </linearGradient>
      <linearGradient id="realSnakeHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3ebd46" />
        <stop offset="100%" stop-color="#0e4a13" />
      </linearGradient>
      <linearGradient id="woodLadderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d6b280" />
        <stop offset="100%" stop-color="#8c613c" />
      </linearGradient>
      <filter id="ladderShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.3" dy="0.6" stdDeviation="0.5" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
      
      <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="snakeShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0.5" dy="1.0" stdDeviation="0.9" flood-color="#000000" flood-opacity="0.65"/>
      </filter>
    `;
    this.dom.boardSvg.appendChild(defs);

    // Draw Ladders (Realistic wooden/bamboo rails with crossbars, knots, and peg joints)
    for (const [startStr, endStr] of Object.entries(GameConfig.ladders)) {
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      
      const p0 = this.getCellCoordinates(start);
      const p1 = this.getCellCoordinates(end);
      
      // Calculate perpendicular vector for side rails
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const nx = -dy / dist;
      const ny = dx / dist;
      
      const w = 1.35; // Half width of ladder
      
      // Create a group for the ladder to apply a unified 3D shadow
      const ladderGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      ladderGroup.setAttribute("filter", "url(#ladderShadow)");
      
      // Left Rail Base (Bamboo cylindrical look)
      const railL = document.createElementNS("http://www.w3.org/2000/svg", "line");
      railL.setAttribute("x1", p0.x + w * nx);
      railL.setAttribute("y1", p0.y + w * ny);
      railL.setAttribute("x2", p1.x + w * nx);
      railL.setAttribute("y2", p1.y + w * ny);
      railL.setAttribute("stroke", "url(#woodLadderGrad)");
      railL.setAttribute("stroke-width", "1.3");
      railL.setAttribute("stroke-linecap", "round");
      ladderGroup.appendChild(railL);
      
      // Left Rail Highlight (Rounded sheen)
      const railLHighlight = document.createElementNS("http://www.w3.org/2000/svg", "line");
      railLHighlight.setAttribute("x1", p0.x + w * nx);
      railLHighlight.setAttribute("y1", p0.y + w * ny);
      railLHighlight.setAttribute("x2", p1.x + w * nx);
      railLHighlight.setAttribute("y2", p1.y + w * ny);
      railLHighlight.setAttribute("stroke", "#f5e6cc");
      railLHighlight.setAttribute("stroke-width", "0.35");
      railLHighlight.setAttribute("opacity", "0.45");
      railLHighlight.setAttribute("stroke-linecap", "round");
      ladderGroup.appendChild(railLHighlight);
      
      // Right Rail Base
      const railR = document.createElementNS("http://www.w3.org/2000/svg", "line");
      railR.setAttribute("x1", p0.x - w * nx);
      railR.setAttribute("y1", p0.y - w * ny);
      railR.setAttribute("x2", p1.x - w * nx);
      railR.setAttribute("y2", p1.y - w * ny);
      railR.setAttribute("stroke", "url(#woodLadderGrad)");
      railR.setAttribute("stroke-width", "1.3");
      railR.setAttribute("stroke-linecap", "round");
      ladderGroup.appendChild(railR);
      
      // Right Rail Highlight
      const railRHighlight = document.createElementNS("http://www.w3.org/2000/svg", "line");
      railRHighlight.setAttribute("x1", p0.x - w * nx);
      railRHighlight.setAttribute("y1", p0.y - w * ny);
      railRHighlight.setAttribute("x2", p1.x - w * nx);
      railRHighlight.setAttribute("y2", p1.y - w * ny);
      railRHighlight.setAttribute("stroke", "#f5e6cc");
      railRHighlight.setAttribute("stroke-width", "0.35");
      railRHighlight.setAttribute("opacity", "0.45");
      railRHighlight.setAttribute("stroke-linecap", "round");
      ladderGroup.appendChild(railRHighlight);
      
      // Add natural bamboo nodes/joints along the rails
      const numKnots = Math.max(2, Math.floor(dist / 7.5));
      for (let k = 1; k <= numKnots; k++) {
        const t = k / (numKnots + 1);
        
        // Left rail knot
        const lkx = p0.x + w * nx + t * dx;
        const lky = p0.y + w * ny + t * dy;
        const knotL = document.createElementNS("http://www.w3.org/2000/svg", "line");
        knotL.setAttribute("x1", lkx - 0.7 * nx);
        knotL.setAttribute("y1", lky - 0.7 * ny);
        knotL.setAttribute("x2", lkx + 0.7 * nx);
        knotL.setAttribute("y2", lky + 0.7 * ny);
        knotL.setAttribute("stroke", "#4a301e");
        knotL.setAttribute("stroke-width", "0.32");
        knotL.setAttribute("stroke-linecap", "round");
        ladderGroup.appendChild(knotL);
        
        // Right rail knot
        const rkx = p0.x - w * nx + t * dx;
        const rky = p0.y - w * ny + t * dy;
        const knotR = document.createElementNS("http://www.w3.org/2000/svg", "line");
        knotR.setAttribute("x1", rkx - 0.7 * nx);
        knotR.setAttribute("y1", rky - 0.7 * ny);
        knotR.setAttribute("x2", rkx + 0.7 * nx);
        knotR.setAttribute("y2", rky + 0.7 * ny);
        knotR.setAttribute("stroke", "#4a301e");
        knotR.setAttribute("stroke-width", "0.32");
        knotR.setAttribute("stroke-linecap", "round");
        ladderGroup.appendChild(knotR);
      }
      
      // Rungs (Crossbars protruding slightly with pegged joints)
      const numRungs = Math.max(3, Math.floor(dist / 5.5));
      for (let i = 1; i < numRungs; i++) {
        const t = i / numRungs;
        
        const rlx = p0.x + w * nx + t * dx;
        const rly = p0.y + w * ny + t * dy;
        const rrx = p0.x - w * nx + t * dx;
        const rry = p0.y - w * ny + t * dy;
        
        // Rung base (protruding 0.45 units past the rails)
        const rung = document.createElementNS("http://www.w3.org/2000/svg", "line");
        rung.setAttribute("x1", rlx + 0.45 * nx);
        rung.setAttribute("y1", rly + 0.45 * ny);
        rung.setAttribute("x2", rrx - 0.45 * nx);
        rung.setAttribute("y2", rry - 0.45 * ny);
        rung.setAttribute("stroke", "url(#woodLadderGrad)");
        rung.setAttribute("stroke-width", "0.95");
        rung.setAttribute("stroke-linecap", "round");
        ladderGroup.appendChild(rung);
        
        // Rung Highlight
        const rungHighlight = document.createElementNS("http://www.w3.org/2000/svg", "line");
        rungHighlight.setAttribute("x1", rlx + 0.45 * nx);
        rungHighlight.setAttribute("y1", rly + 0.45 * ny);
        rungHighlight.setAttribute("x2", rrx - 0.45 * nx);
        rungHighlight.setAttribute("y2", rry - 0.45 * ny);
        rungHighlight.setAttribute("stroke", "#f5e6cc");
        rungHighlight.setAttribute("stroke-width", "0.25");
        rungHighlight.setAttribute("opacity", "0.4");
        rungHighlight.setAttribute("stroke-linecap", "round");
        ladderGroup.appendChild(rungHighlight);
        
        // Peg/Tying joints (holes/pegs on both intersections)
        const pegL = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pegL.setAttribute("cx", rlx);
        pegL.setAttribute("cy", rly);
        pegL.setAttribute("r", "0.24");
        pegL.setAttribute("fill", "#362215");
        ladderGroup.appendChild(pegL);
        
        const pegR = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pegR.setAttribute("cx", rrx);
        pegR.setAttribute("cy", rry);
        pegR.setAttribute("r", "0.24");
        pegR.setAttribute("fill", "#362215");
        ladderGroup.appendChild(pegR);
      }
      
      this.dom.boardSvg.appendChild(ladderGroup);
    }


    // Helper function for snake body tapering width profiles (thinner neck, plump body, pointed tail)
    const getWidthAtT = (t) => {
      if (t < 0.15) {
        const u = t / 0.15;
        return 1.8 + 0.6 * Math.sin(u * Math.PI / 2);
      } else if (t < 0.7) {
        const u = (t - 0.15) / 0.55;
        return 2.4 - 0.4 * u;
      } else {
        const u = (t - 0.7) / 0.3;
        return 2.0 * Math.pow(1 - u, 1.5) + 0.1;
      }
    };

    // Draw Snakes (Curved wavy body with scaly overlays, python head, and flickering tongue)
    let snakeIdx = 0;
    for (const [startStr, endStr] of Object.entries(GameConfig.snakes)) {
      snakeIdx++;
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      
      const p0 = this.getCellCoordinates(start); // Head (Higher tile)
      const p1 = this.getCellCoordinates(end);   // Tail (Lower tile)
      
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const nx = -dy / dist;
      const ny = dx / dist;
      
      // Control points to create wavy slither S-curve
      const waveAmp = Math.min(10, Math.max(4, dist * 0.18));
      const cx1 = p0.x + 0.33 * dx + waveAmp * nx;
      const cy1 = p0.y + 0.33 * dy + waveAmp * ny;
      const cx2 = p0.x + 0.66 * dx - waveAmp * nx;
      const cy2 = p0.y + 0.66 * dy - waveAmp * ny;
      
      const pathData = `M ${p0.x} ${p0.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
      const c1 = { x: cx1, y: cy1 };
      const c2 = { x: cx2, y: cy2 };

      const shadowLines = [];
      const maskLines = [];

      // 1. Drop Shadow Group (tapered shadow using overlapping line segments)
      const shadowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      shadowGroup.setAttribute("filter", "url(#snakeShadow)");
      
      const numSegments = 40;
      for (let i = 0; i < numSegments; i++) {
        const tA = i / numSegments;
        const tB = (i + 1) / numSegments;
        const ptA = this.getBezierPoint(tA, p0, c1, c2, p1);
        const ptB = this.getBezierPoint(tB, p0, c1, c2, p1);
        const tMid = (tA + tB) / 2;
        const w = getWidthAtT(tMid);
        
        const sLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        sLine.setAttribute("x1", ptA.x);
        sLine.setAttribute("y1", ptA.y);
        sLine.setAttribute("x2", ptB.x);
        sLine.setAttribute("y2", ptB.y);
        sLine.setAttribute("stroke", "#000000");
        sLine.setAttribute("stroke-width", w + 0.4);
        sLine.setAttribute("stroke-linecap", "round");
        shadowGroup.appendChild(sLine);
        shadowLines.push(sLine);
      }
      this.dom.boardSvg.appendChild(shadowGroup);

      // Create unique mask for tapering the body textures
      const maskId = `snake-mask-${start}`;
      const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
      mask.setAttribute("id", maskId);
      
      for (let i = 0; i < numSegments; i++) {
        const tA = i / numSegments;
        const tB = (i + 1) / numSegments;
        const ptA = this.getBezierPoint(tA, p0, c1, c2, p1);
        const ptB = this.getBezierPoint(tB, p0, c1, c2, p1);
        const tMid = (tA + tB) / 2;
        const w = getWidthAtT(tMid);
        
        const mLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        mLine.setAttribute("x1", ptA.x);
        mLine.setAttribute("y1", ptA.y);
        mLine.setAttribute("x2", ptB.x);
        mLine.setAttribute("y2", ptB.y);
        mLine.setAttribute("stroke", "#ffffff");
        mLine.setAttribute("stroke-width", w);
        mLine.setAttribute("stroke-linecap", "round");
        mask.appendChild(mLine);
        maskLines.push(mLine);
      }
      defs.appendChild(mask);

      // 2. Snake Body Group (masked for tapered look)
      const bodyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      bodyGroup.setAttribute("mask", `url(#${maskId})`);

      const bodyPaths = [];

      // Snake Body base path (Thick gradient base)
      const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
      body.setAttribute("d", pathData);
      body.setAttribute("class", "svg-snake-body");
      body.setAttribute("stroke", "url(#realSnakeGrad)");
      body.setAttribute("stroke-width", "3.2");
      bodyGroup.appendChild(body);
      bodyPaths.push(body);

      // Mottled Underbelly Layer (cream highlighting on sides)
      const underbelly = document.createElementNS("http://www.w3.org/2000/svg", "path");
      underbelly.setAttribute("d", pathData);
      underbelly.setAttribute("fill", "none");
      underbelly.setAttribute("stroke", "#d8f0c2");
      underbelly.setAttribute("stroke-width", "2.2");
      underbelly.setAttribute("stroke-dasharray", "8 5");
      underbelly.setAttribute("opacity", "0.35");
      bodyGroup.appendChild(underbelly);
      bodyPaths.push(underbelly);

      // Dark Transverse Bands (Dark brown stripes crossing the body)
      const bands = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bands.setAttribute("d", pathData);
      bands.setAttribute("fill", "none");
      bands.setAttribute("stroke", "#09220c");
      bands.setAttribute("stroke-width", "3.2");
      bands.setAttribute("stroke-dasharray", "1.5 3.0");
      bodyGroup.appendChild(bands);
      bodyPaths.push(bands);

      // Snake Scales Overlay (Diamond texture specular highlights)
      const scales = document.createElementNS("http://www.w3.org/2000/svg", "path");
      scales.setAttribute("d", pathData);
      scales.setAttribute("class", "svg-snake-scales");
      scales.setAttribute("stroke", "rgba(255, 255, 255, 0.28)");
      scales.setAttribute("stroke-width", "2.6");
      scales.setAttribute("stroke-dasharray", "0.3 0.9");
      bodyGroup.appendChild(scales);
      bodyPaths.push(scales);

      // Specular Spinal Highlight (3D cylinder sheen)
      const spine = document.createElementNS("http://www.w3.org/2000/svg", "path");
      spine.setAttribute("d", pathData);
      spine.setAttribute("fill", "none");
      spine.setAttribute("stroke", "rgba(255, 255, 255, 0.22)");
      spine.setAttribute("stroke-width", "0.5");
      bodyGroup.appendChild(spine);
      bodyPaths.push(spine);

      this.dom.boardSvg.appendChild(bodyGroup);

      // --- Python Head Math & Construction ---
      // Direction vector pointing from head center towards body
      const hdx = cx1 - p0.x;
      const hdy = cy1 - p0.y;
      const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
      const bx_dir = hdx / hdist;
      const by_dir = hdy / hdist;
      
      // Direction head is facing (outward nose direction)
      const fx = -bx_dir;
      const fy = -by_dir;
      
      // Perpendicular normal vector (jaw spread)
      const jx = -by_dir;
      const jy = bx_dir;

      // Coordinate vertices for triangular head
      const noseX = p0.x + 1.8 * fx;
      const noseY = p0.y + 1.8 * fy;
      
      const leftJawX = p0.x + 0.4 * bx_dir + 1.25 * jx;
      const leftJawY = p0.y + 0.4 * by_dir + 1.25 * jy;
      
      const rightJawX = p0.x + 0.4 * bx_dir - 1.25 * jx;
      const rightJawY = p0.y + 0.4 * by_dir - 1.25 * jy;
      
      const neckX = p0.x + 1.2 * bx_dir;
      const neckY = p0.y + 1.2 * by_dir;

      // Angle of head rotation in degrees
      const angleRad = Math.atan2(fy, fx);
      const angleDeg = angleRad * (180 / Math.PI);

      // 7. Draw Python Head Base
      const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      head.setAttribute("points", `${noseX},${noseY} ${leftJawX},${leftJawY} ${neckX},${neckY} ${rightJawX},${rightJawY}`);
      head.setAttribute("class", "svg-snake-head-viper");
      this.dom.boardSvg.appendChild(head);

      // --- Forked Tongue Math ---
      const tx = p0.x + 1.6 * fx; // Tongue base (at nose)
      const ty = p0.y + 1.6 * fy;
      
      const sx = p0.x + 3.1 * fx; // Split point
      const sy = p0.y + 3.1 * fy;
      
      const ltx = sx + 0.9 * fx + 0.65 * jx; // Left tip
      const lty = sy + 0.9 * fy + 0.65 * jy;
      
      const rtx = sx + 0.9 * fx - 0.65 * jx; // Right tip
      const rty = sy + 0.9 * fy - 0.65 * jy;

      // 8. Draw Forked Tongue with CSS Origin flicker animation (randomized delay to avoid simultaneous flickering)
      const tongue = document.createElementNS("http://www.w3.org/2000/svg", "path");
      tongue.setAttribute("d", `M ${tx} ${ty} L ${sx} ${sy} L ${ltx} ${lty} M ${sx} ${sy} L ${rtx} ${rty}`);
      tongue.setAttribute("class", "svg-snake-tongue");
      const delay = (Math.random() * 2.0).toFixed(2);
      tongue.setAttribute("style", `transform-origin: ${tx}% ${ty}%; animation-delay: -${delay}s;`);
      this.dom.boardSvg.appendChild(tongue);

      // Eye positions
      const ex1 = p0.x + 0.85 * fx + 0.58 * jx;
      const ey1 = p0.y + 0.85 * fy + 0.58 * jy;
      const ex2 = p0.x + 0.85 * fx - 0.58 * jx;
      const ey2 = p0.y + 0.85 * fy - 0.58 * jy;

      // Group for all python head markings and eyes
      const detailsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      detailsGroup.setAttribute("id", `head-details-${start}`);

      // Symmetrical golden-tan cheek/wing patches
      const leftPatch = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const lp1x = p0.x - 0.9 * fx + 0.6 * jx;
      const lp1y = p0.y - 0.9 * fy + 0.6 * jy;
      const lp2x = p0.x - 0.3 * fx + 1.05 * jx;
      const lp2y = p0.y - 0.3 * fy + 1.05 * jy;
      const lp3x = p0.x + 0.8 * fx + 0.4 * jx;
      const lp3y = p0.y + 0.8 * fy + 0.4 * jy;
      const lp4x = p0.x + 0.1 * fx + 0.2 * jx;
      const lp4y = p0.y + 0.1 * fy + 0.2 * jy;
      leftPatch.setAttribute("points", `${lp1x},${lp1y} ${lp2x},${lp2y} ${lp3x},${lp3y} ${lp4x},${lp4y}`);
      leftPatch.setAttribute("fill", "#8fd696");
      leftPatch.setAttribute("stroke", "#1b4f1f");
      leftPatch.setAttribute("stroke-width", "0.1");
      detailsGroup.appendChild(leftPatch);

      const rightPatch = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const rp1x = p0.x - 0.9 * fx - 0.6 * jx;
      const rp1y = p0.y - 0.9 * fy - 0.6 * jy;
      const rp2x = p0.x - 0.3 * fx - 1.05 * jx;
      const rp2y = p0.y - 0.3 * fy - 1.05 * jy;
      const rp3x = p0.x + 0.8 * fx - 0.4 * jx;
      const rp3y = p0.y + 0.8 * fy - 0.4 * jy;
      const rp4x = p0.x + 0.1 * fx - 0.2 * jx;
      const rp4y = p0.y + 0.1 * fy - 0.2 * jy;
      rightPatch.setAttribute("points", `${rp1x},${rp1y} ${rp2x},${rp2y} ${rp3x},${rp3y} ${rp4x},${rp4y}`);
      rightPatch.setAttribute("fill", "#8fd696");
      rightPatch.setAttribute("stroke", "#1b4f1f");
      rightPatch.setAttribute("stroke-width", "0.1");
      detailsGroup.appendChild(rightPatch);

      // Central dark spearhead stripe
      const spearhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const sp1x = p0.x - 1.15 * fx;
      const sp1y = p0.y - 1.15 * fy;
      const sp2x = p0.x - 0.4 * fx + 0.18 * jx;
      const sp2y = p0.y - 0.4 * fy + 0.18 * jy;
      const sp3x = p0.x + 1.4 * fx;
      const sp3y = p0.y + 1.4 * fy;
      const sp4x = p0.x - 0.4 * fx - 0.18 * jx;
      const sp4y = p0.y - 0.4 * fy - 0.18 * jy;
      spearhead.setAttribute("points", `${sp1x},${sp1y} ${sp2x},${sp2y} ${sp3x},${sp3y} ${sp4x},${sp4y}`);
      spearhead.setAttribute("fill", "#123c15");
      spearhead.setAttribute("stroke", "#08210b");
      spearhead.setAttribute("stroke-width", "0.08");
      detailsGroup.appendChild(spearhead);

      // Post-ocular dark stripe (Eye to jaw corner)
      const leftPostOcular = document.createElementNS("http://www.w3.org/2000/svg", "line");
      leftPostOcular.setAttribute("x1", ex1);
      leftPostOcular.setAttribute("y1", ey1);
      leftPostOcular.setAttribute("x2", leftJawX);
      leftPostOcular.setAttribute("y2", leftJawY);
      leftPostOcular.setAttribute("stroke", "#123c15");
      leftPostOcular.setAttribute("stroke-width", "0.18");
      leftPostOcular.setAttribute("stroke-linecap", "round");
      detailsGroup.appendChild(leftPostOcular);

      const rightPostOcular = document.createElementNS("http://www.w3.org/2000/svg", "line");
      rightPostOcular.setAttribute("x1", ex2);
      rightPostOcular.setAttribute("y1", ey2);
      rightPostOcular.setAttribute("x2", rightJawX);
      rightPostOcular.setAttribute("y2", rightJawY);
      rightPostOcular.setAttribute("stroke", "#123c15");
      rightPostOcular.setAttribute("stroke-width", "0.18");
      rightPostOcular.setAttribute("stroke-linecap", "round");
      detailsGroup.appendChild(rightPostOcular);

      // Mottled spots on head edges
      const spot1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      spot1.setAttribute("cx", p0.x + 0.3 * fx);
      spot1.setAttribute("cy", p0.y + 0.3 * fy);
      spot1.setAttribute("r", "0.55");
      spot1.setAttribute("fill", "#08210b");
      detailsGroup.appendChild(spot1);

      const spot2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      spot2.setAttribute("cx", p0.x + 0.6 * bx_dir);
      spot2.setAttribute("cy", p0.y + 0.6 * by_dir);
      spot2.setAttribute("r", "0.45");
      spot2.setAttribute("fill", "#08210b");
      detailsGroup.appendChild(spot2);

      // Left Eye
      const eye1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eye1.setAttribute("cx", ex1);
      eye1.setAttribute("cy", ey1);
      eye1.setAttribute("r", "0.38");
      eye1.setAttribute("fill", "#f39c12");
      eye1.setAttribute("stroke", "#08210b");
      eye1.setAttribute("stroke-width", "0.08");
      detailsGroup.appendChild(eye1);

      const pupil1 = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      pupil1.setAttribute("cx", ex1);
      pupil1.setAttribute("cy", ey1);
      pupil1.setAttribute("rx", "0.06");
      pupil1.setAttribute("ry", "0.22");
      pupil1.setAttribute("fill", "black");
      pupil1.setAttribute("transform", `rotate(${angleDeg + 90}, ${ex1}, ${ey1})`);
      detailsGroup.appendChild(pupil1);

      const glint1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      glint1.setAttribute("cx", ex1 + 0.12 * fx + 0.08 * jx);
      glint1.setAttribute("cy", ey1 + 0.12 * fy + 0.08 * jy);
      glint1.setAttribute("r", "0.08");
      glint1.setAttribute("fill", "white");
      detailsGroup.appendChild(glint1);
      
      // Right Eye
      const eye2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eye2.setAttribute("cx", ex2);
      eye2.setAttribute("cy", ey2);
      eye2.setAttribute("r", "0.38");
      eye2.setAttribute("fill", "#f39c12");
      eye2.setAttribute("stroke", "#08210b");
      eye2.setAttribute("stroke-width", "0.08");
      detailsGroup.appendChild(eye2);

      const pupil2 = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      pupil2.setAttribute("cx", ex2);
      pupil2.setAttribute("cy", ey2);
      pupil2.setAttribute("rx", "0.06");
      pupil2.setAttribute("ry", "0.22");
      pupil2.setAttribute("fill", "black");
      pupil2.setAttribute("transform", `rotate(${angleDeg + 90}, ${ex2}, ${ey2})`);
      detailsGroup.appendChild(pupil2);

      const glint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      glint2.setAttribute("cx", ex2 + 0.12 * fx - 0.08 * jx);
      glint2.setAttribute("cy", ey2 + 0.12 * fy - 0.08 * jy);
      glint2.setAttribute("r", "0.08");
      glint2.setAttribute("fill", "white");
      detailsGroup.appendChild(glint2);

      this.dom.boardSvg.appendChild(detailsGroup);

      // Save animation references
      this.snakeAnimations.push({
        snakeIdx,
        start,
        end,
        defaultEnd: end,
        p0,
        p1,
        cx1,
        cy1,
        cx2,
        cy2,
        nx,
        ny,
        bodyPaths,
        shadowLines,
        maskLines
      });
    }
  }

  handleGameStateChange(game) {
    if (game.gameState === 'setup') {
      this.dom.setupScreen.classList.remove('hidden');
      this.dom.playScreen.classList.add('hidden');
      if (this.dom.rosterCard) this.dom.rosterCard.classList.add('hidden');
      if (this.dom.diceTurnIndicator) this.dom.diceTurnIndicator.classList.add('hidden');
      this.dom.tokensContainer.innerHTML = '';
      this.dom.historyLog.innerHTML = '';
      this.sound.stopMusic();
    } else if (game.gameState === 'playing' || game.gameState === 'finished') {
      this.dom.setupScreen.classList.add('hidden');
      this.dom.playScreen.classList.remove('hidden');
      if (this.dom.rosterCard) this.dom.rosterCard.classList.remove('hidden');
      
      // Draw board elements for both players (including resets)
      this.drawSnakesAndLadders();
      
      // Create tokens if not exists
      if (this.dom.tokensContainer.childElementCount === 0) {
        this.initializeTokens(game.players);
      }
      
      this.updateHUD();
      this.updateHistory(game.history);
      
      if (game.gameState === 'playing') {
        this.sound.startMusic();
        // Trigger bot turn if current player is a bot
        this.checkBotTurn();
      }
    }
  }

  initializeTokens(players) {
    this.dom.tokensContainer.innerHTML = '';
    players.forEach(p => {
      const token = document.createElement('div');
      token.className = 'token';
      token.id = `token-${p.id}`;
      token.style.color = p.color;
      
      const isImg = p.avatar && (p.avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i) || p.avatar.startsWith('data:image/'));
      
      if (isImg) {
        token.innerHTML = `<img src="${p.avatar}" class="token-image" alt="${p.name}">`;
      } else {
        token.innerHTML = p.avatar || '';
      }
      this.dom.tokensContainer.appendChild(token);
    });
    this.updateTokensUI(false);
  }

  updateTokensUI(animate = true) {
    // Group players by position to resolve overlap offsets
    const positions = {};
    this.game.players.forEach(p => {
      if (!positions[p.position]) {
        positions[p.position] = [];
      }
      positions[p.position].push(p);
    });

    // Apply percentage layout with offsets
    for (const [posStr, playerList] of Object.entries(positions)) {
      const pos = parseInt(posStr);
      const center = this.getCellCoordinates(pos);
      
      const count = playerList.length;
      playerList.forEach((player, idx) => {
        const token = document.getElementById(`token-${player.id}`);
        if (!token) return;
        
        // Highlight Active Player
        if (this.game.getCurrentPlayer().id === player.id && this.game.gameState === 'playing') {
          token.classList.add('active-player-token');
          token.style.color = player.color;
        } else {
          token.classList.remove('active-player-token');
        }

        let dx = 0;
        let dy = -2.0; // Shift characters slightly upwards to stand on the cell
        
        // Circular offset calculation if overlapping on same square
        if (count > 1) {
          const r = 2.2; // Radius in SVG percent coordinates
          const angle = (2 * Math.PI / count) * idx - Math.PI / 2;
          dx = r * Math.cos(angle);
          dy = r * Math.sin(angle) - 2.0;
        }

        // Apply percentages
        token.style.transition = animate ? 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        token.style.left = `${center.x + dx}%`;
        token.style.top = `${center.y + dy}%`;
      });
    }
  }

  updateHUD() {
    const curPlayer = (this.isAnimating && this.animatingPlayer) ? this.animatingPlayer : this.game.getCurrentPlayer();
    if (!curPlayer) return;

    if (curPlayer.avatar && curPlayer.avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      this.dom.currentPlayerAvatar.innerHTML = `<img src="${curPlayer.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      this.dom.currentPlayerAvatar.style.padding = '0';
      this.dom.currentPlayerAvatar.style.background = 'transparent';
    } else {
      this.dom.currentPlayerAvatar.innerText = curPlayer.avatar;
      this.dom.currentPlayerAvatar.style.padding = '';
      this.dom.currentPlayerAvatar.style.background = '';
    }
    this.dom.currentPlayerAvatar.style.color = curPlayer.color;
    this.dom.currentPlayerAvatar.style.boxShadow = `0 0 20px ${curPlayer.color}`;
    this.dom.currentPlayerName.innerText = curPlayer.name;
    
    // Calculate if it's the local user's turn
    let isLocalUserTurn = false;
    if (this.isOnlineMode) {
      const localId = this.onlineRoomType === 'host' ? 1 : 2;
      isLocalUserTurn = (curPlayer.id === localId);
    } else {
      isLocalUserTurn = !curPlayer.isBot;
    }

    if (this.isAnimating) {
      this.dom.currentPlayerStatus.innerHTML = isLocalUserTurn ? `You are moving...` : `${curPlayer.name} is moving...`;
      this.dom.rollBtn.disabled = true;
      this.dom.rollBtn.innerText = "Moving...";
    } else {
      if (this.isOnlineMode) {
        if (isLocalUserTurn) {
          this.dom.currentPlayerStatus.innerHTML = `Your Turn! Click Dice to Roll`;
          this.dom.rollBtn.disabled = false;
          this.dom.rollBtn.innerText = "Roll Dice";
        } else {
          this.dom.currentPlayerStatus.innerHTML = `Waiting for ${curPlayer.name} to roll...`;
          this.dom.rollBtn.disabled = true;
          this.dom.rollBtn.innerText = "Waiting...";
        }
      } else {
        if (curPlayer.isBot) {
          this.dom.currentPlayerStatus.innerHTML = `🤖 Thinking...`;
          this.dom.rollBtn.disabled = true;
          this.dom.rollBtn.innerText = "Robot Rolling...";
        } else {
          this.dom.currentPlayerStatus.innerHTML = `Your Turn! Click Dice to Roll`;
          this.dom.rollBtn.disabled = false;
          this.dom.rollBtn.innerText = "Roll Dice";
        }
      }
    }
    
    // Highlight Active Player's target cell briefly
    document.querySelectorAll('.board-cell').forEach(c => c.style.boxShadow = '');
    const activeCell = document.getElementById(`cell-${curPlayer.position}`);
    if (activeCell) {
      activeCell.style.boxShadow = `inset 0 0 12px ${curPlayer.color}50, 0 0 10px ${curPlayer.color}30`;
    }

    // Update Dice Turn Indicator
    if (this.dom.diceTurnIndicator) {
      this.dom.diceTurnIndicator.classList.remove('hidden');
      
      const arrowEl = this.dom.diceTurnIndicator.querySelector('.turn-pointer-arrow');
      const textEl = this.dom.diceTurnIndicator.querySelector('.turn-pointer-text');
      
      if (isLocalUserTurn) {
        this.dom.diceTurnIndicator.classList.add('your-turn');
        this.dom.diceTurnIndicator.classList.remove('opponents-turn');
        this.dom.diceTurnIndicator.style.color = curPlayer.color;
        this.dom.diceTurnIndicator.style.textShadow = `0 0 10px ${curPlayer.color}`;
        if (arrowEl) {
          arrowEl.innerText = "👇";
          arrowEl.style.display = "inline-block";
        }
        if (textEl) textEl.innerText = "YOUR TURN!";
      } else {
        this.dom.diceTurnIndicator.classList.remove('your-turn');
        this.dom.diceTurnIndicator.classList.add('opponents-turn');
        this.dom.diceTurnIndicator.style.color = "#888899";
        this.dom.diceTurnIndicator.style.textShadow = "none";
        if (arrowEl) {
          arrowEl.innerText = "⏳";
          arrowEl.style.display = "none";
        }
        if (textEl) textEl.innerText = "PLAYERS' TURN";
      }
    }

    // Update Roster list highlighting if match is running
    if (this.game.gameState !== 'setup') {
      this.renderHUDPlayersList();
    }
  }

  updateHistory(history) {
    this.dom.historyLog.innerHTML = '';
    history.forEach(item => {
      const logDiv = document.createElement('div');
      logDiv.className = 'history-item';
      
      // Style key actions
      let msg = item.message;
      msg = msg.replace(/(climbed a ladder)/g, '<span class="log-ladder">$1</span>');
      msg = msg.replace(/(got bit by a snake)/g, '<span class="log-snake">$1</span>');
      msg = msg.replace(/(won the game)/g, '<span class="log-win">$1</span>');
      
      logDiv.innerHTML = `<span class="log-time">${item.time}</span> ${msg}`;
      this.dom.historyLog.appendChild(logDiv);
    });
    
    // Auto-scroll to bottom of log
    this.dom.historyLog.scrollTop = this.dom.historyLog.scrollHeight;
  }

  async handleDiceRollRequest() {
    if (this.isAnimating || this.game.gameState !== 'playing') return;
    const player = this.game.getCurrentPlayer();
    if (player.isBot) return; // Prevent double clicking bot turn

    if (this.isOnlineMode) {
      const activeIdx = this.game.activePlayerIndex;
      const isMyTurn = (this.onlineRoomType === 'host' && activeIdx === 0) ||
                       (this.onlineRoomType === 'join' && activeIdx === 1);
      if (!isMyTurn) {
        this.showToast("It's your opponent's turn!", 'info');
        return;
      }
    }

    this.rollAndExecute();
  }

  async rollAndExecute(forcedRoll = null) {
    this.isAnimating = true;
    this.animatingPlayer = this.game.getCurrentPlayer();
    this.dom.rollBtn.disabled = true;

    // Trigger Dice Shake audio and CSS spin animation
    this.sound.playDiceShake();
    this.dom.diceCube.classList.add('rolling');
    
    // We fetch the result before animation completes to target the rotation face
    const result = await this.game.playTurn(forcedRoll);
    const roll = result.roll;
    
    // Broadcast the roll if it's online mode and we rolled it locally
    if (this.isOnlineMode && forcedRoll === null) {
      this.conn.send({
        type: 'ROLL',
        roll: roll
      });
    }

    // Play the clicking bounce sound sequence
    setTimeout(() => {
      this.sound.playDiceRoll();
    }, 150);

    setTimeout(async () => {
      // Set the 3D dice rotation face
      this.dom.diceCube.classList.remove('rolling');
      this.dom.diceCube.setAttribute('data-face', roll);
      
      // Step-by-step player token animation
      await this.animatePlayerPath(result);
      
      this.isAnimating = false;
      this.animatingPlayer = null;
      this.updateHUD();
      
      if (this.game.gameState === 'finished') {
        this.handleGameFinished(this.game.winner);
        this.sound.stopMusic();
      } else {
        this.checkBotTurn();
      }
    }, 1100); // Match CSS rolling keyframes
  }

  async animatePlayerPath(result) {
    const { player, path, snakeOrLadder, finalPosition } = result;
    const token = document.getElementById(`token-${player.id}`);
    const charEl = document.getElementById(`char-${player.id}`);
    
    if (!token) return;

    // 1. Move step-by-step
    if (charEl) charEl.classList.add('walking');
    for (let i = 0; i < path.length; i++) {
      const currentStep = path[i];
      player.position = currentStep;
      
      // Visual shift
      this.updateTokensUI(true);
      this.sound.playMove();
      
      // Wait for step transition
      await this.wait(350);
    }
    if (charEl) charEl.classList.remove('walking');

    // 2. If snake or ladder is hit, wait briefly then play special climb/slide animation
    if (snakeOrLadder) {
      await this.wait(400); // Pause on entry tile
      
      if (snakeOrLadder.type === 'ladder') {
        this.sound.playLadderClimb();
        this.showToast(`${player.name} climbed a ladder! ✨`, 'ladder');
        player.position = finalPosition;
        this.updateTokensUI(true);
        await this.wait(600); // Wait for the climb/slide transition to finish
      } else {
        // Snake interception flow!
        let escaped = false;
        let randomTail = null;
        
        if (this.isOnlineMode) {
          const activeIdx = this.game.activePlayerIndex;
          const isLocalPlayer = (this.onlineRoomType === 'host' && activeIdx === 0) ||
                                 (this.onlineRoomType === 'join' && activeIdx === 1);
          if (isLocalPlayer) {
            escaped = await this.triggerSnakeRescueFlow(player, snakeOrLadder);
            if (!escaped) {
              const startPos = snakeOrLadder.start;
              const possibleCells = [];
              for (let i = 1; i < startPos; i++) {
                if (!GameConfig.snakes[i]) possibleCells.push(i);
              }
              if (possibleCells.length === 0) possibleCells.push(1);
              randomTail = possibleCells[Math.floor(Math.random() * possibleCells.length)];
            }
            // Send result to remote player
            this.conn.send({
              type: 'QUIZ_RESULT',
              escaped: escaped,
              randomTail: randomTail
            });
          } else {
            this.showToast(`Waiting for ${player.name} to solve rescue quiz... ⏱️`, 'info');
            // Wait for incoming WebRTC sync message
            const syncResult = await new Promise((resolve) => {
              this.quizResultResolver = resolve;
            });
            escaped = syncResult.escaped;
            randomTail = syncResult.randomTail;
          }
        } else {
          if (player.isBot) {
            escaped = Math.random() < 0.35;
            if (escaped) {
              this.showToast(`🤖 Clever! Bot ${player.name} answered correctly in background and escaped!`, 'ladder');
            }
          } else {
            escaped = await this.triggerSnakeRescueFlow(player, snakeOrLadder);
          }
          
          if (!escaped) {
            const startPos = snakeOrLadder.start;
            const possibleCells = [];
            for (let i = 1; i < startPos; i++) {
              if (!GameConfig.snakes[i]) possibleCells.push(i);
            }
            if (possibleCells.length === 0) possibleCells.push(1);
            randomTail = possibleCells[Math.floor(Math.random() * possibleCells.length)];
          }
        }
        
        if (!escaped) {
          const startPos = snakeOrLadder.start;
          
          // Let game engine resolve state with this custom tail
          this.game.resolveSnakeRescue(escaped, randomTail);
          
          // Find the corresponding snake animation object to morph the tail coordinates
          const anim = this.snakeAnimations.find(a => a.start === startPos);
          
          this.sound.playSnakeBite();
          this.showToast(`Bitten! ${player.name} sliding down to a randomized cell (${randomTail})! 🐍`, 'snake');
          
          if (charEl) charEl.classList.add('walking');
          
          if (anim) {
            // Get coordinates of the new random tail cell
            const p1_target = this.getCellCoordinates(randomTail);
            
            // Animating loop for morphing the snake tail and sliding the player slowly
            const duration = 2500; // 2.5 seconds (very slow and suspenseful)
            const startTime = performance.now();
            const p1_start = { x: anim.p1.x, y: anim.p1.y };
            const p0_coords = anim.p0;
            
            // Set the final target in the anim object for subsequent turns/draws
            anim.end = randomTail;
            
            await new Promise((resolve) => {
              const animateSnakeTail = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing
                const ease = progress < 0.5 
                  ? 4 * progress * progress * progress 
                  : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                  
                // Interpolate
                const currentP1 = {
                  x: p1_start.x + (p1_target.x - p1_start.x) * ease,
                  y: p1_start.y + (p1_target.y - p1_start.y) * ease
                };
                
                const dx = currentP1.x - p0_coords.x;
                const dy = currentP1.y - p0_coords.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                
                const nx = -dy / dist;
                const ny = dx / dist;
                
                const waveAmp = Math.min(10, Math.max(4, dist * 0.18));
                const cx1 = p0_coords.x + 0.33 * dx + waveAmp * nx;
                const cy1 = p0_coords.y + 0.33 * dy + waveAmp * ny;
                const cx2 = p0_coords.x + 0.66 * dx - waveAmp * nx;
                const cy2 = p0_coords.y + 0.66 * dy - waveAmp * ny;
                
                // Update properties in anim object
                anim.p1 = currentP1;
                anim.cx1 = cx1;
                anim.cy1 = cy1;
                anim.cx2 = cx2;
                anim.cy2 = cy2;
                anim.nx = nx;
                anim.ny = ny;
                
                // Visually move player token along with the tail tip
                if (token) {
                  token.style.transition = 'none';
                  token.style.left = `${currentP1.x}%`;
                  token.style.top = `${currentP1.y - 2.0}%`;
                }
                
                if (progress < 1) {
                  requestAnimationFrame(animateSnakeTail);
                } else {
                  resolve();
                }
              };
              requestAnimationFrame(animateSnakeTail);
            });
            
            // Set final positions and update UI overlays/overlaps
            player.position = randomTail;
            this.updateTokensUI(true);
            await this.wait(400);

            // Clear any existing reset timeout for this snake
            if (anim.resetTimeoutId) {
              clearTimeout(anim.resetTimeoutId);
            }
            
            // Only host or local play schedules the 60-second timer to morph the snake back
            if (!this.isOnlineMode || this.onlineRoomType === 'host') {
              anim.resetTimeoutId = setTimeout(() => {
                this.morphSnakeBack(startPos);
                anim.resetTimeoutId = null;
              }, 60000);
            }
          } else {
            // Fallback
            player.position = randomTail;
            this.updateTokensUI(true);
            await this.wait(1500);
          }
          
          if (charEl) charEl.classList.remove('walking');
        } else {
          // If escaped, resolve in engine normally (no movement)
          this.game.resolveSnakeRescue(escaped);
        }
      }
    }
  }

  async morphSnakeBack(startPos) {
    const anim = this.snakeAnimations.find(a => a.start === startPos);
    if (!anim) return;
    
    const defaultTail = anim.defaultEnd;
    if (anim.end === defaultTail) return;
    
    // Get target coordinates of the default tail
    const p1_target = this.getCellCoordinates(defaultTail);
    const p1_start = { x: anim.p1.x, y: anim.p1.y };
    const p0_coords = anim.p0;
    
    // Animating loop for morphing the snake tail back slowly (over 2 seconds)
    const duration = 2000; 
    const startTime = performance.now();
    
    anim.end = defaultTail;
    
    // Update GameConfig back to the original tail in both UI and game engine config
    GameConfig.snakes[startPos] = defaultTail;
    
    // If online mode and we are the host, broadcast morph-back to guest
    if (this.isOnlineMode && this.onlineRoomType === 'host' && this.conn && this.conn.open) {
      this.conn.send({
        type: 'MORPH_BACK',
        startPos: startPos
      });
    }
    
    await new Promise((resolve) => {
      const animateBack = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
        const currentP1 = {
          x: p1_start.x + (p1_target.x - p1_start.x) * ease,
          y: p1_start.y + (p1_target.y - p1_start.y) * ease
        };
        
        const dx = currentP1.x - p0_coords.x;
        const dy = currentP1.y - p0_coords.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        
        const nx = -dy / dist;
        const ny = dx / dist;
        
        const waveAmp = Math.min(10, Math.max(4, dist * 0.18));
        const cx1 = p0_coords.x + 0.33 * dx + waveAmp * nx;
        const cy1 = p0_coords.y + 0.33 * dy + waveAmp * ny;
        const cx2 = p0_coords.x + 0.66 * dx - waveAmp * nx;
        const cy2 = p0_coords.y + 0.66 * dy - waveAmp * ny;
        
        anim.p1 = currentP1;
        anim.cx1 = cx1;
        anim.cy1 = cy1;
        anim.cx2 = cx2;
        anim.cy2 = cy2;
        anim.nx = nx;
        anim.ny = ny;
        
        if (progress < 1) {
          requestAnimationFrame(animateBack);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animateBack);
    });
    
    this.showToast(`The snake at ${startPos} has returned to its default nest! 🐍`, 'info');
  }

  initHostPeer() {
    this.dom.generateCodeBtn.disabled = true;
    this.dom.generateCodeBtn.innerText = "Connecting to PeerJS signal server...";
    
    // Choose a random 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000);
    this.peer = new Peer(`cs-game-${code}`);
    
    this.peer.on('open', (id) => {
      this.showToast("Room created! Share your code.", "info");
      this.dom.generateCodeBtn.classList.add('hidden');
      this.dom.hostCodeDisplay.classList.remove('hidden');
      this.dom.roomCodeVal.innerText = code;
    });
    
    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this.setupConnectionListeners();
    });
    
    this.peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // ID taken, retry
        this.peer.destroy();
        this.initHostPeer();
      } else {
        this.showToast(`Signal error: ${err.message}`, "error");
        this.dom.generateCodeBtn.disabled = false;
        this.dom.generateCodeBtn.innerText = "Generate Room Code";
      }
    });
  }

  initJoinerPeer(code) {
    this.dom.connectGameBtn.disabled = true;
    this.dom.connectGameBtn.innerText = "Connecting...";
    
    this.peer = new Peer();
    
    this.peer.on('open', (id) => {
      this.conn = this.peer.connect(`cs-game-${code}`);
      this.setupConnectionListeners();
    });
    
    this.peer.on('error', (err) => {
      this.showToast(`Connection failed: ${err.message}`, "error");
      this.dom.connectGameBtn.disabled = false;
      this.dom.connectGameBtn.innerText = "Connect & Play";
      if (this.peer) this.peer.destroy();
    });
  }

  setupConnectionListeners() {
    this.conn.on('open', () => {
      this.showToast("Opponent Connected! 🎮", "info");
      
      const myProfile = {
        name: this.dom.onlinePlayerName.value.trim() || (this.onlineRoomType === 'host' ? "Host" : "Guest"),
        color: this.onlineMyColor,
        avatar: this.dom.onlinePlayerAvatar.value === 'custom' ? this.onlineMyAvatarData : this.dom.onlinePlayerAvatar.value
      };
      
      if (this.onlineRoomType === 'host') {
        // Waiting for guest profile message
        this.showToast("Waiting for partner profile details...", "info");
      } else {
        // Guest sends their profile to host
        this.conn.send({
          type: 'SETUP_GUEST',
          profile: myProfile
        });
        this.dom.connectGameBtn.innerText = "Connected! Waiting for Host...";
        this.dom.connectGameBtn.disabled = true;
      }
    });
    
    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });
    
    this.conn.on('close', () => {
      this.handleDisconnect();
    });
    
    this.conn.on('error', (err) => {
      this.showToast(`Connection error: ${err.message}`, "error");
      this.handleDisconnect();
    });
  }

  handleIncomingData(data) {
    switch (data.type) {
      case 'SETUP_GUEST':
        // Host receives guest profile
        this.onlinePartnerData = data.profile;
        this.showToast(`Opponent: ${data.profile.name} is ready!`, "info");
        
        // Show launch match button to host
        this.dom.startGameBtn.classList.remove('hidden');
        this.dom.startGameBtn.innerText = "Start Online Match 🚀";
        break;
        
      case 'START_GAME':
        // Guest receives start game signal with complete synced settings
        this.game.reset();
        this.game.exactRollToWin = data.exactRollToWin;
        data.players.forEach(p => {
          this.game.addPlayer(p.name, p.color, p.avatar, false);
        });
        
        this.game.startGame();
        this.showToast("Match Started!", "info");
        break;
        
      case 'ROLL':
        // Receive forced dice roll result from opponent
        this.rollAndExecute(data.roll);
        break;
        
      case 'QUIZ_RESULT':
        // Receive snake rescue quiz result
        if (this.quizResultResolver) {
          this.quizResultResolver({
            escaped: data.escaped,
            randomTail: data.randomTail
          });
          this.quizResultResolver = null;
        }
        break;
        
      case 'MORPH_BACK':
        // Receive snake tail morph reset command
        this.morphSnakeBack(data.startPos);
        break;
        
      case 'RESTART_GAME':
        // Opponent restarted
        this.dom.victoryModal.classList.remove('show');
        this.stopConfetti();
        this.game.reset();
        break;
        
      case 'CHANGE_COLOR':
        // Opponent changed player color mid-game
        this.changePlayerColor(data.playerIndex, data.color);
        break;
    }
  }

  handleDisconnect() {
    this.showToast("Opponent Disconnected! Reverting to local play setup.", "error");
    
    // Clear connection and reset ui
    this.disconnectPeer();
    
    // Revert setup UI to local play
    this.isOnlineMode = false;
    if (this.dom.modeLocalBtn) this.dom.modeLocalBtn.classList.add('active');
    if (this.dom.modeOnlineBtn) this.dom.modeOnlineBtn.classList.remove('active');
    if (this.dom.localSetupOptions) this.dom.localSetupOptions.classList.remove('hidden');
    if (this.dom.onlineSetupOptions) this.dom.onlineSetupOptions.classList.add('hidden');
    if (this.dom.startGameBtn) {
      this.dom.startGameBtn.classList.remove('hidden');
      this.dom.startGameBtn.innerText = "Launch Game 🚀";
    }
    
    // Return to setup if in game
    this.dom.victoryModal.classList.remove('show');
    this.stopConfetti();
    this.game.reset(); // trigger setup screen redirect
  }

  disconnectPeer() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    // Reset buttons and panels
    if (this.dom.generateCodeBtn) {
      this.dom.generateCodeBtn.disabled = false;
      this.dom.generateCodeBtn.classList.remove('hidden');
      this.dom.generateCodeBtn.innerText = "Generate Room Code";
    }
    if (this.dom.hostCodeDisplay) {
      this.dom.hostCodeDisplay.classList.add('hidden');
    }
    if (this.dom.connectGameBtn) {
      this.dom.connectGameBtn.disabled = false;
      this.dom.connectGameBtn.innerText = "Connect & Play";
    }
    this.onlinePartnerData = null;
  }

  updateOnlineSetupView() {
    // Sync the tabs view
    if (this.onlineRoomType === 'host') {
      this.dom.onlineHostTab.click();
    } else {
      this.dom.onlineJoinTab.click();
    }
  }

  checkBotTurn() {
    if (this.game.gameState !== 'playing') return;
    
    const player = this.game.getCurrentPlayer();
    if (player && player.isBot && !this.isAnimating) {
      // Auto trigger bot turn after small realistic thinking delay
      setTimeout(() => {
        if (this.game.getCurrentPlayer().id === player.id) {
          this.rollAndExecute();
        }
      }, 1200);
    }
  }

  handleGameFinished(winner) {
    this.sound.playVictory();
    
    // Populate stats
    const isImg = winner.avatar && (winner.avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i) || winner.avatar.startsWith('data:image/'));
    if (isImg) {
      this.dom.winnerAvatar.innerHTML = `<img src="${winner.avatar}">`;
      this.dom.winnerAvatar.style.textShadow = 'none';
      this.dom.winnerAvatar.style.background = 'transparent';
    } else {
      this.dom.winnerAvatar.innerText = winner.avatar;
      this.dom.winnerAvatar.style.textShadow = `0 0 20px ${winner.color}`;
      this.dom.winnerAvatar.style.background = '';
    }
    this.dom.winnerName.innerText = winner.name;
    this.dom.winnerName.style.color = winner.color;
    
    this.dom.winnerRolls.innerText = winner.stats.rolls;
    this.dom.winnerClimbs.innerText = winner.stats.climbs;
    this.dom.winnerBites.innerText = winner.stats.bites;
    if (this.dom.winnerEscapes) {
      this.dom.winnerEscapes.innerText = winner.stats.escapes || 0;
    }
    
    // Show Modal and Confetti
    setTimeout(() => {
      this.dom.victoryModal.classList.add('show');
      this.startConfetti();
    }, 1000);
  }

  // --- Simulated Ad Ecosystem & Revenue Dashboard ---
  startAdEcosystem() {
    this.adsCatalog = [
      {
        title: "Quantum Dice V2",
        desc: "Upgrade to premium neon dice skins today!",
        icon: "🎲",
        btn: "Upgrade"
      },
      {
        title: "Antigravity AI",
        desc: "Hire autonomous AI software developers to code your projects.",
        icon: "💻",
        btn: "Hire Now"
      },
      {
        title: "Cyber-Vitamins",
        desc: "Boost your bot's response rate by 25% with plasma fluid.",
        icon: "🧪",
        btn: "Synthesize"
      },
      {
        title: "Hacker Shield VPN",
        desc: "Mask your IP from digital snakes. Get 3 months free!",
        icon: "🛡️",
        btn: "Get VPN"
      },
      {
        title: "Neon Burger",
        desc: "Synthesized synth-beef burgers delivered in 5 minutes.",
        icon: "🍔",
        btn: "Order"
      }
    ];
    this.currentAdIndex = 0;
    this.mockAdClicks = 0;
    
    // Display first ad immediately
    this.rotateBannerAd();
    
    // Rotate every 12 seconds
    this.adInterval = setInterval(() => {
      this.rotateBannerAd();
    }, 12000);
    
    // Hook up click handler for Banner ad CPC simulation
    if (this.dom.bannerAdBtn) {
      this.dom.bannerAdBtn.addEventListener('click', () => {
        this.mockAdClicks++;
        this.game.totalMockRevenue += 0.25; // Banner CPC pays $0.25 mock revenue!
        this.updateRevenueDashboard();
        this.showToast("Mock Ad Clicked! Earned $0.25 CPC revenue 💸", 'info');
      });
    }
  }

  rotateBannerAd() {
    if (!this.adsCatalog || this.adsCatalog.length === 0) return;
    
    // Rotate index
    this.currentAdIndex = (this.currentAdIndex + 1) % this.adsCatalog.length;
    const ad = this.adsCatalog[this.currentAdIndex];
    
    // Update DOM
    if (this.dom.bannerAdTitle) this.dom.bannerAdTitle.innerText = ad.title;
    if (this.dom.bannerAdDesc) this.dom.bannerAdDesc.innerText = ad.desc;
    if (this.dom.bannerAdIcon) this.dom.bannerAdIcon.innerText = ad.icon;
    if (this.dom.bannerAdBtn) this.dom.bannerAdBtn.innerText = ad.btn;
    
    // Banner impression CPM adds $0.004
    this.game.mockImpressions++;
    this.game.totalMockRevenue += 0.004;
    this.updateRevenueDashboard();
  }

  updateRevenueDashboard() {
    if (this.dom.revenueVal) {
      this.dom.revenueVal.innerText = `$${this.game.totalMockRevenue.toFixed(2)}`;
    }
    if (this.dom.impressionsVal) {
      this.dom.impressionsVal.innerText = this.game.mockImpressions;
    }
    if (this.dom.ctrVal) {
      const clicks = this.mockAdClicks || 0;
      const impressions = this.game.mockImpressions;
      let ctr = 1.8;
      if (impressions > 0) {
        ctr = (clicks / impressions) * 100 + 1.2;
      }
      this.dom.ctrVal.innerText = `${ctr.toFixed(1)}%`;
    }
  }

  playRewardedAd(durationSeconds = 5) {
    return new Promise(resolve => {
      if (!this.dom.rewardedAdModal) {
        resolve();
        return;
      }
      
      this.dom.rewardedAdModal.classList.add('show');
      let timeLeft = durationSeconds;
      this.dom.adCountdown.innerText = timeLeft;
      
      // Select advertiser
      const advertiser = this.adsCatalog[Math.floor(Math.random() * this.adsCatalog.length)];
      if (this.dom.adAdvertiserLogo) this.dom.adAdvertiserLogo.innerText = advertiser.icon;
      if (this.dom.adAdvertiserName) this.dom.adAdvertiserName.innerText = advertiser.title;
      if (this.dom.adAdvertiserDesc) this.dom.adAdvertiserDesc.innerText = advertiser.desc;
      
      // Reset transition
      this.dom.adProgressBar.style.transition = 'none';
      this.dom.adProgressBar.style.width = '0%';
      
      // Reflow
      setTimeout(() => {
        this.dom.adProgressBar.style.transition = `width ${durationSeconds}s linear`;
        this.dom.adProgressBar.style.width = '100%';
      }, 50);
      
      const interval = setInterval(() => {
        timeLeft--;
        this.dom.adCountdown.innerText = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(interval);
          this.dom.rewardedAdModal.classList.remove('show');
          this.dom.adProgressBar.style.transition = 'none';
          this.dom.adProgressBar.style.width = '0%';
          
          // Rewarded video view adds $0.15 mock revenue
          this.game.mockImpressions++;
          this.game.mockRewardedAdsWatched++;
          this.game.totalMockRevenue += 0.15;
          this.updateRevenueDashboard();
          
          resolve();
        }
      }, 1000);
    });
  }

  // --- Snake Interception Rescue Question Modal ---
  triggerSnakeRescueFlow(player, snakeOrLadder) {
    return new Promise((resolve) => {
      // Pick a random question
      const randomQuestion = QuestionBank[Math.floor(Math.random() * QuestionBank.length)];
      
      // Populate Modal Question Details
      this.dom.rescueCategory.innerText = randomQuestion.category;
      this.dom.rescueQuestion.innerText = randomQuestion.question;
      this.dom.rescueOptions.innerHTML = '';
      this.dom.rescueTriviaBox.classList.add('hidden');
      this.dom.rescueAdActions.classList.remove('hidden');
      
      // Show Modal
      this.dom.rescueModal.classList.add('show');
      
      // Construct options HTML
      const labels = ['A', 'B', 'C', 'D'];
      const optionButtons = [];
      randomQuestion.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'rescue-option-btn';
        btn.innerHTML = `<span class="rescue-option-label">${labels[idx]}</span> <span class="rescue-option-text">${opt}</span>`;
        btn.dataset.index = idx;
        this.dom.rescueOptions.appendChild(btn);
        optionButtons.push(btn);
      });

      // Handle speech voiceover for human players
      const optionsText = randomQuestion.options.map((o, i) => `${labels[i]}, ${o}`).join('. ');
      this.sound.speakText(`Hiss... Interception! Answer this question: ${randomQuestion.question}. Options are: ${optionsText}`);

      // Store resolve callback reference
      this.rescueResolveCallback = resolve;

      // Helper function to handle choice selection
      const selectChoice = (chosenIdx) => {
        // Stop speech
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        // Disable option buttons and ad buttons
        optionButtons.forEach(b => b.classList.add('disabled'));
        this.dom.adHintBtn.disabled = true;
        this.dom.adSkipBtn.disabled = true;
        
        const isCorrect = (parseInt(chosenIdx) === randomQuestion.correct);
        this.rescueIsCorrect = isCorrect;
        
        // Style selected buttons
        optionButtons.forEach(b => {
          const bIdx = parseInt(b.dataset.index);
          if (bIdx === randomQuestion.correct) {
            b.classList.add('correct');
          } else if (bIdx === parseInt(chosenIdx)) {
            b.classList.add('incorrect');
          }
        });
        
        // Hide ad action panel
        this.dom.rescueAdActions.classList.add('hidden');

        // Play feedback sound and speech synthesis dialog
        this.dom.rescueTriviaBox.className = `rescue-trivia-box ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`;
        if (isCorrect) {
          this.dom.rescueTriviaHeader.innerText = "EXCUSED! SAFE PASSAGE GRANTED.";
          this.sound.speakText("Yes, you are excused.");
        } else {
          this.dom.rescueTriviaHeader.innerText = "BITTEN! SLIDING DOWN...";
          this.sound.speakText("Sorry, you left me with no choice other than biting you.");
        }
        
        this.dom.rescueTriviaText.innerText = randomQuestion.trivia;
        this.dom.rescueTriviaBox.classList.remove('hidden');
      };

      // Set up selection handlers
      optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          selectChoice(btn.dataset.index);
        });
      });

      // Set up Ad Helper Button values
      this.dom.adHintBtn.disabled = false;
      this.dom.adSkipBtn.disabled = false;
      
      // Define Hint Callback
      this.rescueAdHintCallback = async () => {
        this.dom.adHintBtn.disabled = true;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        // Watch Ad
        await this.playRewardedAd(5);
        
        // Disable two wrong options
        const wrongIndices = [];
        randomQuestion.options.forEach((opt, idx) => {
          if (idx !== randomQuestion.correct) {
            wrongIndices.push(idx);
          }
        });
        
        // Pick two random wrong indices to disable
        const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
        const disabledIndices = shuffledWrong.slice(0, 2);
        
        disabledIndices.forEach(idx => {
          optionButtons[idx].classList.add('disabled');
          optionButtons[idx].style.pointerEvents = 'none';
        });
        
        this.showToast("50/50 hint applied! 2 wrong options removed.", 'info');
        this.sound.speakText(`Hiss... Choose from remaining options for: ${randomQuestion.question}`);
      };

      // Define Skip Callback
      this.rescueAdSkipCallback = async () => {
        this.dom.adSkipBtn.disabled = true;
        this.dom.adHintBtn.disabled = true;
        
        // Watch Ad
        await this.playRewardedAd(5);
        
        this.showToast("Bypass applied! Snake excused 🐍✨", 'ladder');
        selectChoice(randomQuestion.correct);
      };
    });
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'snake') icon = '🐍';
    if (type === 'ladder') icon = '✨';
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.dom.toastContainer.appendChild(toast);
    
    // Trigger slide-in reflow
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- Confetti Canvas Simulator ---
  startConfetti() {
    this.confettiActive = true;
    this.dom.confettiCanvas.width = window.innerWidth;
    this.dom.confettiCanvas.height = window.innerHeight;
    this.confettiParticles = [];
    
    const colors = ['#f8007f', '#00f2fe', '#39ff14', '#ffd700', '#7f00ff', '#ffffff'];
    for (let i = 0; i < 150; i++) {
      this.confettiParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        r: Math.random() * 6 + 4,
        d: Math.random() * window.innerHeight,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }
    
    this.animateConfetti();
  }

  animateConfetti() {
    if (!this.confettiActive) return;
    
    const ctx = this.dom.confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    this.confettiParticles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;
      
      // Loop wrapping
      if (p.y > window.innerHeight) {
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
      }
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    requestAnimationFrame(() => this.animateConfetti());
  }

  stopConfetti() {
    this.confettiActive = false;
    const ctx = this.dom.confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  // Helper delays
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Canvas Face Photo Cropper Modal methods ---
  openCropModal(file, onCropComplete) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.cropImg = img;
        this.cropCallback = onCropComplete;
        
        // Initial setup: center the image and set scale
        const diameter = 180;
        const scaleX = diameter / img.width;
        const scaleY = diameter / img.height;
        this.cropScale = Math.max(scaleX, scaleY, 0.2);
        
        this.cropX = 150 - (img.width * this.cropScale) / 2;
        this.cropY = 150 - (img.height * this.cropScale) / 2;
        
        this.dom.cropZoom.min = (Math.min(scaleX, scaleY) * 0.5).toFixed(2);
        this.dom.cropZoom.max = (Math.max(scaleX, scaleY) * 4.0).toFixed(2);
        this.dom.cropZoom.value = this.cropScale.toFixed(2);
        
        this.dom.cropModal.classList.add('show');
        this.drawCropCanvas();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  setupCropHandlers() {
    const canvas = this.dom.cropCanvas;
    const zoomSlider = this.dom.cropZoom;

    zoomSlider.addEventListener('input', () => {
      const oldScale = this.cropScale;
      this.cropScale = parseFloat(zoomSlider.value);
      
      // Zoom center on canvas is 150, 150
      const centerX = 150;
      const centerY = 150;
      this.cropX = centerX - ((centerX - this.cropX) * this.cropScale) / oldScale;
      this.cropY = centerY - ((centerY - this.cropY) * this.cropScale) / oldScale;
      
      this.drawCropCanvas();
    });

    canvas.addEventListener('mousedown', (e) => {
      if (!this.cropImg) return;
      this.isDraggingCrop = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDraggingCrop || !this.cropImg) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.cropX += dx;
      this.cropY += dy;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.drawCropCanvas();
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingCrop = false;
    });

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (!this.cropImg || e.touches.length === 0) return;
      this.isDraggingCrop = true;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', (e) => {
      if (!this.isDraggingCrop || !this.cropImg || e.touches.length === 0) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - this.dragStartX;
      const dy = e.touches[0].clientY - this.dragStartY;
      this.cropX += dx;
      this.cropY += dy;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
      this.drawCropCanvas();
    });

    canvas.addEventListener('touchend', () => {
      this.isDraggingCrop = false;
    });

    this.dom.cropSaveBtn.addEventListener('click', () => {
      if (this.cropCallback && this.cropImg) {
        // Draw cropped region to 120x120 canvas
        const resCanvas = document.createElement('canvas');
        resCanvas.width = 120;
        resCanvas.height = 120;
        const rCtx = resCanvas.getContext('2d');
        
        // Draw cropped area into circle mask
        rCtx.beginPath();
        rCtx.arc(60, 60, 60, 0, Math.PI * 2);
        rCtx.clip();
        
        const radiusOnCanvas = 90;
        const srcX = (150 - radiusOnCanvas - this.cropX) / this.cropScale;
        const srcY = (150 - radiusOnCanvas - this.cropY) / this.cropScale;
        const srcW = (radiusOnCanvas * 2) / this.cropScale;
        const srcH = (radiusOnCanvas * 2) / this.cropScale;
        
        rCtx.drawImage(this.cropImg, srcX, srcY, srcW, srcH, 0, 0, 120, 120);
        
        const dataUrl = resCanvas.toDataURL('image/png');
        this.cropCallback(dataUrl);
      }
      this.closeCropModal();
    });

    this.dom.cropCancelBtn.addEventListener('click', () => {
      this.closeCropModal();
    });
  }

  closeCropModal() {
    this.dom.cropModal.classList.remove('show');
    this.cropImg = null;
    this.cropCallback = null;
  }

  drawCropCanvas() {
    if (!this.cropImg) return;
    const canvas = this.dom.cropCanvas;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, 300, 300);
    
    // Draw raw image scaled/translated
    ctx.drawImage(
      this.cropImg,
      this.cropX,
      this.cropY,
      this.cropImg.width * this.cropScale,
      this.cropImg.height * this.cropScale
    );
    
    // Transparent cutout overlay
    ctx.fillStyle = 'rgba(8, 5, 22, 0.75)';
    ctx.beginPath();
    ctx.rect(0, 0, 300, 300);
    ctx.arc(150, 150, 90, 0, Math.PI * 2, true);
    ctx.fill();
    
    // Draw neon cyan border
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(150, 150, 90, 0, Math.PI * 2);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // --- Players Roster Card HUD methods ---
  renderHUDPlayersList() {
    const listEl = document.getElementById('hud-players-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.game.players.forEach((player, idx) => {
      const isCurrent = (this.game.activePlayerIndex === idx);
      const isImg = player.avatar && (player.avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i) || player.avatar.startsWith('data:image/'));

      const playerRow = document.createElement('div');
      playerRow.className = `hud-player-row ${isCurrent ? 'active' : ''}`;
      playerRow.style.color = player.color;
      playerRow.style.borderColor = player.color;
      playerRow.innerHTML = `
        <div class="hud-player-info">
          <div class="hud-player-avatar-circle" style="color: ${player.color}; box-shadow: 0 0 8px ${player.color}; ${isImg ? `background-image: url(${player.avatar});` : ''}">
            ${isImg ? '' : player.avatar}
          </div>
          <span class="hud-player-name">${player.name}</span>
          <span class="hud-player-position">Tile ${player.position}</span>
        </div>
        
        <!-- Color Selector -->
        <div class="hud-player-color-picker-wrapper">
          <button class="hud-color-trigger-btn" id="hud-color-trigger-${idx}" style="background-color: ${player.color}; box-shadow: 0 0 8px ${player.color};" title="Change Color"></button>
          <div class="hud-color-dropdown hidden" id="hud-color-dropdown-${idx}">
            ${this.colors.map(c => `<div class="hud-color-option" data-color="${c}" style="background-color: ${c};"></div>`).join('')}
          </div>
        </div>
      `;

      listEl.appendChild(playerRow);

      const triggerBtn = playerRow.querySelector(`#hud-color-trigger-${idx}`);
      const dropdown = playerRow.querySelector(`#hud-color-dropdown-${idx}`);

      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Hide all other dropdowns
        document.querySelectorAll('.hud-color-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.add('hidden');
        });
        dropdown.classList.toggle('hidden');
      });

      dropdown.querySelectorAll('.hud-color-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const newColor = opt.dataset.color;
          this.changePlayerColor(idx, newColor);
          dropdown.classList.add('hidden');
        });
      });
    });

    // Close on body click
    document.addEventListener('click', () => {
      document.querySelectorAll('.hud-color-dropdown').forEach(d => d.classList.add('hidden'));
    });
  }

  changePlayerColor(playerIndex, newColor) {
    const player = this.game.players[playerIndex];
    if (!player) return;

    player.color = newColor;

    // Update board token border and box-shadow color
    const token = document.getElementById(`token-${player.id}`);
    if (token) {
      token.style.color = newColor;
    }

    // Refresh UI components
    this.updateHUD();
    this.renderHUDPlayersList();
    this.updateTokensUI(false);

    // Sync to remote opponent over PeerJS
    if (this.isOnlineMode && this.conn && this.conn.open) {
      this.conn.send({
        type: 'CHANGE_COLOR',
        playerIndex: playerIndex,
        color: newColor
      });
    }
  }
}
