/**
 * K-Means Clustering Visualizer Lab
 */
class KMeansLab {
  constructor() {
    this.canvas = document.getElementById('kmeans-canvas');
    if (!this.canvas) return;

    this.setupCanvas();
    
    // Configurations
    this.k = 3;
    this.points = []; // {x, y, cluster: -1}
    this.centroids = []; // {x, y, color, targetX, targetY}
    
    // Colors for clusters (Cyan, Pink, Green, Yellow, Purple)
    this.clusterColors = ['#00ffff', '#ff007f', '#39ff14', '#ffee32', '#9d4edd'];
    
    // Algorithm State
    // States: 'ready', 'assignment', 'update', 'converged'
    this.state = 'ready';
    
    // Centroid gliding animation states
    this.isAnimating = false;
    this.animationProgress = 0;
    
    // Auto-step timer
    this.autoRunInterval = null;
    this.isAutoRunning = false;
    
    // UI Elements
    this.kSlider = document.getElementById('kmeans-k-slider');
    this.kVal = document.getElementById('kmeans-k-val');
    this.btnStep = document.getElementById('btn-kmeans-step');
    this.btnRun = document.getElementById('btn-kmeans-run');
    this.btnReset = document.getElementById('btn-kmeans-reset');
    this.btnGenerate = document.getElementById('btn-kmeans-generate');
    this.btnClear = document.getElementById('btn-kmeans-clear');
    
    this.stepLabel = document.getElementById('kmeans-step-label');
    this.stepExplain = document.getElementById('kmeans-step-explain');
    
    this.initEvents();
    this.reset();
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
    // K Slider
    if (this.kSlider) {
      this.kSlider.addEventListener('input', () => {
        this.k = parseInt(this.kSlider.value);
        this.kVal.textContent = this.k;
        this.reset();
      });
    }

    // Step button
    this.btnStep.addEventListener('click', () => {
      this.nextStep();
    });

    // Auto Play / Pause
    this.btnRun.addEventListener('click', () => {
      if (this.isAutoRunning) {
        this.pauseAutoRun();
      } else {
        this.startAutoRun();
      }
    });

    // Reset
    this.btnReset.addEventListener('click', () => {
      this.reset();
    });

    // Generate Random Points
    this.btnGenerate.addEventListener('click', () => {
      this.generatePoints(45);
      this.state = 'ready';
      this.centroids = [];
      this.initializeCentroids();
      this.updateHUD();
      this.draw();
    });

    // Clear Canvas
    this.btnClear.addEventListener('click', () => {
      this.points = [];
      this.centroids = [];
      this.state = 'ready';
      this.updateHUD();
      this.draw();
    });

    // Place points manually on click/touch
    const addPoint = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      
      this.points.push({ x: px, y: py, cluster: -1 });
      
      if (this.state === 'converged') {
        this.state = 'ready';
        this.points.forEach(p => p.cluster = -1);
      }
      
      this.updateHUD();
      this.draw();
    };

