/**
 * Neural Network Engine & Visualization Lab
 */

class NeuralNetworkEngine {
  constructor(layerSizes, activationType = 'tanh') {
    this.layerSizes = layerSizes; // e.g., [2, 4, 1]
    this.activationType = activationType;
    this.weights = []; // Matrices
    this.biases = []; // Vectors
    this.initParameters();
  }

  initParameters() {
    this.weights = [];
    this.biases = [];
    
    for (let i = 1; i < this.layerSizes.length; i++) {
      const nIn = this.layerSizes[i - 1];
      const nOut = this.layerSizes[i];
      const limit = Math.sqrt(6.0 / (nIn + nOut)); // Xavier initialization
      
      const layerWeights = [];
      for (let r = 0; r < nOut; r++) {
        const row = [];
        for (let c = 0; c < nIn; c++) {
          row.push((Math.random() * 2 - 1) * limit);
        }
        layerWeights.push(row);
      }
      this.weights.push(layerWeights);
      
      const layerBiases = [];
      for (let r = 0; r < nOut; r++) {
        layerBiases.push(0.0);
      }
      this.biases.push(layerBiases);
    }
  }

  activate(z, type) {
    if (type === 'sigmoid') return 1.0 / (1.0 + Math.exp(-z));
    if (type === 'tanh') return Math.tanh(z);
    if (type === 'relu') return Math.max(0.0, z);
    return z;
  }

  activateDerivative(a, type) {
    if (type === 'sigmoid') return a * (1.0 - a);
    if (type === 'tanh') return 1.0 - a * a;
    if (type === 'relu') return a > 0.0 ? 1.0 : 0.0;
    return 1.0;
  }

  forward(inputs) {
    let curr = [...inputs];
    const activations = [curr];
    const zs = [[]];
    
    const numLayers = this.weights.length;
    for (let i = 0; i < numLayers; i++) {
      const W = this.weights[i];
      const b = this.biases[i];
      const nextA = [];
      const nextZ = [];
      
      for (let row = 0; row < W.length; row++) {
        let z = b[row];
        for (let col = 0; col < W[row].length; col++) {
          z += W[row][col] * curr[col];
        }
        nextZ.push(z);
        // Output layer is always sigmoid for probability [0, 1]
        const actType = (i === numLayers - 1) ? 'sigmoid' : this.activationType;
        nextA.push(this.activate(z, actType));
      }
      
      zs.push(nextZ);
      activations.push(nextA);
      curr = nextA;
    }
    
    return { output: curr, activations, zs };
  }

  backward(inputs, target, learningRate = 0.05) {
    const { activations, zs } = this.forward(inputs);
    const L = this.weights.length;
    const deltas = new Array(L);
    
    // Output Layer Error (MSE Loss derivative w.r.t z)
    const outAct = activations[L][0];
    const error = outAct - target;
    const outputDelta = error * this.activateDerivative(outAct, 'sigmoid');
    deltas[L - 1] = [outputDelta];
    
    // Propagate deltas backwards
    for (let l = L - 2; l >= 0; l--) {
      const W_next = this.weights[l + 1];
      const delta_next = deltas[l + 1];
      const layerDeltas = [];
      const act = activations[l + 1];
      
      for (let i = 0; i < this.layerSizes[l + 1]; i++) {
        let sum = 0.0;
        for (let j = 0; j < W_next.length; j++) {
          sum += W_next[j][i] * delta_next[j];
        }
        const delta = sum * this.activateDerivative(act[i], this.activationType);
        layerDeltas.push(delta);
      }
      deltas[l] = layerDeltas;
    }
    
    // Update weights and biases
    for (let l = 0; l < L; l++) {
      const W = this.weights[l];
      const b = this.biases[l];
      const delta = deltas[l];
      const prevA = activations[l];
      
      for (let r = 0; r < W.length; r++) {
        for (let c = 0; c < W[r].length; c++) {
          W[r][c] -= learningRate * delta[r] * prevA[c];
        }
        b[r] -= learningRate * delta[r];
      }
    }
    
    return 0.5 * error * error; // Return squared loss
  }

