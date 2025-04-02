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
    
    // Animation parameters
    this.walkSpeed = 0.5;
    this.walkDirection = new THREE.Vector3(1, 0, 0);
    this.walkBounds = { minX: -2, maxX: 2, minZ: -2, maxZ: 2 };
    this.walkTarget = new THREE.Vector3(0, 0.5, 0);
    this.idleTimer = 0;
    this.idleAnimationTime = 0;
    
    // Path following
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.pathComplexity = { min: 3, max: 6 }; // Min/max number of waypoints in a path
    this.showPathVisualization = true; // Toggle for showing path visualization
    this.pathVisualization = [];
    
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
                glitchIntensity: { value: this.glitchIntensity },
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
          
          console.log('Found animations:', Object.keys(this.animations));
          
          // Play idle animation by default
          if (this.animations['idle']) {
            this.playAnimation('idle');
          } else if (gltf.animations.length > 0) {
            // If no idle animation, play the first available one
            const firstAnimName = gltf.animations[0].name;
            this.playAnimation(firstAnimName);
          } else {
            // If no animations in model, create procedural animations
            this.createProceduralAnimations();
            this.playAnimation('idle');
          }
        } else {
          // If no animations in model, create procedural animations
          this.createProceduralAnimations();
          this.playAnimation('idle');
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
  
  createProceduralAnimations() {
    console.log('Creating procedural animations');
    // We'll create animation clips programmatically
    
    // Create an animation mixer if not already created
    if (!this.mixer) {
      this.mixer = new THREE.AnimationMixer(this.model);
    }
    
    // Create idle animation (slight bobbing and rotation)
    const idleTrack = new THREE.VectorKeyframeTrack(
      '.position[y]',
      [0, 0.5, 1, 1.5, 2], // Keyframe times
      [0.5, 0.55, 0.5, 0.55, 0.5] // Y position values (bob up and down)
    );
    
    const idleRotationTrack = new THREE.VectorKeyframeTrack(
      '.rotation[y]',
      [0, 2, 4], // Keyframe times
      [0, Math.PI * 0.25, 0] // Rotation values (slight turn)
    );
    
    const idleClip = new THREE.AnimationClip('idle', 4, [idleTrack, idleRotationTrack]);
    this.animations['idle'] = this.mixer.clipAction(idleClip);
    this.animations['idle'].setLoop(THREE.LoopRepeat);
    
    // Create walking animation
    const walkPositionTrack = new THREE.VectorKeyframeTrack(
      '.position[y]',
      [0, 0.25, 0.5, 0.75, 1], // Keyframe times
      [0.5, 0.6, 0.5, 0.6, 0.5] // Y position values (more pronounced bob)
    );
    
    const walkRotationTrack = new THREE.VectorKeyframeTrack(
      '.rotation[y]',
      [0, 1], // Keyframe times
      [0, Math.PI * 2] // Complete rotation
    );
    
    const walkClip = new THREE.AnimationClip('walking', 1, [walkPositionTrack, walkRotationTrack]);
    this.animations['walking'] = this.mixer.clipAction(walkClip);
    this.animations['walking'].setLoop(THREE.LoopRepeat);
    
    // Create sleeping animation (subtle pulsing)
    const sleepScaleTrack = new THREE.VectorKeyframeTrack(
      '.scale',
      [0, 1, 2], // Keyframe times
      [
        0.5, 0.5, 0.5, // Initial scale
        0.525, 0.525, 0.525, // Slightly bigger
        0.5, 0.5, 0.5 // Back to initial
      ]
    );
    
    // Subtle rotation for breathing effect
    const sleepRotationTrack = new THREE.VectorKeyframeTrack(
      '.rotation[z]',
      [0, 1, 2], // Keyframe times
      [0, 0.05, 0] // Slight tilt
    );
    
    const sleepClip = new THREE.AnimationClip('sleeping', 2, [sleepScaleTrack, sleepRotationTrack]);
    this.animations['sleeping'] = this.mixer.clipAction(sleepClip);
    this.animations['sleeping'].setLoop(THREE.LoopRepeat);
    
    console.log('Created procedural animations:', Object.keys(this.animations));
  }
  
  playAnimation(name) {
    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }
    
    if (this.animations[name]) {
      this.currentAnimation = this.animations[name];
      this.currentAnimation.play();
      this.state = name;
      console.log(`Playing animation: ${name}`);
    } else {
      console.warn(`Animation "${name}" not found!`);
    }
  }
  
  update(deltaTime, isWindowFocused = true) {
    // If window is not focused, use a very small deltaTime to minimize movement
    // This prevents the pet from running in straight lines when tab is inactive
    if (!isWindowFocused) {
      deltaTime = 0.001; // Almost no movement when tab is not focused
    }
    
    // Limit the maximum deltaTime to prevent large jumps when tab loses focus
    // This will avoid the pet "teleporting" or moving in a straight line when tab regains focus
    const maxDeltaTime = 0.1; // Maximum 100ms per update
    const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
    
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(clampedDeltaTime);
    }
    
    // Update pet behavior based on current state
    switch (this.state) {
      case 'idle':
        this.updateIdleBehavior(clampedDeltaTime);
        break;
      case 'walking':
        this.updateWalkingBehavior(clampedDeltaTime);
        break;
      case 'sleeping':
        this.updateSleepingBehavior(clampedDeltaTime);
        break;
    }
    
    // Apply glitch effect
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh && child.material.uniforms) {
          child.material.uniforms.time.value += clampedDeltaTime;
          
          // Adjust glitch based on pet state
          // More glitches when hungry or unhappy
          if (this.needs.hunger < 30 || this.needs.happiness < 30) {
            // Intensify glitch for a visual indicator of distress
            this.glitchIntensity = 0.6;
          } else {
            // Normal glitch level
            this.glitchIntensity = 0.2;
          }
          
          // Update glitch intensity in shader
          if (child.material.uniforms.glitchIntensity) {
            child.material.uniforms.glitchIntensity.value = this.glitchIntensity;
          }
        }
      });
    }
    
    // Decrease needs over time (very slowly for now)
    this.needs.hunger = Math.max(0, this.needs.hunger - clampedDeltaTime * 0.05);
    this.needs.happiness = Math.max(0, this.needs.happiness - clampedDeltaTime * 0.03);
    this.needs.energy = Math.max(0, this.needs.energy - clampedDeltaTime * 0.02);
    
    // Change state based on needs
    this.updateState();
  }
  
  updateIdleBehavior(deltaTime) {
    this.idleTimer += deltaTime;
    
    // After staying idle for a while, consider walking or sleeping
    if (this.idleTimer > 5) { // 5 seconds of idle time
      this.idleTimer = 0;
      
      // Random chance to change state, influenced by needs
      const energyFactor = this.needs.energy / 100; // 0 to 1
      const happinessFactor = this.needs.happiness / 100; // 0 to 1
      
      // Energy affects willingness to move
      // Lower energy = more likely to sleep
      const sleepThreshold = 0.4 * (1 - energyFactor); // 0 to 0.4 chance based on energy
      
      // Happiness affects movement frequency
      // Higher happiness = more likely to explore
      const walkThreshold = 0.3 * happinessFactor; // 0 to 0.3 chance based on happiness
      
      const rand = Math.random();
      
      if (rand < sleepThreshold || this.needs.energy < 20) {
        // Sleep if low energy or random chance
        this.playAnimation('sleeping');
      } else if (rand < sleepThreshold + walkThreshold) {
        // Start walking with a new random path
        this.playAnimation('walking');
        
        // Adjust path complexity based on happiness
        // Happier pets create more complex paths
        const happinessPathBonus = Math.floor(happinessFactor * 3); // 0-3 additional waypoints
        this.pathComplexity = { 
          min: 2 + happinessPathBonus,
          max: 5 + happinessPathBonus
        };
        
        // Adjust walk speed based on energy
        // Higher energy = faster movement
        this.walkSpeed = 0.3 + (energyFactor * 0.4); // 0.3 to 0.7 speed
        
        // Set a random target position to walk to
        this.setRandomWalkTarget();
      }
    }
  }
  
  updateWalkingBehavior(deltaTime) {
    if (!this.model) return;
    
    // If no waypoints or we've reached the end of the path, go back to idle
    if (this.waypoints.length === 0 || this.currentWaypointIndex >= this.waypoints.length) {
      this.playAnimation('idle');
      return;
    }
    
    // Get current waypoint
    const currentWaypoint = this.waypoints[this.currentWaypointIndex];
    
    // Move towards current waypoint
    const currentPos = this.model.position;
    
    // Calculate distance to waypoint before moving
    const distanceToWaypoint = currentPos.distanceTo(currentWaypoint);
    
    // Calculate the maximum distance we can move in this frame
    const maxMovementThisFrame = this.walkSpeed * deltaTime;
    
    // If we would overshoot the waypoint in this step, just move directly to the waypoint
    if (distanceToWaypoint <= maxMovementThisFrame) {
      // Set position directly to waypoint to avoid overshooting
      currentPos.copy(currentWaypoint);
      
      // Move to next waypoint
      this.currentWaypointIndex++;
      
      // If we reached the end of the path, go back to idle
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.playAnimation('idle');
      } else {
        // If we have more waypoints and we still have movement left,
        // use the remaining movement to go toward the next waypoint
        const remainingMovement = maxMovementThisFrame - distanceToWaypoint;
        
        if (remainingMovement > 0 && this.currentWaypointIndex < this.waypoints.length) {
          const nextWaypoint = this.waypoints[this.currentWaypointIndex];
          const nextDirection = new THREE.Vector3()
            .subVectors(nextWaypoint, currentPos)
            .normalize();
            
          // Calculate rotation to face next waypoint
          if (nextDirection.x !== 0 || nextDirection.z !== 0) {
            this.model.rotation.y = Math.atan2(nextDirection.x, nextDirection.z);
          }
          
          // Move partially toward the next waypoint with remaining movement
          const nextDistance = currentPos.distanceTo(nextWaypoint);
          const moveAmount = Math.min(remainingMovement, nextDistance);
          
          currentPos.x += nextDirection.x * moveAmount;
          currentPos.z += nextDirection.z * moveAmount;
        }
      }
    } else {
      // Calculate direction to current waypoint
      const direction = new THREE.Vector3()
        .subVectors(currentWaypoint, currentPos)
        .normalize();
        
      // Rotate to face movement direction
      if (direction.x !== 0 || direction.z !== 0) {
        const targetRotation = Math.atan2(direction.x, direction.z);
        this.model.rotation.y = targetRotation;
      }
      
      // Regular movement, not close enough to waypoint
      currentPos.x += direction.x * maxMovementThisFrame;
      currentPos.z += direction.z * maxMovementThisFrame;
    }
    
    // Update debug cube position
    if (this.debugCube) {
      this.debugCube.position.copy(currentPos);
    }
    
    // Walking consumes more energy
    this.needs.energy = Math.max(0, this.needs.energy - deltaTime * 0.05);
  }
  
  updateSleepingBehavior(deltaTime) {
    // Sleeping regains energy
    this.needs.energy = Math.min(100, this.needs.energy + deltaTime * 0.2);
    
    // If energy is high enough, wake up
    if (this.needs.energy > 80 && Math.random() < 0.1 * deltaTime) {
      this.playAnimation('idle');
    }
  }
  
  setRandomWalkTarget() {
    // Clear previous path
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    
    // Create a new random path
    this.generateRandomPath();
  }
  
  generateRandomPath() {
    // Determine number of waypoints
    const numWaypoints = Math.floor(
      Math.random() * (this.pathComplexity.max - this.pathComplexity.min + 1) + 
      this.pathComplexity.min
    );
    
    // Create starting point at current position
    const startPos = this.model ? this.model.position.clone() : new THREE.Vector3(0, 0.5, 0);
    
    // Generate waypoints with smooth transitions
    let prevPos = startPos;
    let prevAngle = Math.random() * Math.PI * 2; // Random initial direction
    
    for (let i = 0; i < numWaypoints; i++) {
      // Generate a point that's not too far from the previous one
      const maxStep = 1.0; // Maximum distance between waypoints
      
      // Random direction but with some continuity from previous direction
      // This creates smoother paths by limiting the angle change
      const angleChange = (Math.random() - 0.5) * Math.PI * 0.75; // Max 67.5 degree turn
      const angle = prevAngle + angleChange;
      prevAngle = angle; // Remember for next waypoint
      
      const distance = Math.random() * maxStep + 0.5; // Between 0.5 and 1.5
      
      // Calculate new position
      const newX = Math.max(
        this.walkBounds.minX,
        Math.min(
          this.walkBounds.maxX,
          prevPos.x + Math.cos(angle) * distance
        )
      );
      
      const newZ = Math.max(
        this.walkBounds.minZ,
        Math.min(
          this.walkBounds.maxZ,
          prevPos.z + Math.sin(angle) * distance
        )
      );
      
      // Create waypoint (keeping Y at 0.5)
      const waypoint = new THREE.Vector3(newX, 0.5, newZ);
      this.waypoints.push(waypoint);
      
      // Update previous position
      prevPos = waypoint;
    }
    
    // Debug visualization of path
    if (this.showPathVisualization) {
      this.visualizePath();
    }
  }
  
  visualizePath() {
    // Remove any previous path visualization
    this.clearPathVisualization();
    
    // Create small spheres at each waypoint
    const waypointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const waypointMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    
    this.waypoints.forEach(waypoint => {
      const sphere = new THREE.Mesh(waypointGeometry, waypointMaterial);
      sphere.position.copy(waypoint);
      this.scene.add(sphere);
      this.pathVisualization.push(sphere);
    });
    
    // Create a line connecting the waypoints
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.waypoints.length * 3);
    
    for (let i = 0; i < this.waypoints.length; i++) {
      positions[i * 3] = this.waypoints[i].x;
      positions[i * 3 + 1] = this.waypoints[i].y;
      positions[i * 3 + 2] = this.waypoints[i].z;
    }
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    
    this.scene.add(line);
    this.pathVisualization.push(line);
  }
  
  clearPathVisualization() {
    if (this.pathVisualization && this.pathVisualization.length > 0) {
      this.pathVisualization.forEach(obj => this.scene.remove(obj));
      this.pathVisualization = [];
    }
  }
  
  togglePathVisualization() {
    this.showPathVisualization = !this.showPathVisualization;
    
    if (this.showPathVisualization && this.waypoints.length > 0) {
      this.visualizePath();
    } else {
      this.clearPathVisualization();
    }
    
    return this.showPathVisualization;
  }
  
  updateState() {
    // This will override the animation state only if needs are critically low
    
    // If energy is very low, force sleeping state
    if (this.needs.energy < 10 && this.state !== 'sleeping') {
      this.playAnimation('sleeping');
    }
    // No automatic state changes beyond critical needs - let the behavior functions handle it
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