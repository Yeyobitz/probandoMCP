/**
 * DigiVirus UI Module
 * Manages the user interface, HUD and controls
 */

export default class UserInterface {
  constructor(game) {
    this.game = game;
    this.pet = game.pet;
    
    // UI Elements
    this.hudElement = document.getElementById('hud');
    this.menuElement = document.getElementById('menu');
    this.notificationElement = document.getElementById('notification');
    
    // Tab elements
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // Level indicator
    this.levelElement = document.getElementById('pet-level');
    
    // Needs Stats elements
    this.hungerValue = document.getElementById('hunger-value');
    this.hungerFill = document.getElementById('hunger-fill');
    this.happinessValue = document.getElementById('happiness-value');
    this.happinessFill = document.getElementById('happiness-fill');
    this.energyValue = document.getElementById('energy-value');
    this.energyFill = document.getElementById('energy-fill');
    this.hygieneValue = document.getElementById('hygiene-value');
    this.hygieneFill = document.getElementById('hygiene-fill');
    this.socialValue = document.getElementById('social-value');
    this.socialFill = document.getElementById('social-fill');
    this.loyaltyValue = document.getElementById('loyalty-value');
    this.loyaltyFill = document.getElementById('loyalty-fill');
    
    // Attributes Stats elements
    this.healthValue = document.getElementById('health-value');
    this.attackValue = document.getElementById('attack-value');
    this.defenseValue = document.getElementById('defense-value');
    this.speedValue = document.getElementById('speed-value');
    this.intelligenceValue = document.getElementById('intelligence-value');
    this.agilityValue = document.getElementById('agility-value');
    this.luckValue = document.getElementById('luck-value');
    this.resistanceValue = document.getElementById('resistance-value');
    this.adaptabilityValue = document.getElementById('adaptability-value');
    
    // Progress elements
    this.expValue = document.getElementById('exp-value');
    this.expFill = document.getElementById('exp-fill');
    this.evolutionValue = document.getElementById('evolution-value');
    this.evolutionFill = document.getElementById('evolution-fill');
    
    // Specialty elements
    this.dataFill = document.getElementById('data-fill');
    this.securityFill = document.getElementById('security-fill');
    this.networkFill = document.getElementById('network-fill');
    this.cipherFill = document.getElementById('cipher-fill');
    this.malwareFill = document.getElementById('malware-fill');
    
    // Control buttons
    this.feedButton = document.getElementById('feed-btn');
    this.playButton = document.getElementById('play-btn');
    this.restButton = document.getElementById('rest-btn');
    this.cleanButton = document.getElementById('clean-btn');
    this.socializeButton = document.getElementById('socialize-btn');
    this.menuButton = document.getElementById('menu-btn');
    
    // Menu buttons
    this.saveButton = document.getElementById('save-btn');
    this.cameraButton = document.getElementById('camera-btn');
    this.debugButton = document.getElementById('debug-btn');
    this.closeMenuButton = document.getElementById('close-menu-btn');
    
    // States
    this.menuVisible = false;
    this.activeCamera = 'default';
    this.debugMode = false;
    
    // Sound effects (will be implemented later)
    this.sounds = {
      buttonClick: null,
      notification: null,
      feed: null,
      play: null,
      rest: null
    };
    
    this.initListeners();
  }
  