  getTraceData(inputs, target) {
    const { activations, zs } = this.forward(inputs);
    const L = this.weights.length;
    const deltas = new Array(L);
    
    const outAct = activations[L][0];
    const error = outAct - target;
    const outputDelta = error * this.activateDerivative(outAct, 'sigmoid');
    deltas[L - 1] = [outputDelta];
    
    for (let l = L - 2; l >= 0; l--) {
      const W_next = this.weights[l + 1];
      const delta_next = deltas[l + 1];
      const layerDeltas = [];
      const act = activations[l + 1];
      
      for (let i = 0; i < this.layerSizes[l + 1]; i++) {
        let sum = 0.0;
        for (let j = 0; j < W_next.length; j++) {
          sum += W_next[j][i] * delta_next[j];
        }
        const delta = sum * this.activateDerivative(act[i], this.activationType);
        layerDeltas.push(delta);
      }
      deltas[l] = layerDeltas;
    }

    const dW = [];
    const db = [];
    for (let l = 0; l < L; l++) {
      const W = this.weights[l];
      const delta = deltas[l];
      const prevA = activations[l];
      const layerDw = [];
      for (let r = 0; r < W.length; r++) {
        const rowDw = [];
        for (let c = 0; c < W[r].length; c++) {
          rowDw.push(delta[r] * prevA[c]);
        }
        layerDw.push(rowDw);
      }
      dW.push(layerDw);
      db.push([...delta]);
    }

    return { inputs, target, output: outAct, loss: 0.5 * error * error, zs, activations, deltas, dW, db };
  }
}

class NNLab {
  constructor() {
    this.canvas = document.getElementById('nn-boundary-canvas');
    if (!this.canvas) return;

    this.setupCanvas();
    
    // Model configuration
    this.network = new NeuralNetworkEngine([2, 4, 1], 'tanh');
    this.learningRate = 0.03;
    this.datasetType = 'xor';
    
    this.points = [];
    this.isTraining = false;
    this.epochCount = 0;
    
    // Touch controls
    this.activeClass = 1; // 1 = Cyan (positive), 0 = Pink (negative)
    
    // Step Tracer States
    this.isTracing = false;
    this.tracePhase = 0; // 0 = ready, 1 = feedforward, 2 = loss, 3 = backprop, 4 = update
    this.traceSample = null;
    this.traceData = null;
    
    // UI Elements
    this.btnTrain = document.getElementById('btn-nn-train');
    this.btnStep = document.getElementById('btn-nn-step');
    this.btnReset = document.getElementById('btn-nn-reset');
    this.lrSlider = document.getElementById('nn-lr-slider');
    this.lrVal = document.getElementById('nn-lr-val');
    this.epochsLabel = document.getElementById('nn-epochs');
    this.lossLabel = document.getElementById('nn-loss');
    
    this.btnTraceToggle = document.getElementById('btn-nn-trace-toggle');
    this.traceDetails = document.getElementById('nn-trace-details');
    this.tracePhaseTitle = document.getElementById('trace-phase-title');
    this.traceFormula = document.getElementById('trace-formula');
    this.traceExplain = document.getElementById('trace-explain');
    this.btnTracePrev = document.getElementById('btn-trace-prev');
    this.btnTraceNext = document.getElementById('btn-trace-next');
    
    this.svg = document.getElementById('nn-svg');
    
    this.initEvents();
    this.changeDataset('xor');
    this.updateSVG();
    this.draw();
  }

  setupCanvas() {
    this.width = 340;
    this.height = 340;

    const trySetup = () => {
      const hdpi = window.setupHdpiCanvas(this.canvas);
      if (hdpi) {
        this.width = hdpi.width;
        this.height = hdpi.height;
        this.ctx = hdpi.ctx;
        this.draw();
        return true;
      }
      return false;
    };

    if (!trySetup()) {
      const interval = setInterval(() => {
        if (trySetup()) {
          clearInterval(interval);
        }
      }, 50);
      setTimeout(() => clearInterval(interval), 2000);
    }
    
    window.addEventListener('resize', () => {
      const hdpiResized = window.setupHdpiCanvas(this.canvas);
      if (hdpiResized) {
        this.width = hdpiResized.width;
        this.height = hdpiResized.height;
        this.ctx = hdpiResized.ctx;
        this.draw();
      }
    });
  }

