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
    
    // Binding DOM element references
    this.dom = {
      setupScreen: document.getElementById('setup-screen'),
      playScreen: document.getElementById('play-screen'),
      boardWrapper: document.getElementById('board-wrapper'),
      boardGrid: document.getElementById('board-grid'),
      boardSvg: document.getElementById('board-svg'),
      tokensContainer: document.getElementById('tokens-container'),
      
      // Setup controls
      playerCountBtns: document.querySelectorAll('.player-count-btn'),
      playerSetupList: document.getElementById('player-setup-list'),
      startGameBtn: document.getElementById('start-game-btn'),
      exactRollToggle: document.getElementById('exact-roll-toggle'),
      soundToggle: document.getElementById('sound-toggle'),
      
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
      rescueTriviaHeader: document.getElementById('rescue-trivia-header'),
      rescueTriviaText: document.getElementById('rescue-trivia-text'),
      rescueContinueBtn: document.getElementById('rescue-continue-btn'),

      // Rewarded Ad elements
      rewardedAdModal: document.getElementById('rewarded-ad-modal'),
      adCountdown: document.getElementById('ad-countdown'),
      adProgressBar: document.getElementById('ad-progress-bar'),
      adAdvertiserLogo: document.getElementById('ad-advertiser-logo'),
      adAdvertiserName: document.getElementById('ad-advertiser-name'),
      adAdvertiserDesc: document.getElementById('ad-advertiser-desc')
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

  init() {
    this.renderBoardCells();
    this.setupEventListeners();
    this.renderPlayerSetupList();
    this.drawSnakesAndLadders();
    this.startAdEcosystem(); // Start mock advertising platform
    
    // Wire game state triggers
    this.game.onStateChange = (game) => this.handleGameStateChange(game);
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
      
      // Add configure players to game
      this.game.reset();
      for (let i = 0; i < this.setupConfig.playerCount; i++) {
        const pConf = this.setupConfig.players[i];
        
        // Grab values from inputs if available
        const nameInput = document.getElementById(`setup-name-${i}`);
        const nameVal = nameInput ? nameInput.value.trim() : pConf.name;
        
        const botToggle = document.getElementById(`setup-bot-${i}`);
        const isBotVal = botToggle ? botToggle.checked : pConf.isBot;
        
        this.game.addPlayer(nameVal || `Player ${i+1}`, pConf.color, pConf.avatar, isBotVal);
      }
      
      this.game.startGame();
    });

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
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          this.setupConfig.players[index].avatar = base64Url;
          avatarBtn.innerHTML = this.renderAvatarHelper(base64Url);
          this.showToast(`Face photo uploaded for Player ${index+1}! 📷`, 'info');
        };
        reader.readAsDataURL(file);
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
    this.dom.boardSvg.innerHTML = '';
    
    // Create gradients and glow filters in SVG definition
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff007f" />
        <stop offset="100%" stop-color="#7f00ff" />
      </linearGradient>
      <linearGradient id="ladderGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#00f2fe" />
        <stop offset="100%" stop-color="#39ff14" />
      </linearGradient>
      
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
    `;
    this.dom.boardSvg.appendChild(defs);

    // Draw Ladders (Straight rails with crossbars)
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
      
      const w = 1.3; // Half width of ladder
      
      // Left Rail
      const railL = document.createElementNS("http://www.w3.org/2000/svg", "line");
      railL.setAttribute("x1", p0.x + w * nx);
      railL.setAttribute("y1", p0.y + w * ny);
      railL.setAttribute("x2", p1.x + w * nx);
      railL.setAttribute("y2", p1.y + w * ny);
      railL.setAttribute("class", "svg-ladder-rail");
      railL.setAttribute("stroke", "url(#ladderGrad)");
      railL.setAttribute("stroke-width", "0.8");
      railL.setAttribute("filter", "url(#glowCyan)");
      this.dom.boardSvg.appendChild(railL);
      
      // Right Rail
      const railR = document.createElementNS("http://www.w3.org/2000/svg", "line");
      railR.setAttribute("x1", p0.x - w * nx);
      railR.setAttribute("y1", p0.y - w * ny);
      railR.setAttribute("x2", p1.x - w * nx);
      railR.setAttribute("y2", p1.y - w * ny);
      railR.setAttribute("class", "svg-ladder-rail");
      railR.setAttribute("stroke", "url(#ladderGrad)");
      railR.setAttribute("stroke-width", "0.8");
      railR.setAttribute("filter", "url(#glowCyan)");
      this.dom.boardSvg.appendChild(railR);
      
      // Rungs
      const numRungs = Math.max(3, Math.floor(dist / 5.5));
      for (let i = 1; i < numRungs; i++) {
        const t = i / numRungs;
        
        const rx0 = p0.x + t * dx + w * nx;
        const ry0 = p0.y + t * dy + w * ny;
        const rx1 = p0.x + t * dx - w * nx;
        const ry1 = p0.y + t * dy - w * ny;
        
        const rung = document.createElementNS("http://www.w3.org/2000/svg", "line");
        rung.setAttribute("x1", rx0);
        rung.setAttribute("y1", ry0);
        rung.setAttribute("x2", rx1);
        rung.setAttribute("y2", ry1);
        rung.setAttribute("class", "svg-ladder-rung");
        rung.setAttribute("stroke", "rgba(255, 255, 255, 0.7)");
        rung.setAttribute("stroke-width", "0.6");
        this.dom.boardSvg.appendChild(rung);
      }
    }

    // Draw Snakes (Curved wavy body with scaly overlays, viper head, and flickering tongue)
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

      // 1. Snake Body path (Thick gradient base)
      const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
      body.setAttribute("d", pathData);
      body.setAttribute("class", "svg-snake-body");
      body.setAttribute("stroke", "url(#snakeGrad)");
      body.setAttribute("stroke-width", "2.2");
      body.setAttribute("filter", "url(#glowRed)");
      this.dom.boardSvg.appendChild(body);

      // 2. Snake Scales Overlay (Dashed white/pink line for diamond texture)
      const scales = document.createElementNS("http://www.w3.org/2000/svg", "path");
      scales.setAttribute("d", pathData);
      scales.setAttribute("class", "svg-snake-scales");
      scales.setAttribute("stroke", "rgba(255, 255, 255, 0.4)");
      scales.setAttribute("stroke-width", "1.4");
      this.dom.boardSvg.appendChild(scales);

      // --- Viper Head Math ---
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

      // 3. Draw Viper Head
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

      // 4. Draw Forked Tongue with CSS Origin flicker animation
      const tongue = document.createElementNS("http://www.w3.org/2000/svg", "path");
      tongue.setAttribute("d", `M ${tx} ${ty} L ${sx} ${sy} L ${ltx} ${lty} M ${sx} ${sy} L ${rtx} ${rty}`);
      tongue.setAttribute("class", "svg-snake-tongue");
      tongue.setAttribute("style", `transform-origin: ${tx}% ${ty}%;`);
      this.dom.boardSvg.appendChild(tongue);

      // --- Eye Placements ---
      const ex1 = p0.x + 0.85 * fx + 0.58 * jx;
      const ey1 = p0.y + 0.85 * fy + 0.58 * jy;
      const ex2 = p0.x + 0.85 * fx - 0.58 * jx;
      const ey2 = p0.y + 0.85 * fy - 0.58 * jy;
      
      const eye1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eye1.setAttribute("cx", ex1);
      eye1.setAttribute("cy", ey1);
      eye1.setAttribute("r", "0.32");
      eye1.setAttribute("fill", "#ffff00"); // Glowing yellow eyes
      this.dom.boardSvg.appendChild(eye1);
      
      const eye2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eye2.setAttribute("cx", ex2);
      eye2.setAttribute("cy", ey2);
      eye2.setAttribute("r", "0.32");
      eye2.setAttribute("fill", "#ffff00");
      this.dom.boardSvg.appendChild(eye2);

      // 5. Overlay Face Image if face[X].png exists in root
      const faceUrl = `face${snakeIdx}.png`;
      const clipPathId = `face-clip-${start}`;
      
      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.setAttribute("id", clipPathId);
      const clipCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      clipCircle.setAttribute("cx", p0.x);
      clipCircle.setAttribute("cy", p0.y);
      clipCircle.setAttribute("r", "1.95");
      clipPath.appendChild(clipCircle);
      defs.appendChild(clipPath);
      
      const faceImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
      faceImage.setAttribute("href", faceUrl);
      faceImage.setAttribute("x", p0.x - 2.1);
      faceImage.setAttribute("y", p0.y - 2.1);
      faceImage.setAttribute("width", "4.2");
      faceImage.setAttribute("height", "4.2");
      faceImage.setAttribute("clip-path", `url(#${clipPathId})`);
      faceImage.setAttribute("transform", `rotate(${angleDeg + 90}, ${p0.x}, ${p0.y})`);
      faceImage.setAttribute("style", "opacity: 0; transition: opacity 0.3s;");
      
      // If user provided a face photo, show the photo and style the snake head as border
      faceImage.addEventListener('load', () => {
        faceImage.setAttribute("style", "opacity: 1;");
        eye1.setAttribute("style", "display: none;");
        eye2.setAttribute("style", "display: none;");
        head.setAttribute("style", "fill: rgba(0,0,0,0.5); stroke: var(--neon-magenta); stroke-width: 0.35;");
      });
      
      this.dom.boardSvg.appendChild(faceImage);
    }
  }

  handleGameStateChange(game) {
    if (game.gameState === 'setup') {
      this.dom.setupScreen.classList.remove('hidden');
      this.dom.playScreen.classList.add('hidden');
      this.dom.tokensContainer.innerHTML = '';
      this.dom.historyLog.innerHTML = '';
      this.sound.stopMusic();
    } else if (game.gameState === 'playing' || game.gameState === 'finished') {
      this.dom.setupScreen.classList.add('hidden');
      this.dom.playScreen.classList.remove('hidden');
      
      // Create tokens if not exists
      if (this.dom.tokensContainer.childElementCount === 0) {
        this.initializeTokens(game.players);
      }
      
      this.updateHUD();
      this.updateHistory(game.history);
      
      if (game.gameState === 'finished') {
        this.handleGameFinished(game.winner);
        this.sound.stopMusic();
      } else {
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
      
      token.innerHTML = `
        <div class="walking-character" id="char-${p.id}" style="color: ${p.color}">
          <div class="char-head" style="color: ${p.color}; ${isImg ? `background-image: url(${p.avatar});` : ''}">
            ${isImg ? '' : p.avatar}
          </div>
          <div class="char-body" style="color: ${p.color}"></div>
          <div class="char-legs" style="color: ${p.color}">
            <div class="char-leg left" style="color: ${p.color}"></div>
            <div class="char-leg right" style="color: ${p.color}"></div>
          </div>
        </div>
      `;
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
    const curPlayer = this.game.getCurrentPlayer();
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
    
    if (curPlayer.isBot) {
      this.dom.currentPlayerStatus.innerHTML = `🤖 Thinking...`;
      this.dom.rollBtn.disabled = true;
      this.dom.rollBtn.innerText = "Robot Rolling...";
    } else {
      this.dom.currentPlayerStatus.innerHTML = `Your Turn! Click Dice to Roll`;
      this.dom.rollBtn.disabled = false;
      this.dom.rollBtn.innerText = "Roll Dice";
    }
    
    // Highlight Active Player's target cell briefly
    document.querySelectorAll('.board-cell').forEach(c => c.style.boxShadow = '');
    const activeCell = document.getElementById(`cell-${curPlayer.position}`);
    if (activeCell) {
      activeCell.style.boxShadow = `inset 0 0 12px ${curPlayer.color}50, 0 0 10px ${curPlayer.color}30`;
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

    this.rollAndExecute();
  }

  async rollAndExecute() {
    this.isAnimating = true;
    this.dom.rollBtn.disabled = true;

    // Trigger Dice Shake audio and CSS spin animation
    this.sound.playDiceShake();
    this.dom.diceCube.classList.add('rolling');
    
    // We fetch the result before animation completes to target the rotation face
    const result = await this.game.playTurn();
    const roll = result.roll;
    
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
      this.updateHUD();
      this.checkBotTurn();
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
        
        if (player.isBot) {
          // Bots resolve in the background without showing any modal
          escaped = Math.random() < 0.35; // 35% chance of bot escaping
          if (escaped) {
            this.showToast(`🤖 Clever! Bot ${player.name} answered correctly in background and escaped!`, 'ladder');
          }
        } else {
          // Human player gets the interactive question modal
          escaped = await this.triggerSnakeRescueFlow(player, snakeOrLadder);
        }
        
        // Let game engine resolve state
        this.game.resolveSnakeRescue(escaped);
        
        if (!escaped) {
          // If bit, play sound and slide down to the tail
          this.sound.playSnakeBite();
          this.showToast(`Bitten! ${player.name} slid down to ${finalPosition}! 🐍`, 'snake');
          
          if (charEl) charEl.classList.add('walking');
          player.position = finalPosition;
          this.updateTokensUI(true);
          await this.wait(800);
          if (charEl) charEl.classList.remove('walking');
        }
      }
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
    if (winner.avatar && winner.avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      this.dom.winnerAvatar.innerHTML = `<img src="${winner.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
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
}
