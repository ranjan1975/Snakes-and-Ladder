/**
 * Custom Neural Network Engine for 2D Classification Visualization
 */

class NeuralNetwork {
  constructor(layerSizes, activationType = 'tanh') {
    this.layerSizes = layerSizes; // Array of integers: [inputSize, hidden1, ..., outputSize]
    this.activationType = activationType; // 'sigmoid', 'tanh', 'relu'
    this.weights = []; // Array of 2D arrays (matrices)
    this.biases = []; // Array of 1D arrays (vectors)
    
    this.initParameters();
  }

  /**
   * Initializes weights using Xavier/Glorot Normal distribution
   * and biases to zero.
   */
  initParameters() {
    this.weights = [];
    this.biases = [];
    
    for (let i = 1; i < this.layerSizes.length; i++) {
      const nIn = this.layerSizes[i - 1];
      const nOut = this.layerSizes[i];
      
      // Xavier / Glorot weight limit calculation
      const limit = Math.sqrt(6.0 / (nIn + nOut));
      
      const layerWeights = [];
      for (let row = 0; row < nOut; row++) {
        const rowWeights = [];
        for (let col = 0; col < nIn; col++) {
          // Uniform random distribution between -limit and +limit
          rowWeights.push((Math.random() * 2 - 1) * limit);
        }
        layerWeights.push(rowWeights);
      }
      this.weights.push(layerWeights);
      
      const layerBiases = [];
      for (let row = 0; row < nOut; row++) {
        layerBiases.push(0.0);
      }
      this.biases.push(layerBiases);
    }
  }

  /**
   * Activation functions
   */
  activate(z, type) {
    if (type === 'sigmoid') return 1.0 / (1.0 + Math.exp(-z));
    if (type === 'tanh') return Math.tanh(z);
    if (type === 'relu') return Math.max(0.0, z);
    return z;
  }

  /**
   * Derivative of activation functions, calculated in terms of activation (a)
   */
  activateDerivative(a, type) {
    if (type === 'sigmoid') return a * (1.0 - a);
    if (type === 'tanh') return 1.0 - a * a;
    if (type === 'relu') return a > 0.0 ? 1.0 : 0.0;
    return 1.0;
  }

  /**
   * Forward Propagation
   * Returns predictions along with intermediate outputs for backprop
   */
  forward(inputs) {
    let currentActivations = [...inputs];
    const allActivations = [currentActivations];
    const allZs = [[]]; // Input layer has no Z (pre-activation) values
    
    const numLayers = this.weights.length;
    for (let i = 0; i < numLayers; i++) {
      const W = this.weights[i];
      const b = this.biases[i];
      const nextActivations = [];
      const nextZs = [];
      
      for (let row = 0; row < W.length; row++) {
        let z = b[row];
        for (let col = 0; col < W[row].length; col++) {
          z += W[row][col] * currentActivations[col];
        }
        nextZs.push(z);
        
        // Output layer is always sigmoid for binary probability [0, 1]
        const actType = (i === numLayers - 1) ? 'sigmoid' : this.activationType;
        nextActivations.push(this.activate(z, actType));
      }
      
      allZs.push(nextZs);
      allActivations.push(nextActivations);
      currentActivations = nextActivations;
    }
    
    return {
      output: currentActivations,
      activations: allActivations,
      zs: allZs
    };
  }

  /**
   * Performs Backpropagation and updates model parameters using Stochastic Gradient Descent (SGD)
   * Returns Mean Squared Error (MSE) loss for the input example
   */
  backward(inputs, target, learningRate = 0.05) {
    const { output, activations, zs } = this.forward(inputs);
    const L = this.weights.length; // Number of layers
    const deltas = new Array(L);
    
    // Output Layer Error (Mean Squared Error: Loss = 0.5 * (output - target)^2)
    // Derivative of Loss w.r.t Output: dL/dOut = out - target
    // Output layer uses sigmoid activation, so dOut/dZ = out * (1 - out)
    const outAct = activations[L][0];
    const error = outAct - target;
    const outputDelta = error * this.activateDerivative(outAct, 'sigmoid');
    deltas[L - 1] = [outputDelta];
    
    // Propagate deltas backwards through hidden layers
    for (let l = L - 2; l >= 0; l--) {
      const W_next = this.weights[l + 1];
      const delta_next = deltas[l + 1];
      const layerDeltas = [];
      
      const layerSize = this.layerSizes[l + 1];
      const act = activations[l + 1];
      
      for (let i = 0; i < layerSize; i++) {
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
      const prevActivations = activations[l];
      
      for (let row = 0; row < W.length; row++) {
        for (let col = 0; col < W[row].length; col++) {
          W[row][col] -= learningRate * delta[row] * prevActivations[col];
        }
        b[row] -= learningRate * delta[row];
      }
    }
    
    // Return Loss (0.5 * error^2)
    return 0.5 * error * error;
  }

  /**
   * Evaluates a single training sample and returns detailed math trace data
   * for the visual flow debugger, without updating any parameters.
   */
  getDetailedStepData(inputs, target) {
    const { output, activations, zs } = this.forward(inputs);
    const L = this.weights.length; // Number of layers
    const deltas = new Array(L);
    
    // Output Layer Delta
    const outAct = activations[L][0];
    const error = outAct - target;
    const outputDelta = error * this.activateDerivative(outAct, 'sigmoid');
    deltas[L - 1] = [outputDelta];
    
    // Backprop layer deltas
    for (let l = L - 2; l >= 0; l--) {
      const W_next = this.weights[l + 1];
      const delta_next = deltas[l + 1];
      const layerDeltas = [];
      const layerSize = this.layerSizes[l + 1];
      const act = activations[l + 1];
      
      for (let i = 0; i < layerSize; i++) {
        let sum = 0.0;
        for (let j = 0; j < W_next.length; j++) {
          sum += W_next[j][i] * delta_next[j];
        }
        const delta = sum * this.activateDerivative(act[i], this.activationType);
        layerDeltas.push(delta);
      }
      deltas[l] = layerDeltas;
    }

    // Weight gradients (dW) and bias gradients (db)
    const dW = [];
    const db = [];
    for (let l = 0; l < L; l++) {
      const W = this.weights[l];
      const delta = deltas[l];
      const prevActivations = activations[l];
      
      const layerDw = [];
      for (let row = 0; row < W.length; row++) {
        const rowDw = [];
        for (let col = 0; col < W[row].length; col++) {
          rowDw.push(delta[row] * prevActivations[col]);
        }
        layerDw.push(rowDw);
      }
      dW.push(layerDw);
      db.push([...delta]);
    }

    return {
      inputs,
      target,
      output: outAct,
      loss: 0.5 * error * error,
      zs,
      activations,
      deltas,
      dW,
      db
    };
  }
}
