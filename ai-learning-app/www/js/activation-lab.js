/**
 * Activation Functions and Vanishing Gradient Simulator
 */
class ActivationLab {
  constructor() {
    this.canvas = document.getElementById('activation-canvas');
    if (!this.canvas) return;

    this.setupCanvas();
    
    this.activeFunc = 'sigmoid'; // Default
    this.currentZ = 0.0;
    
    // Gradient chain configuration
    this.chainZ = [2.5, 2.5, 2.5, 2.5, 2.5]; // Inputs that cause saturation (for sigmoid)
    
    // UI Elements
    this.zSlider = document.getElementById('act-z-slider');
    this.firingNodeLabel = document.getElementById('firing-node-label');
    this.firingActVal = document.getElementById('firing-act-val');
    this.firingDerivVal = document.getElementById('firing-deriv-val');
    this.firingNodeInner = document.getElementById('firing-node-inner');
    this.gradientChainContainer = document.getElementById('gradient-chain');
    this.btnBackprop = document.getElementById('btn-act-backprop');
    
    this.initEvents();
    this.renderGradientChain();
    this.updateNodeHUD();
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
    // Preset activation function buttons
    const presetBtns = document.querySelectorAll('#lab-activations .preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFunc = btn.getAttribute('data-act');
        
        // Adjust default saturation inputs for vanishing gradient demo
        // Sigmoid/Tanh saturate around +/-3, so set them to high inputs (like 2.5) to showcase decay.
        // ReLU does not decay for positive inputs.
        if (this.activeFunc === 'sigmoid' || this.activeFunc === 'tanh') {
          this.chainZ = [2.0, 2.5, 3.0, 2.0, 2.5];
        } else {
          this.chainZ = [1.5, 1.5, 1.5, 1.5, 1.5]; // Active range for ReLU
        }
        
        this.renderGradientChain();
        this.updateNodeHUD();
        this.draw();
      });
    });

    // Slider listener
    if (this.zSlider) {
      this.zSlider.addEventListener('input', () => {
        this.currentZ = parseFloat(this.zSlider.value);
        this.updateNodeHUD();
        this.draw();
      });
    }

    // Trigger backpropagation signal animation
    if (this.btnBackprop) {
      this.btnBackprop.addEventListener('click', () => {
        this.animateBackpropagation();
      });
    }
  }

  // Math definitions
  activate(z, type = this.activeFunc) {
    if (type === 'sigmoid') return 1.0 / (1.0 + Math.exp(-z));
    if (type === 'tanh') return Math.tanh(z);
    if (type === 'relu') return Math.max(0.0, z);
    if (type === 'leaky-relu') return z > 0 ? z : 0.05 * z;
    return z;
  }

  derivative(z, type = this.activeFunc) {
    if (type === 'sigmoid') {
      const a = this.activate(z, 'sigmoid');
      return a * (1.0 - a);
    }
    if (type === 'tanh') {
      const a = this.activate(z, 'tanh');
      return 1.0 - a * a;
    }
    if (type === 'relu') return z > 0 ? 1.0 : 0.0;
    if (type === 'leaky-relu') return z > 0 ? 1.0 : 0.05;
    return 1.0;
  }

  updateNodeHUD() {
    const act = this.activate(this.currentZ);
    const deriv = this.derivative(this.currentZ);

    if (this.firingNodeLabel) this.firingNodeLabel.textContent = `Z = ${this.currentZ.toFixed(1)}`;
    if (this.firingActVal) this.firingActVal.textContent = act.toFixed(2);
    if (this.firingDerivVal) this.firingDerivVal.textContent = deriv.toFixed(2);
    
    // Glow/Opacity of firing node
    if (this.firingNodeInner) {
      let opacity = 0;
      if (this.activeFunc === 'sigmoid') opacity = act;
      else if (this.activeFunc === 'tanh') opacity = (act + 1) / 2; // scale -1..1 to 0..1
      else opacity = Math.min(1.0, act / 4); // ReLU can be > 1
      
      this.firingNodeInner.style.opacity = opacity;
      this.firingNodeInner.style.transform = `scale(${0.4 + opacity * 0.5})`;
    }
  }

  renderGradientChain() {
    if (!this.gradientChainContainer) return;
    
    this.gradientChainContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
      const node = document.createElement('div');
      node.className = 'chain-node';
      node.setAttribute('data-layer', `L${i+1}`);
      node.style.borderColor = 'var(--text-dim)';
      
      // Calculate local derivative at node
      const z = this.chainZ[i];
      const deriv = this.derivative(z);
      
      // Node tooltip to display the local input & derivative
      node.title = `Layer ${i+1}: z=${z}, f'(z)=${deriv.toFixed(2)}`;
      
      this.gradientChainContainer.appendChild(node);
      
      if (i < 4) {
        const conn = document.createElement('div');
        conn.className = 'chain-connection';
        conn.id = `chain-conn-${i}`;
        this.gradientChainContainer.appendChild(conn);
      }
    }
  }

  animateBackpropagation() {
    // We want to animate a pulse traveling backwards from L5 to L1.
    // Calculate final gradient magnitudes at each layer.
    // Let starting gradient (dL/dy) = 1.0
    // L5 gradient = 1.0 * f'(z_5)
    // L4 gradient = L5_grad * f'(z_4)
    // etc.
    const grads = [];
    let currentGrad = 1.0;
    
    for (let i = 4; i >= 0; i--) {
      const z = this.chainZ[i];
      const deriv = this.derivative(z);
      currentGrad *= deriv;
      grads.unshift(currentGrad); // Put at start of array to match L1 -> L5 order
    }
    
    // Animate backward pulse
    // We'll create a temporary absolute pulse element and glide it across the chain container
    const pulse = document.createElement('div');
    pulse.className = 'chain-pulse';
    this.gradientChainContainer.appendChild(pulse);
    
    const nodes = this.gradientChainContainer.querySelectorAll('.chain-node');
    const conns = this.gradientChainContainer.querySelectorAll('.chain-connection');
    
    // Clear active classes
    nodes.forEach(n => n.classList.remove('chain-node-active'));
    conns.forEach(c => c.classList.remove('chain-connection-active'));
    
    let currentStep = 4; // Start at Layer 5 (index 4)
    
    const stepAnimation = () => {
      if (currentStep < 0) {
        // Remove pulse when done
        setTimeout(() => pulse.remove(), 400);
        return;
      }
      
      // Highlight node
      nodes[currentStep].classList.add('chain-node-active');
      
      // Set pulse size and intensity based on the gradient at this layer
      const g = grads[currentStep];
      const size = Math.max(6, Math.min(24, 8 + g * 12));
      const opacity = Math.max(0.1, Math.min(1.0, 0.2 + g * 0.8));
      
      pulse.style.width = `${size}px`;
      pulse.style.height = `${size}px`;
      pulse.style.opacity = opacity;
      pulse.style.backgroundColor = this.activeFunc === 'relu' ? 'var(--neon-cyan)' : 'var(--neon-pink)';
      pulse.style.boxShadow = `0 0 10px ${pulse.style.backgroundColor}`;
      
      // Position pulse at current node
      const nodeRect = nodes[currentStep].getBoundingClientRect();
      const containerRect = this.gradientChainContainer.getBoundingClientRect();
      const posX = nodeRect.left - containerRect.left + nodeRect.width / 2;
      pulse.style.left = `${posX}px`;
      
      // Activate previous connection line
      if (currentStep > 0) {
        conns[currentStep - 1].classList.add('chain-connection-active');
      }
      
      currentStep--;
      setTimeout(stepAnimation, 250);
    };
    
    stepAnimation();
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    
    const cx = this.width / 2;
    const cy = this.height / 2;
    
    const scaleX = this.width / 12; // grid range -6 to +6
    const scaleY = this.height / 3; // grid range -1.5 to +1.5

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    
    // Vertical grid
    for (let x = -6; x <= 6; x += 1) {
      const px = cx + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, this.height);
      ctx.stroke();
    }
    // Horizontal grid
    for (let y = -1.5; y <= 1.5; y += 0.5) {
      const py = cy - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(this.width, py);
      ctx.stroke();
    }

    // Main axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.stroke();

    // Plot functions
    const pointsCount = 100;
    
    // 1. Draw Activation function (Neon Cyan)
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    
    for (let i = 0; i <= pointsCount; i++) {
      const gx = -6 + (12 * i) / pointsCount;
      const gy = this.activate(gx);
      const px = cx + gx * scaleX;
      const py = cy - gy * scaleY;
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // 2. Draw Derivative function (Neon Pink, dashed)
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 2;
    ctx.beginPath();
    
    for (let i = 0; i <= pointsCount; i++) {
      const gx = -6 + (12 * i) / pointsCount;
      const gy = this.derivative(gx);
      const px = cx + gx * scaleX;
      const py = cy - gy * scaleY;
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset
    ctx.shadowBlur = 0;

    // Draw active tracer dot on Activation Curve
    const traceActY = this.activate(this.currentZ);
    const traceDerivY = this.derivative(this.currentZ);
    const pxTracer = cx + this.currentZ * scaleX;
    const pyTracer = cy - traceActY * scaleY;

    // Glow ring
    ctx.beginPath();
    ctx.arc(pxTracer, pyTracer, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Solid dot
    ctx.beginPath();
    ctx.arc(pxTracer, pyTracer, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffff';
    ctx.fill();

    // Draw tangent line slope representing derivative
    // Tangent equation: y - act = derivative * (x - z) -> y = derivative * (x - z) + act
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const xLeft = this.currentZ - 1.5;
    const xRight = this.currentZ + 1.5;
    const yLeft = traceDerivY * (xLeft - this.currentZ) + traceActY;
    const yRight = traceDerivY * (xRight - this.currentZ) + traceActY;
    
    ctx.moveTo(cx + xLeft * scaleX, cy - yLeft * scaleY);
    ctx.lineTo(cx + xRight * scaleX, cy - yRight * scaleY);
    ctx.stroke();

    // Labels info inside canvas
    ctx.font = '10px Space Grotesk, sans-serif';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('Activation f(z)', 15, 20);
    
    ctx.fillStyle = '#ff007f';
    ctx.fillText("Derivative f'(z)", 15, 35);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.activationLab = new ActivationLab();
});
