/**
 * Decision Tree and Random Forest Visualizer Lab
 */

class DecisionTreeNode {
  constructor(depth = 0) {
    this.depth = depth;
    this.isLeaf = false;
    this.label = null; // majority class (0 or 1)
    
    // Split criteria
    this.dim = null; // 0 for x, 1 for y
    this.threshold = null;
    this.left = null;
    this.right = null;
  }
}

class DecisionTree {
  constructor(maxDepth = 4) {
    this.maxDepth = maxDepth;
    this.root = null;
  }

  calculateGini(points) {
    if (points.length === 0) return 0;
    let count1 = 0;
    points.forEach(p => { if (p.label === 1) count1++; });
    const p1 = count1 / points.length;
    const p0 = 1 - p1;
    return 1 - (p0 * p0 + p1 * p1); // Gini Impurity formula
  }

  train(points) {
    this.root = this.buildTree(points, 0);
  }

  buildTree(points, depth) {
    const node = new DecisionTreeNode(depth);
    
    if (points.length === 0) {
      node.isLeaf = true;
      node.label = 0;
      return node;
    }
    
    // Calculate majority label
    let count1 = 0;
    points.forEach(p => { if (p.label === 1) count1++; });
    const majorityLabel = (count1 >= points.length / 2) ? 1 : 0;
    
    const currentGini = this.calculateGini(points);
    
    // Base cases for stopping splits
    if (depth >= this.maxDepth || currentGini === 0 || points.length < 3) {
      node.isLeaf = true;
      node.label = majorityLabel;
      return node;
    }
    
    // Find best split
    let bestGain = -1;
    let bestDim = -1;
    let bestThreshold = 0;
    let bestLeft = [];
    let bestRight = [];
    
    // Test dimensions (0 for x, 1 for y)
    for (let dim = 0; dim < 2; dim++) {
      // Find candidate thresholds from data values
      const coords = points.map(p => (dim === 0 ? p.x : p.y));
      const candidates = [...new Set(coords)].sort((a, b) => a - b);
      
      for (let i = 0; i < candidates.length - 1; i++) {
        // Threshold is midpoint between values
        const thresh = (candidates[i] + candidates[i + 1]) / 2;
        
        // Partition points
        const leftPoints = points.filter(p => (dim === 0 ? p.x : p.y) <= thresh);
        const rightPoints = points.filter(p => (dim === 0 ? p.x : p.y) > thresh);
        
        if (leftPoints.length === 0 || rightPoints.length === 0) continue;
        
        // Calculate Information Gain
        const wLeft = leftPoints.length / points.length;
        const wRight = rightPoints.length / points.length;
        const childGini = wLeft * this.calculateGini(leftPoints) + wRight * this.calculateGini(rightPoints);
        const gain = currentGini - childGini;
        
        if (gain > bestGain) {
          bestGain = gain;
          bestDim = dim;
          bestThreshold = thresh;
          bestLeft = leftPoints;
          bestRight = rightPoints;
        }
      }
    }
    
    // If we can't find a split that yields any impurity reduction
    if (bestGain <= 0.001) {
      node.isLeaf = true;
      node.label = majorityLabel;
      return node;
    }
    
    // Set split properties and recurse
    node.dim = bestDim;
    node.threshold = bestThreshold;
    node.left = this.buildTree(bestLeft, depth + 1);
    node.right = this.buildTree(bestRight, depth + 1);
    
    return node;
  }

  // Returns probability of class 1 (Cyan)
  predict(x, y, node = this.root) {
    if (!node) return 0.5;
    if (node.isLeaf) {
      return node.label;
    }
    const val = (node.dim === 0) ? x : y;
    if (val <= node.threshold) {
      return this.predict(x, y, node.left);
    } else {
      return this.predict(x, y, node.right);
    }
  }
}

class RandomForest {
  constructor(numTrees = 3, maxDepth = 4) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.trees = [];
  }

  train(points) {
    this.trees = [];
    if (points.length === 0) return;
    
    for (let i = 0; i < this.numTrees; i++) {
      const tree = new DecisionTree(this.maxDepth);
      
      // Bootstrap sampling: sample N points with replacement
      const bootstrap = [];
      for (let j = 0; j < points.length; j++) {
        const randIdx = Math.floor(Math.random() * points.length);
        bootstrap.push(points[randIdx]);
      }
      
      tree.train(bootstrap);
      this.trees.push(tree);
    }
  }

  // Average probability vote for class 1
  predict(x, y) {
    if (this.trees.length === 0) return 0.5;
    let sum = 0.0;
    this.trees.forEach(t => {
      sum += t.predict(x, y);
    });
    return sum / this.trees.length;
  }
}