  initEvents() {
    // Buttons setup
    this.btnTrain.addEventListener('click', () => {
      if (this.isTraining) {
        this.stopTraining();
      } else {
        this.startTraining();
      }
    });

    this.btnStep.addEventListener('click', () => {
      this.trainStep();
      this.draw();
    });

    this.btnReset.addEventListener('click', () => {
      this.stopTraining();
      this.network.initParameters();
      this.epochCount = 0;
      this.epochsLabel.textContent = '0';
      this.lossLabel.textContent = '0.0000';
      this.resetTracer();
      this.updateSVG();
      this.draw();
    });

    // Learning Rate Slider
    this.lrSlider.addEventListener('input', () => {
      this.learningRate = parseFloat(this.lrSlider.value);
      this.lrVal.textContent = this.learningRate.toFixed(3);
    });

    // Dataset Selectors
    const datasetBtns = document.querySelectorAll('#lab-nn .presets-row .preset-btn');
    datasetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        datasetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.changeDataset(btn.getAttribute('data-dataset'));
      });
    });

    // Canvas Point Editor
    const addPoint = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      
      // Convert to normalized coordinates (-1 to 1)
      const nx = (px / this.width) * 2 - 1;
      const ny = -((py / this.height) * 2 - 1);
      
      this.points.push({ x: nx, y: ny, label: this.activeClass });
      this.resetTracer();
      this.draw();
    };

    this.canvas.addEventListener('mousedown', (e) => {
      // Don't add points if clicking overlay buttons
      if (e.target.closest('.class-picker-overlay')) return;
      addPoint(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.target.closest('.class-picker-overlay')) return;
      if (e.touches.length > 0) {
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // Class selection overlay
    const btnCyan = document.getElementById('nn-class-cyan');
    const btnPink = document.getElementById('nn-class-pink');
    
    btnCyan.addEventListener('click', () => {
      btnCyan.classList.add('active');
      btnPink.classList.remove('active');
      this.activeClass = 1;
    });

    btnPink.addEventListener('click', () => {
      btnPink.classList.add('active');
      btnCyan.classList.remove('active');
      this.activeClass = 0;
    });

    // Step-by-Step Tracer triggers
    this.btnTraceToggle.addEventListener('click', () => {
      if (this.isTracing) {
        this.resetTracer();
      } else {
        this.startTracer();
      }
    });

    this.btnTracePrev.addEventListener('click', () => this.stepTracer(-1));
    this.btnTraceNext.addEventListener('click', () => this.stepTracer(1));
  }

  changeDataset(type) {
    this.stopTraining();
    this.datasetType = type;
    this.points = [];
    this.epochCount = 0;
    this.epochsLabel.textContent = '0';
    this.lossLabel.textContent = '0.0000';
    this.resetTracer();
    
    // Generate preset points
    for (let i = 0; i < 60; i++) {
      const rx = Math.random() * 1.6 - 0.8;
      const ry = Math.random() * 1.6 - 0.8;
      
      let label = 0;
      if (type === 'gaussian') {
        label = (rx + ry > 0) ? 1 : 0;
      } else if (type === 'circle') {
        label = (Math.hypot(rx, ry) < 0.55) ? 1 : 0;
      } else if (type === 'xor') {
        label = (rx * ry > 0) ? 1 : 0;
      }
      
      // Add slight noise
      this.points.push({
        x: rx + (Math.random() * 0.05 - 0.025),
        y: ry + (Math.random() * 0.05 - 0.025),
        label
      });
    }
    
    this.network.initParameters();
    this.updateSVG();
    this.draw();
  }

  startTraining() {
    this.isTraining = true;
    this.btnTrain.textContent = 'Pause ⏸';
    this.btnTrain.classList.remove('btn-primary');
    this.btnTrain.classList.add('btn-secondary');
    this.resetTracer();
    
    const trainLoop = () => {
      if (!this.isTraining) return;
      
      // Run 15 epochs per animation frame for visual speed
      let avgLoss = 0;
      for (let k = 0; k < 15; k++) {
        avgLoss = this.trainStep();
      }
      
      this.epochsLabel.textContent = this.epochCount;
      this.lossLabel.textContent = avgLoss.toFixed(4);
      
      this.updateSVG();
      this.draw();
      
      requestAnimationFrame(trainLoop);
    };
    
    requestAnimationFrame(trainLoop);
  }

  stopTraining() {
    this.isTraining = false;
    this.btnTrain.textContent = 'Train ▶';
    this.btnTrain.classList.remove('btn-secondary');
    this.btnTrain.classList.add('btn-primary');
  }

  trainStep() {
    if (this.points.length === 0) return 0;
    
    let totalLoss = 0;
    // SGD: process points in random order
    const shuffled = [...this.points].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(pt => {
      const loss = this.network.backward([pt.x, pt.y], pt.label, this.learningRate);
      totalLoss += loss;
    });
    
    this.epochCount++;
    return totalLoss / this.points.length;
  }

  // Tracer walkthrough logic
  startTracer() {
    if (this.points.length === 0) return;
    this.stopTraining();
    
    this.isTracing = true;
    this.btnTraceToggle.textContent = 'Stop Trace ✖';
    this.btnTraceToggle.classList.add('btn-danger');
    this.traceDetails.classList.remove('hidden');
    
    // Pick a random sample point to trace
    this.traceSample = this.points[Math.floor(Math.random() * this.points.length)];
    this.tracePhase = 1;
    this.traceData = this.network.getTraceData([this.traceSample.x, this.traceSample.y], this.traceSample.label);
    
    this.stepTracer(0);
  }

  resetTracer() {
    this.isTracing = false;
    this.btnTraceToggle.textContent = 'Start Trace 🧪';
    this.btnTraceToggle.classList.remove('btn-danger');
    this.traceDetails.classList.add('hidden');
    this.traceSample = null;
    this.traceData = null;
    this.tracePhase = 0;
    this.updateSVG();
    this.draw();
  }

  stepTracer(direction) {
    this.tracePhase += direction;
    this.tracePhase = Math.max(1, Math.min(4, this.tracePhase));
    
    this.btnTracePrev.disabled = (this.tracePhase === 1);
    this.btnTraceNext.textContent = (this.tracePhase === 4) ? 'Finish Trace ➔' : 'Next';
    
    if (direction === 1 && this.tracePhase === 4) {
      // If finishing the trace, actually perform a parameter update step
      this.network.backward([this.traceSample.x, this.traceSample.y], this.traceSample.label, this.learningRate);
      this.resetTracer();
      return;
    }

    const phaseTitles = [
      '',
      'Phase 1/4: Feedforward',
      'Phase 2/4: Calculate Loss',
      'Phase 3/4: Backpropagation',
      'Phase 4/4: Weight Update'
    ];

    this.tracePhaseTitle.textContent = phaseTitles[this.tracePhase];

    const x1 = this.traceSample.x.toFixed(2);
    const x2 = this.traceSample.y.toFixed(2);
    const target = this.traceSample.label;
    const output = this.traceData.output.toFixed(2);

    if (this.tracePhase === 1) {
      this.traceFormula.textContent = `z_h = w·x + b  ->  a_h = tanh(z_h)`;
      this.traceExplain.textContent = `Input values x₁=${x1}, x₂=${x2} propagate forward. Layer 1 activates hidden nodes. Output predicts: ${output} (Target: ${target}).`;
    } else if (this.tracePhase === 2) {
      this.traceFormula.textContent = `L = 0.5 * (a_out - y)²`;
      this.traceExplain.textContent = `Compare network output ${output} with target ${target}. Squared error loss is ${this.traceData.loss.toFixed(4)}.`;
    } else if (this.tracePhase === 3) {
      this.traceFormula.textContent = `δ_out = (a_out - y) * f'(z_out)`;
      this.traceExplain.textContent = `Send error backwards. Output delta: ${this.traceData.deltas[1][0].toFixed(3)}. Hidden node L1 deltas calculate using chain rule weights.`;
    } else if (this.tracePhase === 4) {
      this.traceFormula.textContent = `w_new = w_old - η * δ * a_prev`;
      this.traceExplain.textContent = `Adjust weights by gradient times learning rate (${this.learningRate}). Click Finish to commit values.`;
    }

    this.updateSVG();
    this.draw();
  }

  updateSVG() {
    if (!this.svg) return;
    
    // Dimensions
    const rect = this.svg.getBoundingClientRect();
    const width = rect.width || 250;
    const height = rect.height || 130;
    
    this.svg.innerHTML = '';
    
    const layerSizes = this.network.layerSizes;
    const layerCount = layerSizes.length;
    
    // Node coordinate generator
    const getNodeCoords = (layerIdx, nodeIdx) => {
      const x = 30 + (width - 60) * (layerIdx / (layerCount - 1));
      const size = layerSizes[layerIdx];
      const y = 15 + (height - 30) * (nodeIdx / (size - 1 || 1));
      return { x, y };
    };

    // 1. Draw connections (Weights)
    for (let l = 0; l < this.network.weights.length; l++) {
      const W = this.network.weights[l];
      for (let r = 0; r < W.length; r++) {
        for (let c = 0; c < W[r].length; c++) {
          const from = getNodeCoords(l, c);
          const to = getNodeCoords(l + 1, r);
          
          const weight = W[r][c];
          const absW = Math.abs(weight);
          const thickness = Math.max(0.5, Math.min(4, absW * 1.5));
          
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', from.x);
          line.setAttribute('y1', from.y);
          line.setAttribute('x2', to.x);
          line.setAttribute('y2', to.y);
          
          // Color coding: Cyan for positive, Pink for negative weight lines
          line.setAttribute('stroke', weight > 0 ? 'var(--neon-cyan)' : 'var(--neon-pink)');
          line.setAttribute('stroke-width', thickness);
          
          // Tracing visual highlight
          if (this.isTracing) {
            if (this.tracePhase === 1) {
              line.setAttribute('stroke-opacity', '0.6');
            } else if (this.tracePhase === 3 || this.tracePhase === 4) {
              line.setAttribute('stroke-opacity', '1.0');
              line.setAttribute('stroke-width', thickness + 1.5);
            } else {
              line.setAttribute('stroke-opacity', '0.15');
            }
          } else {
            line.setAttribute('stroke-opacity', Math.min(1.0, 0.2 + absW * 0.4));
          }
          
          this.svg.appendChild(line);
        }
      }
    }

    // 2. Draw nodes
    for (let l = 0; l < layerCount; l++) {
      const size = layerSizes[l];
      for (let n = 0; n < size; n++) {
        const coords = getNodeCoords(l, n);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', coords.x);
        circle.setAttribute('cy', coords.y);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', '#090e1a');
        circle.setAttribute('stroke', 'var(--text-secondary)');
        circle.setAttribute('stroke-width', '1.5');
        
        // Active tracer glows
        if (this.isTracing) {
          if (this.tracePhase === 1 && l === 0) {
            circle.setAttribute('stroke', 'var(--neon-cyan)');
            circle.setAttribute('fill', 'var(--neon-cyan)');
          } else if (this.tracePhase === 2 && l === layerCount - 1) {
            circle.setAttribute('stroke', 'var(--neon-yellow)');
            circle.setAttribute('fill', 'var(--neon-yellow)');
          } else if (this.tracePhase === 3 && l > 0) {
            circle.setAttribute('stroke', 'var(--neon-pink)');
          }
        }
        
        this.svg.appendChild(circle);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background boundary prediction grid
    const gridRes = 50; // Resolution of background
    const sizeX = this.width / gridRes;
    const sizeY = this.height / gridRes;
    
    for (let gx = 0; gx < gridRes; gx++) {
      for (let gy = 0; gy < gridRes; gy++) {
        // Normalize coordinates to -1..1
        const nx = (gx / gridRes) * 2 - 1;
        const ny = -((gy / gridRes) * 2 - 1);
        
        const res = this.network.forward([nx, ny]);
        const score = res.output[0]; // between 0 and 1
        
        // Paint cell: interpolate Cyan (positive) and Pink (negative)
        // Cyan = rgb(0, 255, 255), Pink = rgb(255, 0, 127)
        let r, g, b;
        if (score > 0.5) {
          const confidence = (score - 0.5) * 2; // 0..1
          r = Math.round(0 * confidence + 6 * (1 - confidence));
          g = Math.round(255 * confidence + 9 * (1 - confidence));
          b = Math.round(255 * confidence + 19 * (1 - confidence));
        } else {
          const confidence = (0.5 - score) * 2; // 0..1
          r = Math.round(255 * confidence + 6 * (1 - confidence));
          g = Math.round(0 * confidence + 9 * (1 - confidence));
          b = Math.round(127 * confidence + 19 * (1 - confidence));
        }
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(gx * sizeX, gy * sizeY, sizeX + 0.5, sizeY + 0.5);
      }
    }

    // Grid center axis markers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.moveTo(0, this.height / 2);
    ctx.lineTo(this.width, this.height / 2);
    ctx.stroke();

    // Trace Sample projection highlighting
    if (this.isTracing && this.traceSample) {
      const px = ((this.traceSample.x + 1) / 2) * this.width;
      const py = ((-this.traceSample.y + 1) / 2) * this.height;
      
      // Draw radar target rings
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffee32';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw training data points
    this.points.forEach(pt => {
      const px = ((pt.x + 1) / 2) * this.width;
      const py = ((-pt.y + 1) / 2) * this.height;
      
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      
      // Set neon color based on class
      if (pt.label === 1) {
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#00ffff';
      } else {
        ctx.fillStyle = '#ff007f';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#ff007f';
      }
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.nnLab = new NNLab();
});