    this.canvas.addEventListener('mousedown', (e) => addPoint(e.clientX, e.clientY));
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
  }

  reset() {
    this.pauseAutoRun();
    this.state = 'ready';
    this.points.forEach(p => p.cluster = -1);
    this.centroids = [];
    
    if (this.points.length === 0) {
      this.generatePoints(45);
    }
    
    this.initializeCentroids();
    this.updateHUD();
    this.draw();
  }

  generatePoints(count) {
    this.points = [];
    
    // Generate 3 random Gaussians to make clusters obvious
    const clustersCount = 3;
    const centers = [
      { x: this.width * 0.3, y: this.height * 0.3 },
      { x: this.width * 0.7, y: this.height * 0.4 },
      { x: this.width * 0.4, y: this.height * 0.75 }
    ];
    
    for (let i = 0; i < count; i++) {
      const cIdx = i % clustersCount;
      const center = centers[cIdx];
      
      // Box-Muller transform for normal distribution
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const r = Math.sqrt(-2.0 * Math.log(u1)) * 45; // spread
      const theta = 2.0 * Math.PI * u2;
      
      const px = center.x + r * Math.cos(theta);
      const py = center.y + r * Math.sin(theta);
      
      // Clamp bounds
      this.points.push({
        x: Math.max(15, Math.min(this.width - 15, px)),
        y: Math.max(15, Math.min(this.height - 15, py)),
        cluster: -1
      });
    }
  }

  initializeCentroids() {
    if (this.points.length === 0) return;
    
    this.centroids = [];
    
    // Standard K-Means++ style initialization: pick random points from dataset to prevent co-location
    const usedIndices = new Set();
    for (let i = 0; i < this.k; i++) {
      let rIdx = 0;
      let attempts = 0;
      do {
        rIdx = Math.floor(Math.random() * this.points.length);
        attempts++;
      } while (usedIndices.has(rIdx) && attempts < 100);
      
      usedIndices.add(rIdx);
      const pt = this.points[rIdx];
      
      this.centroids.push({
        x: pt.x,
        y: pt.y,
        targetX: pt.x,
        targetY: pt.y,
        color: this.clusterColors[i % this.clusterColors.length]
      });
    }
  }

  nextStep() {
    if (this.points.length === 0 || this.centroids.length === 0 || this.isAnimating) return;

    if (this.state === 'ready' || this.state === 'update') {
      this.assignPoints();
      this.state = 'assignment';
    } else if (this.state === 'assignment') {
      const changed = this.updateCentroids();
      if (changed) {
        this.state = 'update';
      } else {
        this.state = 'converged';
        this.pauseAutoRun();
      }
    } else if (this.state === 'converged') {
      this.reset();
    }
    
    this.updateHUD();
    this.draw();
  }

  assignPoints() {
    this.points.forEach(p => {
      let minDist = Infinity;
      let clusterIdx = -1;
      
      this.centroids.forEach((c, idx) => {
        const d = Math.hypot(p.x - c.x, p.y - c.y);
        if (d < minDist) {
          minDist = d;
          clusterIdx = idx;
        }
      });
      p.cluster = clusterIdx;
    });
  }

  updateCentroids() {
    let changed = false;
    
    this.centroids.forEach((c, idx) => {
      const clusterPoints = this.points.filter(p => p.cluster === idx);
      if (clusterPoints.length === 0) return; // leave centroid where it is
      
      // Center of mass
      let sumX = 0;
      let sumY = 0;
      clusterPoints.forEach(p => {
        sumX += p.x;
        sumY += p.y;
      });
      
      const avgX = sumX / clusterPoints.length;
      const avgY = sumY / clusterPoints.length;
      
      // Check if centroid actually moved (tolerance of 0.5 pixels)
      if (Math.hypot(c.x - avgX, c.y - avgY) > 0.5) {
        c.targetX = avgX;
        c.targetY = avgY;
        changed = true;
      }
    });

    if (changed) {
      this.animateCentroidGlide();
    }
    
    return changed;
  }

  animateCentroidGlide() {
    this.isAnimating = true;
    this.animationProgress = 0;
    
    // Capture starting position
    const starts = this.centroids.map(c => ({ x: c.x, y: c.y }));
    
    const glide = () => {
      this.animationProgress += 0.08;
      
      if (this.animationProgress >= 1.0) {
        this.centroids.forEach(c => {
          c.x = c.targetX;
          c.y = c.targetY;
        });
        this.isAnimating = false;
        this.draw();
        
        // If auto running, schedule next state automatically
        if (this.isAutoRunning) {
          setTimeout(() => this.nextStep(), 300);
        }
      } else {
        // Linear interpolation
        this.centroids.forEach((c, idx) => {
          c.x = starts[idx].x + (c.targetX - starts[idx].x) * this.animationProgress;
          c.y = starts[idx].y + (c.targetY - starts[idx].y) * this.animationProgress;
        });
        this.draw();
        requestAnimationFrame(glide);
      }
    };
    
    requestAnimationFrame(glide);
  }

  startAutoRun() {
    this.isAutoRunning = true;
    this.btnRun.textContent = 'Pause ⏸';
    this.btnRun.classList.remove('btn-secondary');
    this.btnRun.classList.add('btn-primary');
    
    const tick = () => {
      if (!this.isAutoRunning) return;
      if (this.state === 'converged') {
        this.pauseAutoRun();
        return;
      }
      
      if (!this.isAnimating) {
        this.nextStep();
      }
      
      if (!this.isAnimating && this.isAutoRunning) {
        this.autoRunInterval = setTimeout(tick, 700);
      }
    };
    
    tick();
  }

  pauseAutoRun() {
    this.isAutoRunning = false;
    clearTimeout(this.autoRunInterval);
    this.btnRun.textContent = 'Auto ⏯';
    this.btnRun.classList.remove('btn-primary');
    this.btnRun.classList.add('btn-secondary');
  }

  updateHUD() {
    if (this.state === 'ready') {
      this.stepLabel.textContent = 'Step: Initialize Centroids';
      this.stepExplain.textContent = `${this.k} centroids have been spawned randomly. Click "Next Step" to partition points.`;
      this.btnStep.textContent = 'Assign Clusters ➔';
    } else if (this.state === 'assignment') {
      this.stepLabel.textContent = 'Step: Recalculate Centers';
      this.stepExplain.textContent = 'Points are assigned to their nearest color. Click "Next Step" to recalculate average positions.';
      this.btnStep.textContent = 'Update Centroids ➔';
    } else if (this.state === 'update') {
      this.stepLabel.textContent = 'Step: Re-assign Points';
      this.stepExplain.textContent = 'Centroids have glided to cluster averages. Click "Next Step" to re-partition boundaries.';
      this.btnStep.textContent = 'Assign Clusters ➔';
    } else if (this.state === 'converged') {
      this.stepLabel.textContent = 'Algorithm Converged! 🎉';
      this.stepExplain.textContent = 'No points changed clusters in the last step. The centroids have stabilized completely.';
      this.btnStep.textContent = 'Reset 🔄';
    }
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    
    // 1. Draw Voronoi Boundaries (Background partitioning)
    if (this.centroids.length > 0 && (this.state !== 'ready')) {
      const gridRes = 60; // downscaled grid resolution
      const sizeX = this.width / gridRes;
      const sizeY = this.height / gridRes;
      
      for (let gx = 0; gx < gridRes; gx++) {
        for (let gy = 0; gy < gridRes; gy++) {
          const px = gx * sizeX + sizeX / 2;
          const py = gy * sizeY + sizeY / 2;
          
          // Find nearest centroid
          let minDist = Infinity;
          let nearestIdx = -1;
          
          this.centroids.forEach((c, idx) => {
            const d = Math.hypot(px - c.x, py - c.y);
            if (d < minDist) {
              minDist = d;
              nearestIdx = idx;
            }
          });
          
          // Paint region with translucent cluster color
          const cColor = this.clusterColors[nearestIdx % this.clusterColors.length];
          
          // Convert hex to rgb for opacity blending
          const r = parseInt(cColor.slice(1, 3), 16);
          const g = parseInt(cColor.slice(3, 5), 16);
          const b = parseInt(cColor.slice(5, 7), 16);
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.05)`;
          ctx.fillRect(gx * sizeX, gy * sizeY, sizeX + 0.5, sizeY + 0.5);
        }
      }
    }

    // 2. Draw assignment connections (dashed lines, visible in assignment step)
    if (this.state === 'assignment' && !this.isAnimating) {
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      
      this.points.forEach(p => {
        if (p.cluster === -1) return;
        const c = this.centroids[p.cluster];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = c.color + '44'; // Translucent color hex suffix
        ctx.stroke();
      });
      
      ctx.setLineDash([]); // reset
    }

    // 3. Draw Data Points
    this.points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      
      if (p.cluster === -1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      } else {
        const color = this.clusterColors[p.cluster % this.clusterColors.length];
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
      }
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();
    });

    // 4. Draw Centroids
    this.centroids.forEach((c, idx) => {
      // Draw outer glowing halo ring
      ctx.beginPath();
      ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      
      // Draw inner target indicator
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0; // reset
      ctx.fill();
      
      // Draw crosshair lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.moveTo(c.x - 7, c.y); ctx.lineTo(c.x + 7, c.y);
      ctx.moveTo(c.x, c.y - 7); ctx.lineTo(c.x, c.y + 7);
      ctx.stroke();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.kmeansLab = new KMeansLab();
});