class ForestLab {
  constructor() {
    this.canvas = document.getElementById('forest-canvas');
    if (!this.canvas) return;

    this.setupCanvas();
    
    // Configuration
    this.numTrees = 3;
    this.maxDepth = 4;
    this.points = []; // {x, y, label} where label is 0 or 1
    this.activeClass = 1; // 1 = Cyan, 0 = Pink
    
    // Filter display configuration
    // 'forest' = ensemble averaged, 0..N = index of specific tree
    this.displayFilter = 'forest';
    
    // Forest model
    this.forest = new RandomForest(this.numTrees, this.maxDepth);
    
    // UI Elements
    this.treeSlider = document.getElementById('forest-num-slider');
    this.treeVal = document.getElementById('forest-num-val');
    this.depthSlider = document.getElementById('forest-depth-slider');
    this.depthVal = document.getElementById('forest-depth-val');
    
    this.btnGenerate = document.getElementById('btn-forest-generate');
    this.btnClear = document.getElementById('btn-forest-clear');
    
    this.btnShowForest = document.getElementById('btn-forest-show-forest');
    this.btnShowTree0 = document.querySelector('[data-tree-idx="0"]');
    this.btnShowTree1 = document.querySelector('[data-tree-idx="1"]');
    this.btnShowTree2 = document.querySelector('[data-tree-idx="2"]');
    
    this.initEvents();
    this.generateDataset();
    this.trainModel();
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
    // Sliders
    this.treeSlider.addEventListener('input', () => {
      this.numTrees = parseInt(this.treeSlider.value);
      this.treeVal.textContent = this.numTrees;
      
      // Update the visual selection presets dynamically
      this.updateFilterButtonsVisibility();
      
      this.trainModel();
      this.draw();
    });

    this.depthSlider.addEventListener('input', () => {
      this.maxDepth = parseInt(this.depthSlider.value);
      this.depthVal.textContent = this.maxDepth;
      this.trainModel();
      this.draw();
    });

    // Buttons
    this.btnGenerate.addEventListener('click', () => {
      this.generateDataset();
      this.trainModel();
      this.draw();
    });

    this.btnClear.addEventListener('click', () => {
      this.points = [];
      this.forest.trees = [];
      this.draw();
    });

    // Filter Buttons (Forest vs individual trees)
    const filterBtns = document.querySelectorAll('#lab-forest .presets-row .preset-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const idx = btn.getAttribute('data-tree-idx');
        if (idx !== null) {
          this.displayFilter = parseInt(idx);
        } else {
          this.displayFilter = 'forest';
        }
        
        this.draw();
      });
    });

    // Class Picker buttons
    const btnCyan = document.getElementById('forest-class-cyan');
    const btnPink = document.getElementById('forest-class-pink');
    
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

    // Manual Point Placing
    const addPoint = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      
      // Normalize to -1..1 range
      const nx = (px / this.width) * 2 - 1;
      const ny = -((py / this.height) * 2 - 1);
      
      this.points.push({ x: nx, y: ny, label: this.activeClass });
      this.trainModel();
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
  }

  updateFilterButtonsVisibility() {
    // Hide buttons for tree index > numTrees
    if (this.numTrees < 3) {
      if (this.btnShowTree2) this.btnShowTree2.style.display = 'none';
    } else {
      if (this.btnShowTree2) this.btnShowTree2.style.display = 'block';
    }
    if (this.numTrees < 2) {
      if (this.btnShowTree1) this.btnShowTree1.style.display = 'none';
    } else {
      if (this.btnShowTree1) this.btnShowTree1.style.display = 'block';
    }
    
    // Reset selection to forest if selection was on a tree index that got hidden
    if (typeof this.displayFilter === 'number' && this.displayFilter >= this.numTrees) {
      const filterBtns = document.querySelectorAll('#lab-forest .presets-row .preset-btn');
      filterBtns.forEach(b => b.classList.remove('active'));
      this.btnShowForest.classList.add('active');
      this.displayFilter = 'forest';
    }
  }

  generateDataset() {
    this.points = [];
    
    // Generate complex grid classification layout
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * 1.6 - 0.8;
      const ry = Math.random() * 1.6 - 0.8;
      
      // XOR checkerboard boundary to demonstrate non-linear orthogonal splits
      const label = (rx * ry > -0.05 && rx * ry < 0.25) ? 1 : 0;
      
      this.points.push({ x: rx, y: ry, label });
    }
  }

  trainModel() {
    this.forest.numTrees = this.numTrees;
    this.forest.maxDepth = this.maxDepth;
    this.forest.train(this.points);
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    
    const N = this.points.length;
    const numT = this.forest.trees.length;
    
    // 1. Draw Decision Boundaries (Background pixel grid)
    if (N > 0 && numT > 0) {
      const gridRes = 60; // downscaled resolution
      const sizeX = this.width / gridRes;
      const sizeY = this.height / gridRes;
      
      for (let gx = 0; gx < gridRes; gx++) {
        for (let gy = 0; gy < gridRes; gy++) {
          const nx = (gx / gridRes) * 2 - 1;
          const ny = -((gy / gridRes) * 2 - 1);
          
          let score = 0.5;
          if (this.displayFilter === 'forest') {
            score = this.forest.predict(nx, ny);
          } else {
            const treeIdx = Math.min(this.displayFilter, numT - 1);
            score = this.forest.trees[treeIdx].predict(nx, ny);
          }
          
          // Interpolate cell colors: probability score -> 1 (Cyan), 0 (Pink)
          let r, g, b;
          if (score > 0.5) {
            const conf = (score - 0.5) * 2; // scale to 0..1
            r = Math.round(0 * conf + 6 * (1 - conf));
            g = Math.round(255 * conf + 9 * (1 - conf));
            b = Math.round(255 * conf + 19 * (1 - conf));
          } else {
            const conf = (0.5 - score) * 2; // scale to 0..1
            r = Math.round(255 * conf + 6 * (1 - conf));
            g = Math.round(0 * conf + 9 * (1 - conf));
            b = Math.round(127 * conf + 19 * (1 - conf));
          }
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(gx * sizeX, gy * sizeY, sizeX + 0.5, sizeY + 0.5);
        }
      }
    }

    // Grid center axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.moveTo(0, this.height / 2);
    ctx.lineTo(this.width, this.height / 2);
    ctx.stroke();

    // 2. Draw Data Points
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
  window.forestLab = new ForestLab();
});
