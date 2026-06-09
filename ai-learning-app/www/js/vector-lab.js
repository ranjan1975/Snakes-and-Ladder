/**
 * Vector and Vector Database Visualizer
 */
class VectorLab {
  constructor() {
    this.canvas = document.getElementById('vector-canvas');
    if (!this.canvas) return;

    this.setupCanvas();
    
    // Vectors in grid units
    this.vecA = { x: 2.5, y: 3.5, color: '#00ffff', name: 'A' };
    this.vecB = { x: -3.0, y: 1.5, color: '#ff007f', name: 'B' };
    
    // Vector Database parameters
    this.documents = []; // Array of {x, y, id}
    this.searchResults = []; // Indices of top-K results
    this.isSearching = false;
    this.searchProgress = 0; // Animation counter
    
    this.draggedVec = null;
    this.scale = 30; // pixels per grid unit
    
    // UI Elements
    this.vecAVal = document.getElementById('vec-a-val');
    this.vecBVal = document.getElementById('vec-b-val');
    this.vecDotVal = document.getElementById('vec-dot-val');
    this.vecCosVal = document.getElementById('vec-cos-val');
    this.kSlider = document.getElementById('vdb-k-slider');
    this.kVal = document.getElementById('vdb-k-val');
    this.metricSelect = document.getElementById('vdb-metric');
    
    this.initEvents();
    this.generateRandomDocuments(15);
    this.updateHUD();
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
    
    // Re-scale on window resize
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
    // Mouse down / Touch start
    const startDrag = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      
      const gridPos = this.toGridCoords(mx, my);
      
      // Check if clicked near arrowhead of A or B (tolerance of 0.4 grid units)
      const distA = Math.hypot(gridPos.x - this.vecA.x, gridPos.y - this.vecA.y);
      const distB = Math.hypot(gridPos.x - this.vecB.x, gridPos.y - this.vecB.y);
      
      if (distA < 0.5) {
        this.draggedVec = this.vecA;
      } else if (distB < 0.5) {
        this.draggedVec = this.vecB;
      } else {
        // Otherwise, add a manual document vector on click
        this.documents.push({ x: parseFloat(gridPos.x.toFixed(2)), y: parseFloat(gridPos.y.toFixed(2)), id: Date.now() });
        this.searchResults = [];
        this.draw();
      }
    };

    // Mouse move / Touch move
    const moveDrag = (clientX, clientY) => {
      if (!this.draggedVec) return;
      const rect = this.canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      
      const gridPos = this.toGridCoords(mx, my);
      
      // Limit to bounds (-6 to +6)
      this.draggedVec.x = Math.max(-6, Math.min(6, parseFloat(gridPos.x.toFixed(2))));
      this.draggedVec.y = Math.max(-6, Math.min(6, parseFloat(gridPos.y.toFixed(2))));
      
      this.searchResults = [];
      this.updateHUD();
      this.draw();
    };

    const stopDrag = () => {
      this.draggedVec = null;
    };

    // Desktop Mouse listeners
    this.canvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', stopDrag);

