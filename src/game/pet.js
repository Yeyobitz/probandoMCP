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
    
    // Pet attributes - Stats básicos
    this.attributes = {
      health: 100,
      attack: 10,
      defense: 10,
      speed: 10,
      intelligence: 10,
      // Nuevos atributos
      agility: 10,      // Esquivar en combate
      luck: 10,         // Críticos y recompensas
      resistance: 10,   // Resistencia a estados alterados
      adaptability: 10  // Velocidad de aprendizaje
    };
    
    // Pet needs - Necesidades
    this.needs = {
      hunger: 100,       // Full (100) to empty (0)
      happiness: 100,
      energy: 100,
      // Nuevas necesidades
      hygiene: 100,      // Limpieza
      social: 100,       // Necesidad de socialización
      loyalty: 75        // Vínculo con el jugador
    };
    
    // Estadísticas de progresión
    this.progression = {
      experience: 0,            // Experiencia acumulada
      level: 1,                 // Nivel actual
      evolutionPoints: 0,       // Puntos hacia evolución
      requiredExpForNextLevel: 100,  // Exp para siguiente nivel
      statPoints: 0,            // Puntos para asignar a estadísticas
      specialty: {              // Tendencias evolutivas (0-100)
        data: 50,               // Tipo de datos
        security: 50,           // Tipo seguridad
        network: 50,            // Tipo red
        cipher: 50,             // Tipo cifrado
        malware: 50             // Tipo malware
      }
    };
    
    // Pet state
    this.state = 'idle'; // idle, walking, sleeping, training, playing, bathing
    
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
    
    // Update pet needs based on time
    this.updateNeeds(clampedDeltaTime);
    
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
    
    // Remove existing path visualization
    this.pathVisualization.forEach(obj => {
      if (obj && this.scene) {
        this.scene.remove(obj);
      }
    });
    
    this.pathVisualization = [];
    
    // If enabled, create new path visualization
    if (this.showPathVisualization && this.waypoints.length > 0) {
      this.visualizePath();
    }
    
    // Toggle visibility of debug cube
    if (this.debugCube) {
      this.debugCube.visible = this.showPathVisualization;
    }
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
  /**
   * Feed the pet to decrease hunger
   * @param {number} amount - Amount to decrease hunger by
   * @returns {boolean} - True if pet was fed, false if not hungry
   */
  feed(amount) {
    // Si hunger está alto (más de 80%), la mascota no tiene hambre
    if (this.needs.hunger > 80) {
      return false;
    }
    
    // Aumentar valor de hunger (menos hambre)
    this.needs.hunger = Math.min(100, this.needs.hunger + amount);
    
    // Slightly increase happiness when fed
    this.needs.happiness = Math.min(100, this.needs.happiness + (amount * 0.2));
    
    // Return to idle state if sleeping
    if (this.state === 'sleeping') {
      this.setState('idle');
    }
    
    return true;
  }
  
  /**
   * Play with the pet to increase happiness
   * @param {number} amount - Amount to increase happiness by
   * @returns {boolean} - True if played with pet, false if pet is too tired
   */
  play(amount) {
    // Si energy está demasiado bajo, mascota está muy cansada para jugar
    if (this.needs.energy < 20) {
      return false;
    }
    
    // Increase happiness
    this.needs.happiness = Math.min(100, this.needs.happiness + amount);
    
    // Decrease energy from playing
    this.needs.energy = Math.max(0, this.needs.energy - (amount * 0.5));
    
    // Decrease hunger slightly from activity (get more hungry)
    this.needs.hunger = Math.max(0, this.needs.hunger - (amount * 0.3));
    
    // Set to walking state if not already
    if (this.state !== 'walking') {
      this.setState('walking');
      
      // Generate a more complex path when playing
      const extraWaypoints = Math.floor(amount / 5); // More play = more complex path
      this.generateRandomPath(this.pathComplexity.min + extraWaypoints);
    }
    
    return true;
  }
  
  /**
   * Let the pet rest to regain energy
   * @param {number} amount - Amount to increase energy by
   * @returns {boolean} - True if pet is resting, false otherwise
   */
  rest(amount) {
    // Si energy ya está muy alto, mascota no quiere dormir
    if (this.needs.energy > 80 && this.needs.happiness > 40) {
      return false;
    }
    
    // Increase energy
    this.needs.energy = Math.min(100, this.needs.energy + amount);
    
    // Decrease happiness slightly when resting if already high
    if (this.needs.happiness > 60) {
      this.needs.happiness = Math.max(0, this.needs.happiness - (amount * 0.1));
    }
    
    // Set to sleeping state
    if (this.state !== 'sleeping') {
      this.setState('sleeping');
    }
    
    return true;
  }
  
  /**
   * Set the pet's state and update animation
   * @param {string} newState - New state for the pet
   */
  setState(newState) {
    if (this.state === newState) return;
    
    this.state = newState;
    
    // Play corresponding animation
    this.playAnimation(newState);
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
  
  /**
   * Update pet needs based on time
   * @param {number} deltaTime - Time since last update
   */
  updateNeeds(deltaTime) {
    // Adjust for inactive tabs (use very small deltaTime for inactive tabs)
    const adjustedDeltaTime = deltaTime * (this.state === 'sleeping' ? 0.5 : 1.0);
    
    // Hunger decreases over time (pet gets more hungry)
    this.needs.hunger = Math.max(0, this.needs.hunger - adjustedDeltaTime * 1.0);
    
    // Happiness decreases over time
    this.needs.happiness = Math.max(0, this.needs.happiness - adjustedDeltaTime * 0.8);
    
    // Energy decreases when active, increases slightly when sleeping
    if (this.state === 'sleeping') {
      this.needs.energy = Math.min(100, this.needs.energy + adjustedDeltaTime * 2.0);
    } else {
      this.needs.energy = Math.max(0, this.needs.energy - adjustedDeltaTime * 0.5);
    }
    
    // Nuevas necesidades
    // Higiene disminuye con el tiempo
    this.needs.hygiene = Math.max(0, this.needs.hygiene - adjustedDeltaTime * 0.6);
    
    // Social disminuye cuando está solo
    this.needs.social = Math.max(0, this.needs.social - adjustedDeltaTime * 0.7);
    
    // Loyalty se mantiene relativamente estable pero disminuye si otras necesidades están bajas
    if (this.needs.hunger < 30 || this.needs.happiness < 30) {
      this.needs.loyalty = Math.max(0, this.needs.loyalty - adjustedDeltaTime * 0.3);
    }
    
    // Estado de la mascota basado en sus necesidades
    this.updateStateBasedOnNeeds();
  }
  
  /**
   * Update pet state based on needs
   */
  updateStateBasedOnNeeds() {
    // Si la mascota está muy cansada, eventualmente dormirá automáticamente
    if (this.needs.energy < 15 && this.state !== 'sleeping') {
      this.setState('sleeping');
      return;
    }
    
    // Si la mascota está muy hambrienta, se moverá más lentamente
    if (this.needs.hunger < 20) {
      this.walkSpeed = 0.2;
    } else {
      // Velocidad normal basada en energía
      this.walkSpeed = 0.5 * (this.needs.energy / 100);
    }
    
    // Comportamiento basado en felicidad
    if (this.needs.happiness < 30 && this.state === 'walking') {
      // Mascota triste: caminos más cortos, menos waypoints
      this.pathComplexity.max = 3;
    } else {
      // Mascota feliz: caminos más complejos
      this.pathComplexity.max = 6;
    }
  }
  
  /**
   * Limpia a la mascota para aumentar su higiene
   * @param {number} amount - Cantidad de higiene a restaurar
   * @returns {boolean} - True si se limpió la mascota, false si ya estaba limpia
   */
  clean(amount) {
    // Si la higiene ya está alta, no necesita limpieza
    if (this.needs.hygiene > 80) {
      return false;
    }
    
    // Aumentar higiene
    this.needs.hygiene = Math.min(100, this.needs.hygiene + amount);
    
    // Aumentar ligeramente la felicidad
    this.needs.happiness = Math.min(100, this.needs.happiness + (amount * 0.2));
    
    // Cambiar estado a 'bathing' temporalmente
    this.setState('bathing');
    
    // Volver a idle después de un tiempo
    setTimeout(() => {
      if (this.state === 'bathing') {
        this.setState('idle');
      }
    }, 3000);
    
    return true;
  }
  
  /**
   * Socializar con la mascota para aumentar su nivel social
   * @param {number} amount - Cantidad de socialización
   * @returns {boolean} - True si socializó, false si no quería socializar
   */
  socialize(amount) {
    // Si está muy cansada o muy hambrienta, no quiere socializar
    if (this.needs.energy < 20 || this.needs.hunger < 20) {
      return false;
    }
    
    // Aumentar social
    this.needs.social = Math.min(100, this.needs.social + amount);
    
    // Aumentar felicidad
    this.needs.happiness = Math.min(100, this.needs.happiness + (amount * 0.5));
    
    // Aumentar lealtad
    this.needs.loyalty = Math.min(100, this.needs.loyalty + (amount * 0.4));
    
    // Disminuir energía ligeramente
    this.needs.energy = Math.max(0, this.needs.energy - (amount * 0.3));
    
    // Ganar experiencia
    this.gainExperience(amount);
    
    // Cambiar estado a 'playing'
    if (this.state !== 'playing') {
      this.setState('playing');
      
      // Volver a idle después de un tiempo
      setTimeout(() => {
        if (this.state === 'playing') {
          this.setState('idle');
        }
      }, 4000);
    }
    
    return true;
  }
  
  /**
   * Obtener un atributo aleatorio para mejorar
   * @returns {string} - Nombre del atributo
   */
  getRandomAttribute() {
    const attributes = ['attack', 'defense', 'speed', 'intelligence', 'agility', 'luck', 'resistance', 'adaptability'];
    const index = Math.floor(Math.random() * attributes.length);
    return attributes[index];
  }
  
  /**
   * Ganar experiencia para subir de nivel
   * @param {number} amount - Cantidad de experiencia ganada
   */
  gainExperience(amount) {
    // Aplicar bonificación por adaptabilidad
    const adaptabilityBonus = 1 + (this.attributes.adaptability / 100);
    const totalExp = amount * adaptabilityBonus;
    
    this.progression.experience += totalExp;
    this.progression.evolutionPoints += totalExp * 0.5;
    
    // Comprobar si sube de nivel
    if (this.progression.experience >= this.progression.requiredExpForNextLevel) {
      this.levelUp();
    }
  }
  
  /**
   * Subir de nivel y obtener puntos para asignar a estadísticas
   */
  levelUp() {
    this.progression.level++;
    this.progression.experience -= this.progression.requiredExpForNextLevel;
    this.progression.requiredExpForNextLevel = Math.floor(this.progression.requiredExpForNextLevel * 1.5);
    
    // Otorgar 5 puntos de estadísticas para asignar
    this.progression.statPoints += 5;
    
    // Restaurar parte de las necesidades
    this.needs.hunger = Math.min(100, this.needs.hunger + 20);
    this.needs.energy = Math.min(100, this.needs.energy + 30);
    this.needs.happiness = Math.min(100, this.needs.happiness + 40);
    
    // Notificar al UI que se ha subido de nivel
    if (this.game && this.game.ui) {
      this.game.ui.showLevelUp(this.progression.level, { statPoints: 5 });
    }
    
    // Si tenemos puntos de estadística por asignar, mostrar UI para asignarlos
    this.showStatPointsUI();
  }
  
  /**
   * Mostrar UI para asignar puntos de estadística
   */
  showStatPointsUI() {
    // Esta función sería implementada posteriormente
    // Mostraría un panel donde el jugador puede asignar los puntos
    console.log(`Tienes ${this.progression.statPoints} puntos para asignar a tus estadísticas`);
  }
  
  /**
   * Asignar puntos a una estadística específica
   * @param {string} stat - La estadística a mejorar
   * @param {number} points - La cantidad de puntos a asignar
   * @returns {boolean} - True si se asignaron los puntos, false si no hay suficientes
   */
  assignStatPoints(stat, points = 1) {
    // Verificar si hay suficientes puntos disponibles
    if (this.progression.statPoints < points) {
      return false;
    }
    
    // Verificar si la estadística existe
    if (this.attributes[stat] === undefined) {
      return false;
    }
    
    // Asignar los puntos
    this.attributes[stat] += points;
    this.progression.statPoints -= points;
    
    return true;
  }
  
  /**
   * Obtener la especialidad dominante
   * @returns {string} - Clave de la especialidad dominante
   */
  getDominantSpecialty() {
    let max = 0;
    let dominantKey = '';
    
    for (const key in this.progression.specialty) {
      if (this.progression.specialty[key] > max) {
        max = this.progression.specialty[key];
        dominantKey = key;
      }
    }
    
    return dominantKey;
  }
} 