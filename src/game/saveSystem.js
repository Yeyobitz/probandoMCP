/**
 * SaveSystem Module
 * Handles saving and loading game data to/from localStorage
 */

export default class SaveSystem {
  constructor(game) {
    this.game = game;
    this.saveKey = 'digivirus_savedata';
    this.autoSaveEnabled = true;
    this.version = '1.0.0'; // Save data versioning
  }

  /**
   * Save all game data to localStorage
   * @returns {boolean} Success status
   */
  saveGame() {
    try {
      // Get all relevant pet data
      const petData = this.getPetData();
      
      // Get game state data
      const gameData = this.getGameStateData();
      
      // Combine all data
      const saveData = {
        version: this.version,
        timestamp: Date.now(),
        pet: petData,
        game: gameData
      };
      
      // Save to localStorage
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      
      console.log('Game saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  }
  
  /**
   * Load game data from localStorage
   * @returns {boolean} Success status
   */
  loadGame() {
    try {
      // Get saved data from localStorage
      const savedData = localStorage.getItem(this.saveKey);
      
      if (!savedData) {
        console.log('No saved data found.');
        return false;
      }
      
      const saveData = JSON.parse(savedData);
      
      // Check version compatibility
      if (this.checkVersion(saveData.version)) {
        // Load pet data
        this.loadPetData(saveData.pet);
        
        // Load game state
        this.loadGameStateData(saveData.game);
        
        console.log('Game loaded successfully!');
        return true;
      } else {
        console.error('Save data version incompatible.');
        return false;
      }
    } catch (error) {
      console.error('Error loading game:', error);
      return false;
    }
  }
  
  /**
   * Check if a saved version is compatible with current version
   * @param {string} savedVersion - The version from saved data
   * @returns {boolean} Whether the version is compatible
   */
  checkVersion(savedVersion) {
    // For now we'll do a simple equality check
    // In a more complex game, you might want to handle migration of older saves
    return savedVersion === this.version;
  }
  
  /**
   * Get all relevant pet data for saving
   * @returns {Object} Pet data
   */
  getPetData() {
    const pet = this.game.pet;
    
    return {
      name: pet.name,
      state: pet.state,
      attributes: { ...pet.attributes },
      needs: { ...pet.needs },
      progression: { ...pet.progression }
    };
  }
  
  /**
   * Get game state data for saving
   * @returns {Object} Game state data
   */
  getGameStateData() {
    return {
      isPaused: this.game.state.isPaused,
      activeCamera: this.game.ui.activeCamera,
      debugMode: this.game.ui.debugMode
    };
  }
  
  /**
   * Load pet data from save
   * @param {Object} petData - The saved pet data
   */
  loadPetData(petData) {
    const pet = this.game.pet;
    
    // Load pet basic info
    pet.name = petData.name;
    pet.state = petData.state;
    
    // Load pet attributes
    Object.assign(pet.attributes, petData.attributes);
    
    // Load needs
    Object.assign(pet.needs, petData.needs);
    
    // Load progression
    Object.assign(pet.progression, petData.progression);
    
    // Update pet state visualization
    pet.setState(pet.state);
  }
  
  /**
   * Load game state data from save
   * @param {Object} gameData - The saved game state data
   */
  loadGameStateData(gameData) {
    // Set game state
    this.game.state.isPaused = gameData.isPaused;
    
    // Set UI state
    this.game.ui.activeCamera = gameData.activeCamera;
    this.game.ui.debugMode = gameData.debugMode;
    
    // Update camera
    this.game.switchCamera(gameData.activeCamera);
  }
  
  /**
   * Toggle auto-save feature
   * @returns {boolean} New auto-save state
   */
  toggleAutoSave() {
    this.autoSaveEnabled = !this.autoSaveEnabled;
    return this.autoSaveEnabled;
  }
  
  /**
   * Delete saved game data
   * @returns {boolean} Success status
   */
  deleteSave() {
    try {
      localStorage.removeItem(this.saveKey);
      return true;
    } catch (error) {
      console.error('Error deleting save:', error);
      return false;
    }
  }
  
  /**
   * Check if a save exists
   * @returns {boolean} Whether a save file exists
   */
  hasSaveData() {
    return localStorage.getItem(this.saveKey) !== null;
  }
} 