    // iOS Touch listeners
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault(); // Prevent iOS scrolling while dragging
      }
    }, { passive: false });
    this.canvas.addEventListener('touchend', stopDrag);

    // K-Slider update
    if (this.kSlider) {
      this.kSlider.addEventListener('input', () => {
        this.kVal.textContent = this.kSlider.value;
        if (this.searchResults.length > 0) {
          this.executeSearch();
        }
      });
    }

    // Buttons
    document.getElementById('btn-vdb-add-docs').addEventListener('click', () => {
      this.generateRandomDocuments(15);
      this.searchResults = [];
      this.draw();
    });

    document.getElementById('btn-vdb-search').addEventListener('click', () => {
      this.animateSearch();
    });

    document.getElementById('btn-vdb-clear').addEventListener('click', () => {
      this.documents = [];
      this.searchResults = [];
      this.draw();
    });
  }

  toGridCoords(px, py) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    return {
      x: (px - cx) / this.scale,
      y: -(py - cy) / this.scale
    };
  }

  toPixelCoords(gx, gy) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    return {
      x: cx + gx * this.scale,
      y: cy - gy * this.scale
    };
  }

  generateRandomDocuments(count) {
    for (let i = 0; i < count; i++) {
      // Random coordinates between -5 and +5
      const rx = (Math.random() * 10 - 5);
      const ry = (Math.random() * 10 - 5);
      this.documents.push({
        x: parseFloat(rx.toFixed(2)),
        y: parseFloat(ry.toFixed(2)),
        id: Math.random().toString(36).substr(2, 9)
      });
    }
  }

  updateHUD() {
    const dot = this.vecA.x * this.vecB.x + this.vecA.y * this.vecB.y;
    const magA = Math.hypot(this.vecA.x, this.vecA.y);
    const magB = Math.hypot(this.vecB.x, this.vecB.y);
    const cosSim = magA * magB === 0 ? 0 : dot / (magA * magB);

    if (this.vecAVal) this.vecAVal.textContent = `[${this.vecA.x.toFixed(1)}, ${this.vecA.y.toFixed(1)}]`;
    if (this.vecBVal) this.vecBVal.textContent = `[${this.vecB.x.toFixed(1)}, ${this.vecB.y.toFixed(1)}]`;
    if (this.vecDotVal) this.vecDotVal.textContent = dot.toFixed(2);
    if (this.vecCosVal) this.vecCosVal.textContent = cosSim.toFixed(3);
  }

  executeSearch() {
    if (this.documents.length === 0) return;
    
    const k = parseInt(this.kSlider.value);
    const metric = this.metricSelect.value;
    const query = this.vecA; // Vector A (Cyan) is our query vector

    const listWithScore = this.documents.map((doc) => {
      let score = 0;
      if (metric === 'cosine') {
        // Cosine Similarity: A.B / (|A|*|B|)
        const dot = query.x * doc.x + query.y * doc.y;
        const magQ = Math.hypot(query.x, query.y);
        const magD = Math.hypot(doc.x, doc.y);
        score = (magQ * magD === 0) ? 0 : dot / (magQ * magD);
      } else {
        // Euclidean Distance: sqrt((x1-x2)^2 + (y1-y2)^2)
        score = Math.hypot(query.x - doc.x, query.y - doc.y);
      }
      return { doc, score };
    });

    // Sort: cosine similarity (highest first), euclidean distance (lowest first)
    if (metric === 'cosine') {
      listWithScore.sort((a, b) => b.score - a.score);
    } else {
      listWithScore.sort((a, b) => a.score - b.score);
    }

    // Keep top K document IDs
    this.searchResults = listWithScore.slice(0, k).map(item => item.doc.id);
  }

  animateSearch() {
    if (this.isSearching || this.documents.length === 0) return;
    this.isSearching = true;
    this.searchProgress = 0;
    this.searchResults = [];
    
    const runAnimation = () => {
      this.searchProgress += 0.04;
      if (this.searchProgress >= 1.0) {
        this.isSearching = false;
        this.executeSearch();
        this.draw();
      } else {
        this.draw();
        requestAnimationFrame(runAnimation);
      }
    };
    
    requestAnimationFrame(runAnimation);
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw Grid
    const cx = this.width / 2;
    const cy = this.height / 2;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = cx % this.scale; x < this.width; x += this.scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let y = cy % this.scale; y < this.height; y += this.scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Draw main axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.stroke();

    // Axis Labels
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('+X', this.width - 15, cy - 5);
    ctx.fillText('-X', 5, cy - 5);
    ctx.fillText('+Y', cx + 5, 15);
    ctx.fillText('-Y', cx + 5, this.height - 5);

    // Draw documents (Database)
    this.documents.forEach(doc => {
      const pos = this.toPixelCoords(doc.x, doc.y);
      const isMatch = this.searchResults.includes(doc.id);
      
      if (isMatch) {
        // Glowing target indicator
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffee32';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ffee32';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffee32';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }
    });

    // Draw Search radar wave (if searching)
    if (this.isSearching) {
      const posQ = this.toPixelCoords(this.vecA.x, this.vecA.y);
      const maxRadius = Math.max(this.width, this.height);
      const r = this.searchProgress * maxRadius;
      
      ctx.beginPath();
      ctx.arc(posQ.x, posQ.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw temporary radar sweeps to doc vectors inside radius
      this.documents.forEach(doc => {
        const posDoc = this.toPixelCoords(doc.x, doc.y);
        const dist = Math.hypot(posQ.x - posDoc.x, posQ.y - posDoc.y);
        if (dist <= r) {
          ctx.beginPath();
          ctx.moveTo(posQ.x, posQ.y);
          ctx.lineTo(posDoc.x, posDoc.y);
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
          ctx.stroke();
        }
      });
    }

    // Connect matches to Query (A) with glowing lines
    if (this.searchResults.length > 0 && !this.isSearching) {
      const posQ = this.toPixelCoords(this.vecA.x, this.vecA.y);
      this.documents.forEach(doc => {
        if (this.searchResults.includes(doc.id)) {
          const posDoc = this.toPixelCoords(doc.x, doc.y);
          ctx.beginPath();
          ctx.moveTo(posQ.x, posQ.y);
          ctx.lineTo(posDoc.x, posDoc.y);
          ctx.strokeStyle = 'rgba(255, 238, 50, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]); // reset
        }
      });
    }

    // Draw Vector A (Cyan)
    this.drawArrow(0, 0, this.vecA.x, this.vecA.y, this.vecA.color, this.vecA.name);

    // Draw Vector B (Pink)
    this.drawArrow(0, 0, this.vecB.x, this.vecB.y, this.vecB.color, this.vecB.name);

    // Draw helper projection vector A+B (dashed purple)
    const posA = this.toPixelCoords(this.vecA.x, this.vecA.y);
    const posSum = this.toPixelCoords(this.vecA.x + this.vecB.x, this.vecA.y + this.vecB.y);
    const posB = this.toPixelCoords(this.vecB.x, this.vecB.y);
    
    // Draw A + B arrow
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(posA.x, posA.y);
    ctx.lineTo(posSum.x, posSum.y);
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.5)';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(posB.x, posB.y);
    ctx.lineTo(posSum.x, posSum.y);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw resultant vector A+B
    this.drawArrow(0, 0, this.vecA.x + this.vecB.x, this.vecA.y + this.vecB.y, '#9d4edd', 'A+B');
  }

  drawArrow(fromX, fromY, toX, toY, color, label) {
    const ctx = this.ctx;
    const from = this.toPixelCoords(fromX, fromY);
    const to = this.toPixelCoords(toX, toY);
    
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 10; // length of head in pixels

    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    
    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw Label text
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(label, to.x + 8 * Math.cos(angle), to.y + 4 * Math.sin(angle) + 2);
  }
}

// Instantiate lab when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.vectorLab = new VectorLab();
});
