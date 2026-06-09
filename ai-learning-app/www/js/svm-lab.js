/**
 * Support Vector Machine (SVM) Visualizer Lab
 * Solves soft-margin dual SVM using Sequential Minimal Optimization (SMO)
 */
class SVMLab {
  constructor() {
    this.canvas = document.getElementById('svm-canvas');
    if (!this.canvas) return;

    this.setupCanvas();
    
    // SVM Model parameters
    this.kernelType = 'linear'; // 'linear', 'rbf'
    this.c = 10; // Penalty cost
    this.gamma = 0.5; // RBF width parameter
    
    this.points = []; // {x, y, label} where label is 1 or -1
    this.activeClass = 1; // 1 = Cyan, -1 = Pink
    
    // Solver outputs
    this.alphas = []; // Lagrange multipliers
    this.b = 0.0; // Bias
    
    // UI Elements
    this.cSlider = document.getElementById('svm-c-slider');
    this.cVal = document.getElementById('svm-c-val');
    this.gammaSlider = document.getElementById('svm-gamma-slider');
    this.gammaVal = document.getElementById('svm-gamma-val');
    this.gammaContainer = document.getElementById('svm-gamma-container');
    
    this.btnGenerate = document.getElementById('btn-svm-generate');
    this.btnClear = document.getElementById('btn-svm-clear');
    
    this.initEvents();
    this.generateDataset();
    this.solveSVM();
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
    // Kernel Selectors
    const kernelBtns = document.querySelectorAll('#lab-svm .presets-row .preset-btn');
    kernelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        kernelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.kernelType = btn.getAttribute('data-kernel');
        
        // Show/hide Gamma container for RBF kernel
        if (this.kernelType === 'rbf') {
          this.gammaContainer.style.display = 'flex';
        } else {
          this.gammaContainer.style.display = 'none';
        }
        
        this.solveSVM();
        this.draw();
      });
    });

    // C Slider
    this.cSlider.addEventListener('input', () => {
      this.c = parseFloat(this.cSlider.value);
      this.cVal.textContent = this.c.toFixed(1);
      this.solveSVM();
      this.draw();
    });

    // Gamma Slider
    this.gammaSlider.addEventListener('input', () => {
      this.gamma = parseFloat(this.gammaSlider.value);
      this.gammaVal.textContent = this.gamma.toFixed(2);
      this.solveSVM();
      this.draw();
    });

    // Class Picker buttons
    const btnCyan = document.getElementById('svm-class-cyan');
    const btnPink = document.getElementById('svm-class-pink');
    
    btnCyan.addEventListener('click', () => {
      btnCyan.classList.add('active');
      btnPink.classList.remove('active');
      this.activeClass = 1;
    });

    btnPink.addEventListener('click', () => {
      btnPink.classList.add('active');
      btnCyan.classList.remove('active');
      this.activeClass = -1;
    });

    // Manual point editing
    const addPoint = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      
      // Normalize to -1..1 range
      const nx = (px / this.width) * 2 - 1;
      const ny = -((py / this.height) * 2 - 1);
      
      this.points.push({ x: nx, y: ny, label: this.activeClass });
      this.solveSVM();
      this.draw();
    };

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.target.closest('.class-picker-overlay')) return;
      addPoint(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.target.closest('.class-picker-overlay')) return;
      if (e.touches.length > 0) {
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // Buttons
    this.btnGenerate.addEventListener('click', () => {
      this.generateDataset();
      this.solveSVM();
      this.draw();
    });

    this.btnClear.addEventListener('click', () => {
      this.points = [];
      this.alphas = [];
      this.b = 0;
      this.draw();
    });
  }

  generateDataset() {
    this.points = [];
    
    // Create linearly or non-linearly separable groups
    const centerCyan = { x: -0.4, y: 0.3 };
    const centerPink = { x: 0.4, y: -0.3 };
    
    for (let i = 0; i < 15; i++) {
      // Add random spread points around centerCyan
      this.points.push({
        x: centerCyan.x + (Math.random() * 0.7 - 0.35),
        y: centerCyan.y + (Math.random() * 0.7 - 0.35),
        label: 1 // Cyan
      });
      // Add random spread points around centerPink
      this.points.push({
        x: centerPink.x + (Math.random() * 0.7 - 0.35),
        y: centerPink.y + (Math.random() * 0.7 - 0.35),
        label: -1 // Pink
      });
    }
  }

  // Kernels definitions
  kernel(x1, y1, x2, y2) {
    if (this.kernelType === 'linear') {
      return x1 * x2 + y1 * y2;
    } else if (this.kernelType === 'rbf') {
      const distSq = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
      return Math.exp(-this.gamma * distSq);
    }
    return 0;
  }

  /**
   * Simplified Sequential Minimal Optimization (SMO) SVM Solver
   */
  solveSVM() {
    const N = this.points.length;
    if (N < 2) {
      this.alphas = [];
      this.b = 0;
      return;
    }
    
    // Initialize alphas to 0, bias to 0
    this.alphas = new Array(N).fill(0.0);
    this.b = 0.0;
    
    const maxPasses = 40; // SMO passes without changes
    const tol = 1e-4; // Numerical tolerance
    let passes = 0;
    
    // Precompute kernel matrix for speed
    const K = [];
    for (let i = 0; i < N; i++) {
      K[i] = [];
      for (let j = 0; j < N; j++) {
        K[i][j] = this.kernel(this.points[i].x, this.points[i].y, this.points[j].x, this.points[j].y);
      }
    }

    // Predict score f(x_i)
    const getPredictionVal = (idx) => {
      let sum = 0.0;
      for (let j = 0; j < N; j++) {
        sum += this.alphas[j] * this.points[j].label * K[j][idx];
      }
      return sum + this.b;
    };

    while (passes < maxPasses) {
      let numChangedAlphas = 0;
      
      for (let i = 0; i < N; i++) {
        const Ei = getPredictionVal(i) - this.points[i].label;
        
        // Check KKT conditions violation
        const yiEi = this.points[i].label * Ei;
        if ((yiEi < -tol && this.alphas[i] < this.c) || (yiEi > tol && this.alphas[i] > 0)) {
          
          // Select random j != i
          let j = i;
          while (j === i) {
            j = Math.floor(Math.random() * N);
          }
          
          const Ej = getPredictionVal(j) - this.points[j].label;
          
          // Save old alphas
          const oldAlphaI = this.alphas[i];
          const oldAlphaJ = this.alphas[j];
          
          // Compute bounds L and H
          let L = 0, H = this.c;
          if (this.points[i].label !== this.points[j].label) {
            L = Math.max(0, this.alphas[j] - this.alphas[i]);
            H = Math.min(this.c, this.c + this.alphas[j] - this.alphas[i]);
          } else {
            L = Math.max(0, this.alphas[i] + this.alphas[j] - this.c);
            H = Math.min(this.c, this.alphas[i] + this.alphas[j]);
          }
          
          if (Math.abs(L - H) < 1e-5) continue;
          
          // Compute eta
          const eta = 2 * K[i][j] - K[i][i] - K[j][j];
          if (eta >= 0) continue; // numerical issue, skip
          
          // Compute new alpha_j
          let newAlphaJ = this.alphas[j] - (this.points[j].label * (Ei - Ej)) / eta;
          
          // Clip alpha_j
          newAlphaJ = Math.max(L, Math.min(H, newAlphaJ));
          
          if (Math.abs(newAlphaJ - this.alphas[j]) < 1e-5) continue;
          
          this.alphas[j] = newAlphaJ;
          
          // Compute alpha_i
          this.alphas[i] += this.points[i].label * this.points[j].label * (oldAlphaJ - this.alphas[j]);
          
          // Compute bias b
          const b1 = this.b - Ei - this.points[i].label * (this.alphas[i] - oldAlphaI) * K[i][i] - this.points[j].label * (this.alphas[j] - oldAlphaJ) * K[i][j];
          const b2 = this.b - Ej - this.points[i].label * (this.alphas[i] - oldAlphaI) * K[i][j] - this.points[j].label * (this.alphas[j] - oldAlphaJ) * K[j][j];
          
          if (this.alphas[i] > 0 && this.alphas[i] < this.c) {
            this.b = b1;
          } else if (this.alphas[j] > 0 && this.alphas[j] < this.c) {
            this.b = b2;
          } else {
            this.b = (b1 + b2) / 2.0;
          }
          
          numChangedAlphas++;
        }
      }
      
      if (numChangedAlphas === 0) {
        passes++;
      } else {
        passes = 0;
      }
    }
  }

  // Predict any score at coordinates (x,y)
  predict(x, y) {
    let sum = 0.0;
    for (let j = 0; j < this.points.length; j++) {
      if (this.alphas[j] > 1e-4) {
        sum += this.alphas[j] * this.points[j].label * this.kernel(this.points[j].x, this.points[j].y, x, y);
      }
    }
    return sum + this.b;
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    
    const N = this.points.length;
    
    // 1. Draw Decision Boundaries & Margins (Background grid)
    if (N >= 2) {
      const gridRes = 50; // downscaled resolution
      const sizeX = this.width / gridRes;
      const sizeY = this.height / gridRes;
      
      for (let gx = 0; gx < gridRes; gx++) {
        for (let gy = 0; gy < gridRes; gy++) {
          const nx = (gx / gridRes) * 2 - 1;
          const ny = -((gy / gridRes) * 2 - 1);
          
          const score = this.predict(nx, ny); // Margin boundary score
          
          // Shading:
          // Decision hyperplane score = 0
          // Margins score = +1 or -1
          // Score > 0 is positive (Cyan), Score < 0 is negative (Pink)
          let r, g, b, alpha = 0.06;
          
          // Draw thin highlighted lines exactly at margins (+1 / -1) and hyperplane (0)
          const absS = Math.abs(score);
          if (absS < 0.08) {
            alpha = 0.25; // Highlight decision boundary
          } else if (Math.abs(absS - 1.0) < 0.08) {
            alpha = 0.18; // Highlight margins boundary
          }
          
          if (score > 0) {
            r = 0; g = 255; b = 255; // Cyan
          } else {
            r = 255; g = 0; b = 127; // Pink
          }
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(gx * sizeX, gy * sizeY, sizeX + 0.5, sizeY + 0.5);
        }
      }
    }

    // Grid center lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.moveTo(0, this.height / 2);
    ctx.lineTo(this.width, this.height / 2);
    ctx.stroke();

    // 2. Highlight Support Vectors (those with alpha > 0)
    for (let i = 0; i < N; i++) {
      if (this.alphas[i] > 1e-4) {
        const pt = this.points[i];
        const px = ((pt.x + 1) / 2) * this.width;
        const py = ((-pt.y + 1) / 2) * this.height;
        
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffee32'; // Yellow glow indicator
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ffee32';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }
    }

    // 3. Draw Data Points
    this.points.forEach(pt => {
      const px = ((pt.x + 1) / 2) * this.width;
      const py = ((-pt.y + 1) / 2) * this.height;
      
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      
      if (pt.label === 1) {
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = '#00ffff';
      } else {
        ctx.fillStyle = '#ff007f';
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = '#ff007f';
      }
      ctx.lineWidth = 1.0;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.svmLab = new SVMLab();
});
