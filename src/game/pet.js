import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Import our custom pet glitch shaders
import petGlitchVertexShader from '../shaders/pet_glitch.vert?raw';
import petGlitchFragmentShader from '../shaders/pet_glitch.frag?raw';

export class Pet {
  constructor(scene, name = 'Bitzy') {
    this.scene = scene;
    this.name = name;
    this.model = null;
    this.mixer = null; // For animations
    this.animations = {};
    this.currentAnimation = null;
    
    // Pet attributes
    this.attributes = {
      health: 100,
      attack: 10,
      defense: 10,
      speed: 10,
      intelligence: 10
    };
    
    // Pet needs
    this.needs = {
      hunger: 100, // Full (100) to empty (0)
      happiness: 100,
      energy: 100
    };
    
    // Pet state
    this.state = 'idle'; // idle, walking, sleeping
    
    // Glitch intensity - can be modified based on pet status
    this.glitchIntensity = 0.2;
    
    // Load the pet model
    this.loadModel();
  }
  
  loadModel() {
    const loader = new GLTFLoader();
    
    // Add a debug cube to see where the pet should be positioned
    const debugGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.debugCube = new THREE.Mesh(debugGeometry, debugMaterial);
    this.debugCube.position.set(0, 0.5, 0); // Same position we want the pet at
    this.scene.add(this.debugCube);
    
    loader.load(
      'assets/pets/bitzy/Bitzy_0402020709_texture.glb',
      (gltf) => {
        this.model = gltf.scene;
        
        // Apply glitch shader to all meshes
        this.model.traverse((child) => {
          if (child.isMesh) {
            // Store original textures if they exist
            const map = child.material.map;
            
            // Create glitch shader material
            const glitchMaterial = new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 0.0 },
                uTexture: { value: map || new THREE.Texture() }
              },
              vertexShader: petGlitchVertexShader,
              fragmentShader: petGlitchFragmentShader,
              side: THREE.DoubleSide,
              transparent: true
            });
            
            // Replace material with our custom glitch shader material
            child.material = glitchMaterial;
          }
        });
        
        // Position the model
        this.model.position.set(0, 0.5, 0); // Raise the pet above the ground plane
        this.model.scale.set(0.5, 0.5, 0.5); // Reduce scale to make it more appropriate for scene
        
        // Add to scene
        this.scene.add(this.model);
        
        // Log model details
        console.log('Pet model details:', {
          position: this.model.position,
          scale: this.model.scale,
          meshCount: this.countMeshes(this.model),
          boundingBox: new THREE.Box3().setFromObject(this.model)
        });
        
        // Set up animations if they exist
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          
          // Store animations by name
          gltf.animations.forEach((clip) => {
            this.animations[clip.name] = this.mixer.clipAction(clip);
          });
          
          // Play idle animation by default
          if (this.animations['idle']) {
            this.playAnimation('idle');
          } else if (gltf.animations.length > 0) {
            // If no idle animation, play the first available one
            const firstAnimName = gltf.animations[0].name;
            this.playAnimation(firstAnimName);
          }
        }
        
        console.log('Pet model loaded:', this.name);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error loading pet model:', error);
      }
    );
  }
  
  playAnimation(name) {
    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }
    
    if (this.animations[name]) {
      this.currentAnimation = this.animations[name];
      this.currentAnimation.play();
      this.state = name;
    } else {
      console.warn(`Animation "${name}" not found!`);
    }
  }
  
  update(deltaTime) {
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    
    // Update pet position, behavior, etc.
    
    // Apply glitch effect
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh && child.material.uniforms) {
          child.material.uniforms.time.value += deltaTime;
          
          // Adjust glitch based on pet state
          // More glitches when hungry or unhappy
          if (this.needs.hunger < 30 || this.needs.happiness < 30) {
            // Intensify glitch for a visual indicator of distress
            this.glitchIntensity = 0.6;
          } else {
            // Normal glitch level
            this.glitchIntensity = 0.2;
          }
        }
      });
    }
    
    // Decrease needs over time (very slowly for now)
    this.needs.hunger = Math.max(0, this.needs.hunger - deltaTime * 0.05);
    this.needs.happiness = Math.max(0, this.needs.happiness - deltaTime * 0.03);
    this.needs.energy = Math.max(0, this.needs.energy - deltaTime * 0.02);
    
    // Change state based on needs
    this.updateState();
  }
  
  updateState() {
    // Change behavior based on needs
    if (this.needs.energy < 20) {
      // Pet is tired, should sleep
      if (this.state !== 'sleeping' && this.animations['sleeping']) {
        this.playAnimation('sleeping');
      }
    } else if (this.needs.happiness < 30) {
      // Pet is sad, might act differently
      // For now, just keep idle animation
      if (this.state !== 'idle' && this.animations['idle']) {
        this.playAnimation('idle');
      }
    } else {
      // Pet is generally okay
      // Randomly walk around
      if (Math.random() < 0.005 && this.state !== 'walking' && this.animations['walking']) {
        this.playAnimation('walking');
      } else if (Math.random() < 0.01 && this.state === 'walking' && this.animations['idle']) {
        this.playAnimation('idle');
      }
    }
  }
  
  // Methods to interact with the pet
  feed(amount) {
    this.needs.hunger = Math.min(100, this.needs.hunger + amount);
    console.log(`${this.name} has been fed! Hunger: ${this.needs.hunger}`);
  }
  
  play() {
    this.needs.happiness = Math.min(100, this.needs.happiness + 15);
    this.needs.energy = Math.max(0, this.needs.energy - 5);
    console.log(`Played with ${this.name}! Happiness: ${this.needs.happiness}`);
  }
  
  rest() {
    this.needs.energy = Math.min(100, this.needs.energy + 30);
    this.playAnimation('sleeping');
    console.log(`${this.name} is resting. Energy: ${this.needs.energy}`);
  }
  
  // Helper to count meshes
  countMeshes(object) {
    let count = 0;
    object.traverse((child) => {
      if (child.isMesh) {
        count++;
      }
    });
    return count;
  }
} 