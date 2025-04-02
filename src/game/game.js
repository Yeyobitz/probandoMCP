import * as THREE from 'three';
import { Pet } from './pet.js';
import UserInterface from '../ui/interface.js';
import SaveSystem from './saveSystem.js';

export default class Game {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.defaultCameraPosition = new THREE.Vector3(0, 1, 3);
    this.defaultCameraTarget = new THREE.Vector3(0, 0.5, 0);
    
    // Create pet
    this.pet = new Pet(scene, 'Bitzy');
    
    // Initialize SaveSystem
    this.saveSystem = new SaveSystem(this);
    
    // Try to load saved game
    if (this.saveSystem.hasSaveData()) {
      this.saveSystem.loadGame();
    }
    
    // Initialize UI
    this.ui = new UserInterface(this);
    
    // Camera positions
    this.cameraPositions = {
      'default': {
        position: new THREE.Vector3(0, 1, 3),
        target: new THREE.Vector3(0, 0.5, 0)
      },
      'top-down': {
        position: new THREE.Vector3(0, 5, 0),
        target: new THREE.Vector3(0, 0, 0)
      },
      'first-person': {
        position: new THREE.Vector3(0, 0.8, 0.5),
        target: new THREE.Vector3(0, 0.5, -1)
      }
    };
    
    // Initialize game state
    this.state = {
      isPaused: false,
      lastSaveTime: Date.now(),
      saveInterval: 5 * 60 * 1000, // 5 minutes
      isAutoSaveEnabled: true
    };
  }
  
  /**
   * Update game state for each frame
   */
  update(deltaTime, isWindowFocused) {
    if (this.state.isPaused) return;
    
    // Update pet
    this.pet.update(deltaTime, isWindowFocused);
    
    // Update UI
    this.ui.update();
    
    // Check for auto-save
    if (this.state.isAutoSaveEnabled) {
      this.checkAutoSave();
    }
  }
  
  /**
   * Check if it's time to auto-save
   */
  checkAutoSave() {
    const currentTime = Date.now();
    if (currentTime - this.state.lastSaveTime > this.state.saveInterval) {
      this.saveGame();
      this.state.lastSaveTime = currentTime;
    }
  }
  
  /**
   * Save game state to local storage
   */
  saveGame() {
    const success = this.saveSystem.saveGame();
    if (success) {
      this.ui.showNotification('Juego guardado correctamente');
    } else {
      this.ui.showNotification('Error al guardar el juego', 5000);
    }
    return success;
  }
  
  /**
   * Load game state from local storage
   */
  loadGame() {
    const success = this.saveSystem.loadGame();
    if (success) {
      this.ui.showNotification('Juego cargado correctamente');
      this.ui.update(); // Force UI update with loaded data
    } else {
      this.ui.showNotification('Error al cargar el juego', 5000);
    }
    return success;
  }
  
  /**
   * Toggle auto-save feature
   */
  toggleAutoSave() {
    this.state.isAutoSaveEnabled = this.saveSystem.toggleAutoSave();
    const status = this.state.isAutoSaveEnabled ? 'activado' : 'desactivado';
    this.ui.showNotification(`Autoguardado ${status}`);
    return this.state.isAutoSaveEnabled;
  }
  
  /**
   * Pause the game
   */
  pauseGame() {
    this.state.isPaused = true;
  }
  
  /**
   * Resume the game
   */
  resumeGame() {
    this.state.isPaused = false;
  }
  
  /**
   * Switch between camera views
   */
  switchCamera(view) {
    if (!this.cameraPositions[view]) {
      console.warn(`Camera view "${view}" not found.`);
      return;
    }
    
    const cameraData = this.cameraPositions[view];
    
    // Store target reference to update controls later
    this.defaultCameraTarget.copy(cameraData.target);
    
    // Create animation to smoothly transition camera
    const startPosition = this.camera.position.clone();
    const endPosition = cameraData.position.clone();
    
    // Simple linear interpolation for demo
    // In production, use a proper tweening library or THREE.AnimationMixer
    const duration = 1000; // milliseconds
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Interpolate position
      this.camera.position.lerpVectors(startPosition, endPosition, progress);
      
      // Update camera target if needed
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        // Ensure final position is exactly what we want
        this.camera.position.copy(endPosition);
      }
    };
    
    animateCamera();
  }
} 