  /**
   * Initialize all event listeners
   */
  initListeners() {
    // Tab navigation
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        this.activateTab(tabName);
      });
    });
    
    // Main control buttons
    this.feedButton.addEventListener('click', () => this.onFeedClick());
    this.playButton.addEventListener('click', () => this.onPlayClick());
    this.restButton.addEventListener('click', () => this.onRestClick());
    this.cleanButton.addEventListener('click', () => this.onCleanClick());
    this.socializeButton.addEventListener('click', () => this.onSocializeClick());
    this.menuButton.addEventListener('click', () => this.toggleMenu());
    
    // Menu buttons
    this.saveButton.addEventListener('click', () => this.onSaveClick());
    this.cameraButton.addEventListener('click', () => this.cycleCamera());
    this.debugButton.addEventListener('click', () => this.toggleDebug());
    this.closeMenuButton.addEventListener('click', () => this.toggleMenu());
    
    // ESC key to toggle menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMenu();
      }
    });
  }
  
  /**
   * Activate a specific tab
   * @param {string} tabName - The name of the tab to activate
   */
  activateTab(tabName) {
    // Deactivate all tabs
    this.tabButtons.forEach(button => button.classList.remove('active'));
    this.tabContents.forEach(content => content.style.display = 'none');
    
    // Activate the selected tab
    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).style.display = 'block';
  }
  
  /**
   * Update the UI based on pet status
   */
  update() {
    // Update level
    this.levelElement.textContent = this.pet.progression.level;
    
    // Update needs stats
    this.updateNeeds();
    
    // Update attributes
    this.updateAttributes();
    
    // Update progression
    this.updateProgression();
  }
  
  /**
   * Update the pet needs stats display
   */
  updateNeeds() {
    const { hunger, happiness, energy, hygiene, social, loyalty } = this.pet.needs;
    
    // Update hunger - 100% significa lleno, 0% significa hambriento
    this.hungerValue.textContent = `${Math.floor(hunger)}%`;
    this.hungerFill.style.width = `${hunger}%`;
    
    // Update happiness
    this.happinessValue.textContent = `${Math.floor(happiness)}%`;
    this.happinessFill.style.width = `${happiness}%`;
    
    // Update energy
    this.energyValue.textContent = `${Math.floor(energy)}%`;
    this.energyFill.style.width = `${energy}%`;
    
    // Update new needs
    this.hygieneValue.textContent = `${Math.floor(hygiene)}%`;
    this.hygieneFill.style.width = `${hygiene}%`;
    
    this.socialValue.textContent = `${Math.floor(social)}%`;
    this.socialFill.style.width = `${social}%`;
    
    this.loyaltyValue.textContent = `${Math.floor(loyalty)}%`;
    this.loyaltyFill.style.width = `${loyalty}%`;
    
    // Change colors based on values (warning when low)
    this.updateStatColors(this.hungerFill, hunger);
    this.updateStatColors(this.happinessFill, happiness);
    this.updateStatColors(this.energyFill, energy);
    this.updateStatColors(this.hygieneFill, hygiene);
    this.updateStatColors(this.socialFill, social);
    this.updateStatColors(this.loyaltyFill, loyalty);
  }
  
  /**
   * Update the pet attributes display
   */
  updateAttributes() {
    const { health, attack, defense, speed, intelligence, agility, luck, resistance, adaptability } = this.pet.attributes;
    
    // Update attribute values
    this.healthValue.textContent = Math.floor(health);
    this.attackValue.textContent = Math.floor(attack);
    this.defenseValue.textContent = Math.floor(defense);
    this.speedValue.textContent = Math.floor(speed);
    this.intelligenceValue.textContent = Math.floor(intelligence);
    this.agilityValue.textContent = Math.floor(agility);
    this.luckValue.textContent = Math.floor(luck);
    this.resistanceValue.textContent = Math.floor(resistance);
    this.adaptabilityValue.textContent = Math.floor(adaptability);
  }
  
  /**
   * Update the pet progression display
   */
  updateProgression() {
    const { experience, requiredExpForNextLevel, evolutionPoints, specialty } = this.pet.progression;
    
    // Update experience
    const expPercent = (experience / requiredExpForNextLevel) * 100;
    this.expValue.textContent = `${Math.floor(experience)}/${requiredExpForNextLevel}`;
    this.expFill.style.width = `${expPercent}%`;
    
    // Update evolution points
    // Supongamos que se necesitan 1000 puntos para evolucionar
    const evolutionPercent = (evolutionPoints / 1000) * 100;
    this.evolutionValue.textContent = `${Math.floor(evolutionPoints)}`;
    this.evolutionFill.style.width = `${Math.min(evolutionPercent, 100)}%`;
    
    // Update specialties
    this.dataFill.style.width = `${specialty.data}%`;
    this.securityFill.style.width = `${specialty.security}%`;
    this.networkFill.style.width = `${specialty.network}%`;
    this.cipherFill.style.width = `${specialty.cipher}%`;
    this.malwareFill.style.width = `${specialty.malware}%`;
  }
  
  /**
   * Update stat bar colors based on value
   */
  updateStatColors(element, value) {
    if (value < 25) {
      element.style.backgroundColor = 'var(--accent-color)'; // Red for critical
    } else if (value < 50) {
      element.style.backgroundColor = 'var(--warning-color)'; // Orange for warning
    } else {
      element.style.backgroundColor = 'var(--secondary-color)'; // Normal color
    }
  }
  
  /**
   * Show a notification message
   */
  showNotification(message, duration = 3000) {
    this.notificationElement.textContent = message;
    this.notificationElement.style.opacity = '1';
    
    // Hide after duration
    setTimeout(() => {
      this.notificationElement.style.opacity = '0';
    }, duration);
  }
  
  /**
   * Toggle menu visibility
   */
  toggleMenu() {
    this.menuVisible = !this.menuVisible;
    this.menuElement.style.display = this.menuVisible ? 'block' : 'none';
  }
  
  /**
   * Feed the pet
   */
  onFeedClick() {
    if (this.pet.feed(20)) {
      this.showNotification(`${this.pet.name} está comiendo...`);
    } else {
      this.showNotification(`${this.pet.name} no tiene hambre en este momento.`);
    }
  }
  
  /**
   * Play with the pet
   */
  onPlayClick() {
    if (this.pet.play(15)) {
      this.showNotification(`¡Jugando con ${this.pet.name}!`);
    } else {
      this.showNotification(`${this.pet.name} está demasiado cansado para jugar.`);
    }
  }
  
  /**
   * Let the pet rest
   */
  onRestClick() {
    if (this.pet.rest(25)) {
      this.showNotification(`${this.pet.name} está descansando...`);
    } else {
      this.showNotification(`${this.pet.name} no quiere dormir ahora mismo, tiene demasiada energía.`);
    }
  }
  
  /**
   * Clean the pet
   */
  onCleanClick() {
    if (this.pet.clean(30)) {
      this.showNotification(`Limpiando a ${this.pet.name}...`);
    } else {
      this.showNotification(`${this.pet.name} ya está limpio.`);
    }
  }
  
  /**
   * Socialize with the pet
   */
  onSocializeClick() {
    if (this.pet.socialize(25)) {
      this.showNotification(`Socializando con ${this.pet.name}...`);
    } else {
      this.showNotification(`${this.pet.name} no quiere socializar ahora mismo.`);
    }
  }
  
  /**
   * Save game state
   */
  onSaveClick() {
    // Will be implemented in a future task
    this.showNotification('¡Juego guardado!');
    this.toggleMenu();
  }
  
  /**
   * Cycle between camera views
   */
  cycleCamera() {
    const views = ['default', 'top-down', 'first-person'];
    const currentIndex = views.indexOf(this.activeCamera);
    const nextIndex = (currentIndex + 1) % views.length;
    
    this.activeCamera = views[nextIndex];
    this.game.switchCamera(this.activeCamera);
    this.showNotification(`Vista de cámara: ${this.activeCamera}`);
  }
  
  /**
   * Toggle debug mode
   */
  toggleDebug() {
    this.debugMode = !this.debugMode;
    this.pet.togglePathVisualization();
    this.showNotification(`Modo debug: ${this.debugMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }
  
  /**
   * Show level up animation
   * @param {number} level - New level
   * @param {object} stats - Stats that were improved
   */
  showLevelUp(level, stats) {
    // Create level up element if it doesn't exist
    let levelUpElement = document.getElementById('level-up');
    if (!levelUpElement) {
      levelUpElement = document.createElement('div');
      levelUpElement.id = 'level-up';
      levelUpElement.className = 'level-up';
      
      const levelUpText = document.createElement('div');
      levelUpText.className = 'level-up-text';
      levelUpText.textContent = `¡NIVEL ${level}!`;
      
      const levelUpStats = document.createElement('div');
      levelUpStats.className = 'level-up-stats';
      
      levelUpElement.appendChild(levelUpText);
      levelUpElement.appendChild(levelUpStats);
      document.body.appendChild(levelUpElement);
    }
    
    // Update level text
    const levelUpText = levelUpElement.querySelector('.level-up-text');
    levelUpText.textContent = `¡NIVEL ${level}!`;
    
    // Update stats text
    const levelUpStats = levelUpElement.querySelector('.level-up-stats');
    levelUpStats.innerHTML = '<h3>ESTADÍSTICAS MEJORADAS</h3>';
    for (const stat in stats) {
      const statElement = document.createElement('div');
      statElement.textContent = `${stat.toUpperCase()}: +${stats[stat]}`;
      levelUpStats.appendChild(statElement);
    }
    
    // Show level up animation
    levelUpElement.style.opacity = '1';
    
    // Hide after 3 seconds
    setTimeout(() => {
      levelUpElement.style.opacity = '0';
    }, 3000);
  }
} 