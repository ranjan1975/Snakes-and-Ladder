/**
 * UI Controller for Interactive Neural Network Classifier
 */

class NeuralNetworkUI {
  constructor() {
    this.points = [];
    this.network = null;
    this.isTraining = false;
    this.epochCount = 0;
    this.lossHistory = [];
    this.currentPreset = 'xor';
    this.activeClass = 0; // 0 for Class A (Cyan), 1 for Class B (Rose)
    
    // Audio State
    this.audioCtx = null;
    this.audioOsc = null;
    this.audioGain = null;
    this.soundEnabled = false;

    // Walkthrough State
    this.walkthroughActive = false;
    this.walkthroughPhase = 0;
    this.walkthroughData = null;
    this.walkthroughPoint = null;
    this.nodeCoords = [];

    // Default Configuration
    this.config = {
      learningRate: 0.03,
      activation: 'tanh',
      hiddenLayers: [4, 2] // Default: Input(2) -> Hidden(4) -> Hidden(2) -> Output(1)
    };

    // Binding DOM Elements
    this.dom = {
      canvas: document.getElementById('dataset-canvas'),
      svg: document.getElementById('network-svg'),
      lossCanvas: document.getElementById('loss-canvas'),
      
      // Control items
      btnTrain: document.getElementById('btn-train'),
      btnStep: document.getElementById('btn-step'),
      btnReset: document.getElementById('btn-reset'),
      btnSoundToggle: document.getElementById('sound-toggle'),
      
      selectActivation: document.getElementById('select-activation'),
      sliderLr: document.getElementById('slider-lr'),
      valLr: document.getElementById('val-lr'),
      
      layersList: document.getElementById('layers-list'),
      btnAddLayer: document.getElementById('btn-add-layer'),
      
      // HUD
      valEpochs: document.getElementById('val-epochs'),
      valLoss: document.getElementById('val-loss'),
      
      // Class Pickers
      btnClassA: document.getElementById('btn-class-a'),
      btnClassB: document.getElementById('btn-class-b'),
      btnRandomize: document.getElementById('btn-randomize'),
      btnClearPoints: document.getElementById('btn-clear-points'),

      // Walkthrough Controls
      btnWalkthroughToggle: document.getElementById('btn-walkthrough-toggle'),
      mathWalkthroughCard: document.getElementById('math-walkthrough-card'),
      walkthroughPhaseLabel: document.getElementById('walkthrough-phase-label'),
      walkthroughText: document.getElementById('walkthrough-text'),
      btnWtPrev: document.getElementById('btn-wt-prev'),
      btnWtNext: document.getElementById('btn-wt-next')
    };

    this.ctx = this.dom.canvas.getContext('2d');
    this.lossCtx = this.dom.lossCanvas.getContext('2d');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupNetwork();
    this.loadPreset('xor');
    this.resizeCanvas();
    this.draw();
  }

