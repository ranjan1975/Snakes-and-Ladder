# 🌌 Cyber-Neon Snakes & Ladders & Neural Classifier Lab

Welcome to the **Snakes and Ladder** repository! This project houses two interactive, premium, glassmorphic web applications built with pure vanilla technologies:
1. **Cyber Snakes & Ladders** — A futuristic 3D neon edition of the classic board game.
2. **Cyber Neural Classifier Lab** — An interactive visualizer demonstrating neural network backpropagation in real-time.

Both apps feature vibrant cyber aesthetics, smooth CSS/SVG micro-animations, and synthesized audio experiences via the Web Audio API.

---

## 🎮 1. Cyber Snakes & Ladders

A high-fidelity, interactive multiplayer board game.

### Features
* **CSS 3D Dice**: An interactive, rotating cube with bounce/shake physics and natural landing alignments.
* **Animated SVG Snakes**: Curvy snakes with glowing red eyes, dynamic viper heads, and flickering split-tongues calculated using tangent math.
* **Step-by-Step Movement**: Player tokens walk cell-by-cell along the grid path with custom walking sound effects.
* **Smart Overlap Ring Solver**: Arranges multiple players landing on the same square in an even circle so all players remain visible.
* **Audio Synthesizer**: Custom retro synthesized sound effects (rattlesnake vipers, ladder climbs, wins).
* **Atmospheric Background Music**: A procedural, arpeggiated music generator that plays a relaxing, ambient retro-wave loop in the background.
* **Simulated Bots**: Play against computer players with human-like turn delays.

---

## 🧠 2. Cyber Neural Lab

An interactive playground that visualizes how neural networks classify 2D datasets.

### Features
* **Custom Architecture**: Dynamically add/remove up to 3 hidden layers and adjust neuron count (1 to 8) per layer with live visual node updates.
* **Decision Boundary Mapping**: High-speed canvas contour shading that renders the network's prediction confidence at every pixel in real-time.
* **Interactive Datasets**: Click directly on the canvas to place custom training points (Class A or Class B), or load XOR, Circle, and Gaussian presets.
* **Connection Weight Graph**: SVG rendering of weights (thickness mapped to size, color mapped to weight sign: cyan for positive, rose for negative).
* **Acoustic Loss Hum**: Synthesizes a triangle wave hum whose frequency drops as training loss decreases, creating a sonic sense of model training.
* **Math Flow Debugger**: A step-by-step visual debugger that allows you to step through the exact formulas of Forward and Backpropagation with slow-motion SVG pulses.

---

## 🛠️ Repository File Structure

* `index.html` - Game page structure and HUD.
* `styles.css` - 3D scenes, cyber neon theme, layout, and glows.
* `game.js` - Grid mechanics, coordinate calculations, and turn logic.
* `sound.js` - Procedural audio oscillators and synthesized sound effects.
* `ui.js` - SVG rendering, board layouts, dice roll routines, and token animations.
* `Footstep_Walking_Concrete_03.wav` - Custom walking sound asset.
* `ai-demo/` - Subfolder containing the Neural Classifier Lab (HTML, CSS, JS network code, and visual layout).
* `.gitignore` - Configured to exclude heavy package files (like `node_modules/`).

---

## 🚀 How to Run Locally

To play locally, serve the directory using any web server. For example, using Python:

```bash
python3 -m http.server 8000
```

Then open your browser to:
* **Board Game**: [http://localhost:8000](http://localhost:8000)
* **Neural Lab**: [http://localhost:8000/ai-demo/](http://localhost:8000/ai-demo/)

---

## 🌐 Deploying to GitHub Pages

To make the repository live for your friends:
1. Go to your repository settings page on GitHub.
2. Click on **Pages** in the left sidebar.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Select **`main`** as the branch, keep `/ (root)` selected, and click **Save**.
5. Refresh the page after 1 minute to receive your live web URL!