  setupEventListeners() {
    // Canvas Click (Add training point)
    this.dom.canvas.addEventListener('mousedown', (e) => {
      const rect = this.dom.canvas.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      
      // Map pixel coordinates to range [-1, 1]
      const x = (rawX / rect.width) * 2 - 1;
      const y = (1 - (rawY / rect.height)) * 2 - 1; // Invert Y axis
      
      this.points.push({ x, y, label: this.activeClass });
      this.currentPreset = 'custom';
      this.clearPresetButtons();
      
      this.draw();
      this.updateLossDisplay();
    });

    // Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPreset(btn.dataset.preset);
      });
    });

    // Class Pickers
    this.dom.btnClassA.addEventListener('click', () => {
      this.dom.btnClassB.classList.remove('active');
      this.dom.btnClassA.classList.add('active');
      this.activeClass = 0;
    });

    this.dom.btnClassB.addEventListener('click', () => {
      this.dom.btnClassA.classList.remove('active');
      this.dom.btnClassB.classList.add('active');
      this.activeClass = 1;
    });

    // Core Controls
    this.dom.btnTrain.addEventListener('click', () => this.toggleTraining());
    this.dom.btnStep.addEventListener('click', () => this.singleStepTrain());
    this.dom.btnReset.addEventListener('click', () => this.resetTraining());
    this.dom.btnClearPoints.addEventListener('click', () => {
      this.points = [];
      this.resetTraining();
    });
    this.dom.btnRandomize.addEventListener('click', () => this.loadPreset(this.currentPreset));

    // Activation Dropdown
    this.dom.selectActivation.addEventListener('change', (e) => {
      this.config.activation = e.target.value;
      this.setupNetwork();
    });

    // Learning Rate Slider
    this.dom.sliderLr.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.config.learningRate = val;
      this.dom.valLr.innerText = val.toFixed(3);
    });

    // Add Hidden Layer
    this.dom.btnAddLayer.addEventListener('click', () => {
      if (this.config.hiddenLayers.length >= 3) return; // Limit to 3 hidden layers
      this.config.hiddenLayers.push(4); // Default to 4 nodes
      this.setupNetwork();
      this.renderLayersHUD();
    });

    // Sound Toggle
    this.dom.btnSoundToggle.addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
      if (this.soundEnabled) {
        this.initAudio();
      } else {
        this.stopAudio();
      }
    });

    // Walkthrough Controls
    this.dom.btnWalkthroughToggle.addEventListener('click', () => this.toggleWalkthrough());
    this.dom.btnWtPrev.addEventListener('click', () => {
      if (this.walkthroughPhase > 1) {
        this.walkthroughPhase--;
        this.renderWalkthroughPhase();
      }
    });
    this.dom.btnWtNext.addEventListener('click', () => {
      if (this.walkthroughPhase === 0) {
        this.startWalkthroughTrace();
      } else if (this.walkthroughPhase === 4) {
        this.finishWalkthrough();
      } else {
        this.walkthroughPhase++;
        this.renderWalkthroughPhase();
      }
    });

    this.renderLayersHUD();
  }

  resizeCanvas() {
    // Set internal canvas pixels
    this.dom.canvas.width = 400;
    this.dom.canvas.height = 400;
    this.dom.lossCanvas.width = 300;
    this.dom.lossCanvas.height = 80;
  }

  setupNetwork() {
    const layerSizes = [2, ...this.config.hiddenLayers, 1]; // 2 inputs (X, Y), 1 output
    this.network = new NeuralNetwork(layerSizes, this.config.activation);
    this.resetTrainingStats();
    this.drawNetworkSVG();
    this.draw();
  }

  resetTrainingStats() {
    this.epochCount = 0;
    this.lossHistory = [];
    this.updateLossDisplay(0);
    this.drawLossGraph();
  }

  resetTraining() {
    this.isTraining = false;
    this.dom.btnTrain.innerText = "Train Model ▶";
    this.dom.btnTrain.classList.remove('btn-danger');
    this.stopAudio();
    this.setupNetwork();
  }

  clearPresetButtons() {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  }

  /**
   * Presets Generator
   */
  loadPreset(presetName) {
    this.currentPreset = presetName;
    this.points = [];
    
    const count = 70;
    if (presetName === 'linear') {
      // Gaussian Linear groups
      for (let i = 0; i < count; i++) {
        const isClassB = Math.random() > 0.5;
        const offset = 0.2 + Math.random() * 0.5;
        const angle = Math.random() * Math.PI * 2;
        
        let x, y;
        if (isClassB) {
          x = 0.35 + Math.random() * 0.5 - 0.25;
          y = -0.35 + Math.random() * 0.5 - 0.25;
          this.points.push({ x, y, label: 1 });
        } else {
          x = -0.35 + Math.random() * 0.5 - 0.25;
          y = 0.35 + Math.random() * 0.5 - 0.25;
          this.points.push({ x, y, label: 0 });
        }
      }
    } else if (presetName === 'circle') {
      // Points inside radius 0.55 vs outside
      for (let i = 0; i < count; i++) {
        const r = Math.random() * 0.95;
        const theta = Math.random() * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        
        if (r < 0.55) {
          this.points.push({ x, y, label: 0 });
        } else if (r > 0.65) {
          this.points.push({ x, y, label: 1 });
        }
      }
    } else if (presetName === 'xor') {
      // Four quadrants XOR
      for (let i = 0; i < count; i++) {
        const x = (Math.random() * 2 - 1) * 0.9;
        const y = (Math.random() * 2 - 1) * 0.9;
        
        // Add a padding gap to keep it clean
        if (Math.abs(x) < 0.08 || Math.abs(y) < 0.08) continue;
        
        const label = (x * y > 0) ? 0 : 1;
        this.points.push({ x, y, label });
      }
    }
    
    this.resetTraining();
  }

  renderLayersHUD() {
    this.dom.layersList.innerHTML = '';
    
    this.config.hiddenLayers.forEach((layerSize, idx) => {
      const row = document.createElement('div');
      row.className = 'layer-setup-row';
      row.innerHTML = `
        <span style="font-size:0.85rem; font-weight:600; color:white">Hidden Layer ${idx + 1}</span>
        <div style="display:flex; align-items:center; gap:10px">
          <span style="font-family:'Orbitron', sans-serif; font-size:0.85rem; color:var(--neon-cyan)">${layerSize} nodes</span>
          <div class="layer-btn-group">
            <button class="mini-btn" id="node-dec-${idx}">-</button>
            <button class="mini-btn" id="node-inc-${idx}">+</button>
          </div>
          <button class="btn btn-danger" id="layer-del-${idx}" style="padding: 4px 8px; font-size: 0.75rem; border-radius:4px;">Del</button>
        </div>
      `;
      this.dom.layersList.appendChild(row);
      
      // Node count controls
      document.getElementById(`node-dec-${idx}`).addEventListener('click', () => {
        if (this.config.hiddenLayers[idx] <= 1) return;
        this.config.hiddenLayers[idx]--;
        this.setupNetwork();
        this.renderLayersHUD();
      });

      document.getElementById(`node-inc-${idx}`).addEventListener('click', () => {
        if (this.config.hiddenLayers[idx] >= 8) return; // Limit to 8 nodes per layer
        this.config.hiddenLayers[idx]++;
        this.setupNetwork();
        this.renderLayersHUD();
      });

      // Delete Layer
      document.getElementById(`layer-del-${idx}`).addEventListener('click', () => {
        this.config.hiddenLayers.splice(idx, 1);
        this.setupNetwork();
        this.renderLayersHUD();
      });
    });
  }

  drawNetworkSVG() {
    const svg = this.dom.svg;
    svg.innerHTML = '';
    
    const sizes = this.network.layerSizes;
    const width = svg.clientWidth || 350;
    const height = svg.clientHeight || 260;
    
    const layerCount = sizes.length;
    const layerSpacing = width / (layerCount + 0.3);
    
    // Store coordinates for link line nodes
    const nodeCoords = [];
    
    // Compute node coordinates
    for (let l = 0; l < layerCount; l++) {
      const layerSize = sizes[l];
      const layerX = layerSpacing * (l + 0.65);
      
      const layerNodes = [];
      const nodeSpacing = height / (layerSize + 1);
      
      for (let n = 0; n < layerSize; n++) {
        const nodeY = nodeSpacing * (n + 1);
        layerNodes.push({ x: layerX, y: nodeY });
      }
      nodeCoords.push(layerNodes);
    }
    
    this.nodeCoords = nodeCoords; // Save coordinates for walkthrough overlays

    // 1. Draw connecting lines (Weights)
    const weights = this.network.weights;
    for (let l = 0; l < weights.length; l++) {
      const W = weights[l];
      const prevNodes = nodeCoords[l];
      const currNodes = nodeCoords[l + 1];
      
      for (let row = 0; row < W.length; row++) {
        for (let col = 0; col < W[row].length; col++) {
          const wVal = W[row][col];
          const pNode = prevNodes[col];
          const cNode = currNodes[row];
          
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", pNode.x);
          line.setAttribute("y1", pNode.y);
          line.setAttribute("x2", cNode.x);
          line.setAttribute("y2", cNode.y);
          line.setAttribute("class", "weight-line");
          line.setAttribute("id", `link-${l}-${row}-${col}`);
          
          // Color based on weight sign (Cyan for positive, Rose for negative)
          const strokeColor = wVal > 0 ? 'rgba(0, 242, 254,' : 'rgba(255, 0, 127,';
          const opacity = Math.min(1.0, Math.max(0.08, Math.abs(wVal) * 0.75));
          line.setAttribute("stroke", `${strokeColor} ${opacity})`);
          
          // Thickness based on weight size
          const thickness = Math.min(5, Math.max(0.6, Math.abs(wVal) * 2.5));
          line.setAttribute("stroke-width", thickness);
          
          svg.appendChild(line);
        }
      }
    }

    // 2. Draw Nodes (Circles)
    for (let l = 0; l < layerCount; l++) {
      const nodes = nodeCoords[l];
      nodes.forEach((node, idx) => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        // Node circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", "9");
        circle.setAttribute("class", "node-circle");
        circle.setAttribute("id", `node-${l}-${idx}`);
        
        // Dynamic coloring of nodes based on inputs or biases
        let fillColor = 'rgba(18, 14, 43, 0.9)';
        let strokeColor = 'rgba(255,255,255,0.4)';
        
        if (l === 0) {
          strokeColor = idx === 0 ? 'var(--neon-cyan)' : 'var(--neon-rose)';
        } else if (l === layerCount - 1) {
          strokeColor = 'var(--neon-yellow)';
        }
        
        circle.setAttribute("fill", fillColor);
        circle.setAttribute("stroke", strokeColor);
        circle.setAttribute("stroke-width", "2");
        group.appendChild(circle);
        
        svg.appendChild(group);
      });
    }

    // Overlay Math values if walkthrough is active
    if (this.walkthroughActive && this.walkthroughData) {
      this.drawWalkthroughMathOverlays();
    }
  }

  drawDecisionBoundary() {
    const width = this.dom.canvas.width;
    const height = this.dom.canvas.height;
    
    // Clear canvas
    this.ctx.fillStyle = '#090615';
    this.ctx.fillRect(0, 0, width, height);
    
    // Evaluate neural network on a 2D mesh grid
    const resolution = 45; // Grid dimensions (45x45 calculations)
    const cellW = width / resolution;
    const cellH = height / resolution;
    
    for (let i = 0; i < resolution; i++) {
      const px = (i + 0.5) * cellW;
      const x = (px / width) * 2 - 1; // Map to [-1, 1]
      
      for (let j = 0; j < resolution; j++) {
        const py = (j + 0.5) * cellH;
        const y = (1 - (py / height)) * 2 - 1; // Map to [-1, 1] (inverted Y axis)
        
        // Evaluate Network
        const out = this.network.forward([x, y]).output[0];
        
        // Interpolate background color
        // If output close to 0 -> Class A (Cyan), if close to 1 -> Class B (Rose)
        // Draw with fading opacity depending on the score distance from center
        let colorString;
        if (out < 0.5) {
          const confidence = (0.5 - out) * 2.0; // 0 to 1
          colorString = `rgba(0, 242, 254, ${confidence * 0.28})`;
        } else {
          const confidence = (out - 0.5) * 2.0; // 0 to 1
          colorString = `rgba(255, 0, 127, ${confidence * 0.28})`;
        }
        
        this.ctx.fillStyle = colorString;
        this.ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  }

  drawPoints() {
    const width = this.dom.canvas.width;
    const height = this.dom.canvas.height;
    
    // Draw walkthrough point selection highlight ring
    if (this.walkthroughActive && this.walkthroughPoint) {
      const cx = (this.walkthroughPoint.x + 1) * 0.5 * width;
      const cy = (1 - (this.walkthroughPoint.y + 1) * 0.5) * height;
      
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#39ff14';
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#39ff14';
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
    
    this.points.forEach(p => {
      // Map [-1, 1] coordinates to canvas coordinates
      const cx = (p.x + 1) * 0.5 * width;
      const cy = (1 - (p.y + 1) * 0.5) * height; // Invert Y
      
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      
      if (p.label === 0) {
        this.ctx.fillStyle = '#00f2fe';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.shadowColor = '#00f2fe';
      } else {
        this.ctx.fillStyle = '#ff007f';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.shadowColor = '#ff007f';
      }
      
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.stroke();
      
      // Clear shadow properties immediately
      this.ctx.shadowBlur = 0;
    });
  }

  draw() {
    this.drawDecisionBoundary();
    this.drawPoints();
  }

  toggleTraining() {
    this.isTraining = !this.isTraining;
    if (this.isTraining) {
      this.dom.btnTrain.innerText = "Pause Model ⏸";
      this.dom.btnTrain.classList.add('btn-danger');
      if (this.soundEnabled) {
        this.initAudio();
      }
      this.trainLoop();
    } else {
      this.dom.btnTrain.innerText = "Train Model ▶";
      this.dom.btnTrain.classList.remove('btn-danger');
      this.stopAudio();
    }
  }

  singleStepTrain() {
    if (this.points.length === 0) return;
    this.trainBatch();
    this.draw();
    this.drawNetworkSVG();
  }

  trainLoop() {
    if (!this.isTraining) return;
    
    if (this.points.length > 0) {
      // Perform 10 iterations per animation frame for visual speed
      for (let i = 0; i < 10; i++) {
        this.trainBatch();
      }
    }
    
    this.draw();
    this.drawNetworkSVG();
    
    requestAnimationFrame(() => this.trainLoop());
  }

  trainBatch() {
    let totalLoss = 0.0;
    
    // Stochastic / Mini-batch training
    // Shuffle training points for stochastic convergence
    const shuffled = [...this.points].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => {
      const loss = this.network.backward([p.x, p.y], p.label, this.config.learningRate);
      totalLoss += loss;
    });
    
    this.epochCount++;
    const avgLoss = this.points.length > 0 ? (totalLoss / this.points.length) : 0;
    
    // Add to history log
    this.lossHistory.push(avgLoss);
    if (this.lossHistory.length > 150) {
      this.lossHistory.shift();
    }
    
    this.updateLossDisplay(avgLoss);
    this.drawLossGraph();
    this.updateAudioFrequency(avgLoss);
  }

  updateLossDisplay(loss = null) {
    this.dom.valEpochs.innerText = this.epochCount;
    if (loss === null) {
      this.dom.valLoss.innerText = "0.0000";
    } else {
      this.dom.valLoss.innerText = loss.toFixed(5);
    }
  }

  drawLossGraph() {
    const w = this.dom.lossCanvas.width;
    const h = this.dom.lossCanvas.height;
    
    this.lossCtx.clearRect(0, 0, w, h);
    
    // Draw background grid lines
    this.lossCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.lossCtx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      this.lossCtx.beginPath();
      this.lossCtx.moveTo(0, y);
      this.lossCtx.lineTo(w, y);
      this.lossCtx.stroke();
    }
    
    if (this.lossHistory.length < 2) return;
    
    // Plot historical values
    this.lossCtx.beginPath();
    this.lossCtx.lineWidth = 2;
    this.lossCtx.strokeStyle = '#00f2fe';
    
    // Max loss value to scale vertically (default to 0.5, since sigmoid binary loss capped at 0.5 max)
    const maxVal = 0.5;
    
    const count = this.lossHistory.length;
    this.lossCtx.moveTo(0, h - (this.lossHistory[0] / maxVal) * h);
    
    for (let i = 1; i < count; i++) {
      const x = (i / (count - 1)) * w;
      const y = h - (this.lossHistory[i] / maxVal) * h;
      this.lossCtx.lineTo(x, y);
    }
    
    this.lossCtx.stroke();
  }

  // --- Sound Synthesizer Training Hook ---
  initAudio() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      
      if (!this.audioOsc) {
        this.audioOsc = this.audioCtx.createOscillator();
        this.audioGain = this.audioCtx.createGain();
        const lowpass = this.audioCtx.createBiquadFilter();
        
        this.audioOsc.type = 'triangle';
        this.audioOsc.frequency.value = 220; // Default frequency
        
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 450;
        
        this.audioGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.audioGain.gain.linearRampToValueAtTime(0.02, this.audioCtx.currentTime + 0.1); // Keep it very quiet
        
        this.audioOsc.connect(lowpass);
        lowpass.connect(this.audioGain);
        this.audioGain.connect(this.audioCtx.destination);
        
        this.audioOsc.start(0);
      }
    } catch (e) {
      console.warn("AudioContext failed to start:", e);
    }
  }

  updateAudioFrequency(loss) {
    if (!this.audioOsc || !this.audioGain) return;
    
    // Map loss from [0, 0.5] to frequency [110Hz, 320Hz]
    // As loss gets smaller, pitch gets lower and volume becomes a subtle deep hum
    const freq = 100 + (loss * 400); // 0 loss = 100Hz, 0.5 loss = 300Hz
    this.audioOsc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.05);
    
    // Modulate volume slightly based on training: quieter when loss is low
    const targetGain = Math.max(0.003, Math.min(0.015, loss * 0.03));
    this.audioGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.05);
  }

  stopAudio() {
    if (this.audioOsc) {
      try {
        this.audioGain.gain.setValueAtTime(this.audioGain.gain.value, this.audioCtx.currentTime);
        this.audioGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.1);
        
        const osc = this.audioOsc;
        this.audioOsc = null;
        this.audioGain = null;
        
        setTimeout(() => {
          osc.stop();
          osc.disconnect();
        }, 150);
      } catch (e) {
        this.audioOsc = null;
      }
    }
  }

  // --- Visual Math Debugger Flow Methods ---
  toggleWalkthrough() {
    this.walkthroughActive = !this.walkthroughActive;
    
    if (this.walkthroughActive) {
      // Pause normal training
      this.isTraining = false;
      this.dom.btnTrain.innerText = "Train Model ▶";
      this.dom.btnTrain.classList.remove('btn-danger');
      this.stopAudio();
      
      // Disable normal training controls
      this.dom.btnTrain.disabled = true;
      this.dom.btnStep.disabled = true;
      this.dom.btnReset.disabled = true;
      
      // Setup initial visual debugger HUD
      this.walkthroughPhase = 0;
      this.walkthroughData = null;
      this.walkthroughPoint = null;
      
      this.dom.mathWalkthroughCard.classList.remove('hidden');
      this.dom.btnWalkthroughToggle.innerText = "Exit Math Flow 🧪";
      this.dom.btnWalkthroughToggle.style.background = 'rgba(255, 0, 127, 0.2)';
      this.dom.btnWalkthroughToggle.style.borderColor = 'var(--neon-rose)';
      this.dom.btnWalkthroughToggle.style.boxShadow = 'none';
      
      this.dom.walkthroughPhaseLabel.innerText = "Trace Setup";
      this.dom.walkthroughText.innerHTML = `Click <strong>"Start Trace"</strong> below to select a random training point and visually inspect how the feedforward and backpropagation equations run.`;
      
      this.dom.btnWtPrev.disabled = true;
      this.dom.btnWtNext.disabled = false;
      this.dom.btnWtNext.innerText = "Start Trace ➔";
    } else {
      // Exit walkthrough mode
      this.dom.mathWalkthroughCard.classList.add('hidden');
      this.dom.btnWalkthroughToggle.innerText = "Visual Math Flow 🧪";
      this.dom.btnWalkthroughToggle.style.background = 'linear-gradient(135deg, #7f00ff 0%, #ff007f 100%)';
      this.dom.btnWalkthroughToggle.style.borderColor = '';
      this.dom.btnWalkthroughToggle.style.boxShadow = '';
      
      // Re-enable normal training controls
      this.dom.btnTrain.disabled = false;
      this.dom.btnStep.disabled = false;
      this.dom.btnReset.disabled = false;
      
      // Clear indicators
      this.walkthroughPoint = null;
      this.walkthroughData = null;
      
      // Clear pulses & overlays
      document.querySelectorAll('.pulse-circle').forEach(p => p.remove());
      this.drawNetworkSVG();
      this.draw();
    }
  }

  startWalkthroughTrace() {
    // If there are no points, load the XOR preset
    if (this.points.length === 0) {
      this.loadPreset('xor');
    }
    
    // Select a random point
    const idx = Math.floor(Math.random() * this.points.length);
    this.walkthroughPoint = this.points[idx];
    
    // Evaluate trace data from network logic
    this.walkthroughData = this.network.getDetailedStepData(
      [this.walkthroughPoint.x, this.walkthroughPoint.y],
      this.walkthroughPoint.label
    );
    
    this.walkthroughPhase = 1;
    this.dom.btnWtPrev.disabled = false;
    this.dom.btnWtNext.innerText = "Next Step ➔";
    
    this.renderWalkthroughPhase();
  }

  finishWalkthrough() {
    this.walkthroughPhase = 0;
    this.walkthroughData = null;
    this.walkthroughPoint = null;
    
    this.dom.btnWtPrev.disabled = true;
    this.dom.btnWtNext.innerText = "Start Trace ➔";
    this.dom.walkthroughPhaseLabel.innerText = "Trace Setup";
    this.dom.walkthroughText.innerHTML = `Trace completed successfully! Click <strong>"Start Trace"</strong> to pick another training sample, or exit walkthrough mode to resume normal training.`;
    
    // Clear pulses & highlights
    document.querySelectorAll('.pulse-circle').forEach(p => p.remove());
    this.drawNetworkSVG();
    this.draw();
  }

  renderWalkthroughPhase() {
    // Clear any previous pulses
    document.querySelectorAll('.pulse-circle').forEach(p => p.remove());
    
    // Reset highlights on nodes
    document.querySelectorAll('.node-circle').forEach(c => {
      c.classList.remove('node-highlight');
      c.classList.remove('node-highlight-delta');
    });
    
    // Reset highlights on weights
    document.querySelectorAll('.weight-line').forEach(l => {
      l.classList.remove('weight-highlight');
    });

    const data = this.walkthroughData;
    if (!data) return;

    this.drawNetworkSVG(); // Redraw base diagram to overlay changes
    this.draw(); // Redraw 2D canvas to highlight selected point
    
    const act = this.config.activation;
    const labelMapping = { 'tanh': 'tanh', 'sigmoid': 'σ', 'relu': 'ReLU' };
    const fLabel = labelMapping[act] || 'f';

    switch (this.walkthroughPhase) {
      case 1: // Phase 1: Forward Propagation
        this.dom.walkthroughPhaseLabel.innerText = "Phase 1: Forward Prop";
        this.dom.walkthroughText.innerHTML = `<strong>Feedforward</strong>: Input values $x_1 = ${data.inputs[0].toFixed(2)}$ and $x_2 = ${data.inputs[1].toFixed(2)}$ flow forward. Hidden nodes calculate linear sum $z = \\sum w_i a_i + b$ and apply activation $f(z)$ to produce outputs.`;
        
        // Trigger pulses moving left to right
        this.triggerSvgPulses(true);
        break;
        
      case 2: // Phase 2: Loss Check
        this.dom.walkthroughPhaseLabel.innerText = "Phase 2: Loss Check";
        this.dom.walkthroughText.innerHTML = `<strong>Loss Evaluation</strong>: Output node predicted value $a_{out} = ${data.output.toFixed(4)}$. Placed label target is $y = ${data.target}$. Squared Error: $Loss = \\frac{1}{2}(a_{out} - y)^2 = ${data.loss.toFixed(5)}$.`;
        
        // Highlight output node
        const outNodeL = this.network.layerSizes.length - 1;
        const outCircle = document.getElementById(`node-${outNodeL}-0`);
        if (outCircle) {
          outCircle.classList.add('node-highlight');
        }
        break;
        
      case 3: // Phase 3: Backpropagation Deltas
        this.dom.walkthroughPhaseLabel.innerText = "Phase 3: Backpropagation";
        this.dom.walkthroughText.innerHTML = `<strong>Backpropagation</strong>: Error derivatives travel backward (right to left). Node deltas $\\delta_j = \\frac{\\delta E}{\\delta z_j}$ are calculated representing local error contributions (highlighted in rose).`;
        
        // Highlight active hidden nodes in backprop color
        for (let l = 1; l < this.network.layerSizes.length; l++) {
          for (let n = 0; n < this.network.layerSizes[l]; n++) {
            const circle = document.getElementById(`node-${l}-${n}`);
            if (circle) circle.classList.add('node-highlight-delta');
          }
        }
        
        // Trigger backward pulses (right to left)
        this.triggerSvgPulses(false);
        break;
        
      case 4: // Phase 4: Apply Updates
        this.dom.walkthroughPhaseLabel.innerText = "Phase 4: Weight Update";
        this.dom.walkthroughText.innerHTML = `<strong>Weight Adjustment</strong>: Parameters are updated: $w \\leftarrow w - \\eta \\cdot \\frac{\\delta E}{\\delta w}$. The model just updated! tap <strong>"Finish Walkthrough"</strong> to see updates applied.`;
        
        // Highlight all weight links that are updated
        document.querySelectorAll('.weight-line').forEach(line => {
          line.classList.add('weight-highlight');
        });

        // Actually apply the update on this specific walkthrough step!
        this.network.backward(data.inputs, data.target, this.config.learningRate);
        
        // Play step sound
        this.sound.playMove();
        
        // Update decision boundary and draw
        this.draw();
        
        this.dom.btnWtNext.innerText = "Finish Walkthrough ✖";
        break;
    }
  }

  drawWalkthroughMathOverlays() {
    const svg = this.dom.svg;
    const data = this.walkthroughData;
    if (!data || !this.nodeCoords) return;
    
    const actType = this.config.activation;
    const labelMapping = { 'tanh': 'tanh', 'sigmoid': 'σ', 'relu': 'ReLU' };
    const fLabel = labelMapping[actType] || 'f';

    // 1. Draw Node Math Text Labels
    for (let l = 0; l < this.nodeCoords.length; l++) {
      const nodes = this.nodeCoords[l];
      
      nodes.forEach((node, idx) => {
        const textG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        if (this.walkthroughPhase === 1) {
          // Forward Prop Math
          if (l === 0) {
            // Input values
            const valText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            valText.setAttribute("x", node.x - 14);
            valText.setAttribute("y", node.y);
            valText.setAttribute("class", "node-text node-text-z");
            valText.setAttribute("text-anchor", "end");
            valText.textContent = `x${idx+1}=${data.inputs[idx].toFixed(2)}`;
            textG.appendChild(valText);
          } else {
            // Hidden activations
            const zVal = data.zs[l][idx];
            const aVal = data.activations[l][idx];
            const fName = l === this.nodeCoords.length - 1 ? 'σ' : fLabel;
            
            const zText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            zText.setAttribute("x", node.x);
            zText.setAttribute("y", node.y - 12);
            zText.setAttribute("class", "node-text node-text-z");
            zText.textContent = `z=${zVal.toFixed(2)}`;
            textG.appendChild(zText);
            
            const aText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            aText.setAttribute("x", node.x);
            aText.setAttribute("y", node.y + 16);
            aText.setAttribute("class", "node-text node-text-a");
            aText.textContent = `${fName}(z)=${aVal.toFixed(2)}`;
            textG.appendChild(aText);
          }
        } else if (this.walkthroughPhase === 2 && l === this.nodeCoords.length - 1) {
          // Output Layer target check
          const aVal = data.activations[l][idx];
          
          const targetText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          targetText.setAttribute("x", node.x + 14);
          targetText.setAttribute("y", node.y - 10);
          targetText.setAttribute("class", "node-text node-text-z");
          targetText.setAttribute("text-anchor", "start");
          targetText.textContent = `y=${data.target}`;
          textG.appendChild(targetText);
          
          const predText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          predText.setAttribute("x", node.x + 14);
          predText.setAttribute("y", node.y + 2);
          predText.setAttribute("class", "node-text node-text-a");
          predText.setAttribute("text-anchor", "start");
          predText.textContent = `a=${aVal.toFixed(3)}`;
          textG.appendChild(predText);
          
          const errText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          errText.setAttribute("x", node.x + 14);
          errText.setAttribute("y", node.y + 14);
          errText.setAttribute("class", "node-text node-text-delta");
          errText.setAttribute("text-anchor", "start");
          errText.textContent = `E=${data.loss.toFixed(4)}`;
          textG.appendChild(errText);
        } else if (this.walkthroughPhase === 3 && l > 0) {
          // Backprop delta values
          const deltaVal = data.deltas[l - 1][idx];
          
          const deltaText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          deltaText.setAttribute("x", node.x);
          deltaText.setAttribute("y", node.y - 12);
          deltaText.setAttribute("class", "node-text node-text-delta");
          deltaText.textContent = `δ=${deltaVal.toFixed(3)}`;
          textG.appendChild(deltaText);
        }
        
        svg.appendChild(textG);
      });
    }

    // 2. Draw Weight Gradients (Phase 4 only)
    if (this.walkthroughPhase === 4) {
      const weights = this.network.weights;
      for (let l = 0; l < weights.length; l++) {
        const W = weights[l];
        const prevNodes = this.nodeCoords[l];
        const currNodes = this.nodeCoords[l + 1];
        
        for (let row = 0; row < W.length; row++) {
          for (let col = 0; col < W[row].length; col++) {
            const pNode = prevNodes[col];
            const cNode = currNodes[row];
            const dWVal = data.dW[l][row][col];
            
            // Draw gradient text at weight line midpoints
            const mx = (pNode.x + cNode.x) * 0.5;
            const my = (pNode.y + cNode.y) * 0.5;
            
            const gText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            gText.setAttribute("x", mx);
            gText.setAttribute("y", my - 4);
            gText.setAttribute("class", "weight-text");
            gText.textContent = `dw=${dWVal.toFixed(2)}`;
            
            svg.appendChild(gText);
          }
        }
      }
    }
  }

  triggerSvgPulses(forward = true) {
    const svg = this.dom.svg;
    const sizes = this.network.layerSizes;
    const L = sizes.length - 1; // Number of weight layers
    
    // Clear existing pulses
    document.querySelectorAll('.pulse-circle').forEach(p => p.remove());

    for (let l = 0; l < L; l++) {
      const W = this.network.weights[l];
      
      for (let row = 0; row < W.length; row++) {
        for (let col = 0; col < W[row].length; col++) {
          const pathId = `link-${l}-${row}-${col}`;
          const line = document.getElementById(pathId);
          if (!line) continue;
          
          const x1 = parseFloat(line.getAttribute('x1'));
          const y1 = parseFloat(line.getAttribute('y1'));
          const x2 = parseFloat(line.getAttribute('x2'));
          const y2 = parseFloat(line.getAttribute('y2'));
          
          const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          pulse.setAttribute("r", "3.5");
          pulse.setAttribute("class", "pulse-circle");
          pulse.setAttribute("fill", forward ? "var(--neon-green)" : "var(--neon-rose)");
          pulse.style.color = forward ? "var(--neon-green)" : "var(--neon-rose)";
          
          const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
          anim.setAttribute("dur", "0.8s");
          anim.setAttribute("repeatCount", "1");
          anim.setAttribute("fill", "freeze");
          
          if (forward) {
            anim.setAttribute("path", `M ${x1} ${y1} L ${x2} ${y2}`);
          } else {
            anim.setAttribute("path", `M ${x2} ${y2} L ${x1} ${y1}`);
          }
          
          // Cascading delay based on layer sequence
          const delay = forward ? (l * 0.8) : ((L - 1 - l) * 0.8);
          anim.setAttribute("begin", `${delay}s`);
          
          pulse.appendChild(anim);
          svg.appendChild(pulse);
        }
      }
    }
  }
}
