import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Game from './game/game.js';

// Import shaders as text
import ps1VertexShader from './shaders/ps1.vert?raw';
import ps1FragmentShader from './shaders/ps1.frag?raw';

// Esperar a que el DOM esté completamente cargado antes de inicializar
document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

// Función principal de inicialización
function initGame() {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a); // Dark background
  
  // Tab focus detection
  let isWindowFocused = true;
  
  window.addEventListener('blur', () => {
    isWindowFocused = false;
    console.log('Window lost focus');
  });
  
  window.addEventListener('focus', () => {
    isWindowFocused = true;
    console.log('Window gained focus');
  });
  
  // Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 3); // Position camera closer and lower to see the pet better
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: false,
    alpha: true,
    canvas: document.createElement('canvas')
  }); 
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // Use explicit pixel ratio 1 for pixelation
  renderer.domElement.style.zIndex = "1"; // Asegurar que el canvas tenga un z-index bajo
  document.body.insertBefore(renderer.domElement, document.body.firstChild);
  
  // Low Resolution Render Target
  const renderResolutionFactor = 4; // Render at 1/4 resolution
  let lowResRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth / renderResolutionFactor,
      window.innerHeight / renderResolutionFactor,
      {
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat,
          type: THREE.UnsignedByteType
      }
  );
  
  // Post-processing Scene (Full-screen Quad)
  const postProcessingScene = new THREE.Scene();
  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postProcessingMaterial = new THREE.MeshBasicMaterial({
      map: lowResRenderTarget.texture,
      depthWrite: false,
      depthTest: false
  });
  const fullscreenQuad = new THREE.PlaneGeometry(2, 2);
  const postProcessingMesh = new THREE.Mesh(fullscreenQuad, postProcessingMaterial);
  postProcessingScene.add(postProcessingMesh);
  
  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth camera movement
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false; // Prevent panning vertically off screen
  controls.maxPolarAngle = Math.PI / 2; // Prevent camera going below ground
  controls.minPolarAngle = 0.1; // Prevent camera from going too high up
  controls.minDistance = 1.5; // Prevent camera from getting too close to target
  controls.maxDistance = 10; // Prevent camera from going too far
  controls.target.y = 0.5; // Set target to always be just above ground level
  
  // Texture Loader
  const textureLoader = new THREE.TextureLoader();
  const groundTexture = textureLoader.load('assets/textures/ground.png');
  groundTexture.wrapS = THREE.RepeatWrapping; // Repeat texture horizontally
  groundTexture.wrapT = THREE.RepeatWrapping; // Repeat texture vertically
  groundTexture.magFilter = THREE.NearestFilter; // Mantener el look pixelado
  groundTexture.minFilter = THREE.NearestMipmapLinearFilter; // Mejor filtrado a distancia
  
  // Ground Plane
  const planeGeometry = new THREE.PlaneGeometry(50, 50, 10, 10); // Ajustado número de segmentos
  const ps1Material = new THREE.ShaderMaterial({
      uniforms: {
          time: { value: 0.0 },
          uTexture: { value: groundTexture } // Pass texture to shader
      },
      vertexShader: ps1VertexShader,
      fragmentShader: ps1FragmentShader,
      side: THREE.DoubleSide
  });
  const groundPlane = new THREE.Mesh(planeGeometry, ps1Material); // Use ShaderMaterial
  groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  scene.add(groundPlane);
  
  // Initialize our Game class
  const game = new Game(scene, camera, renderer);
  
  // Update camera controls target when camera position changes
  const updateControlsTarget = () => {
    controls.target.copy(game.defaultCameraTarget);
  };
  
  // Attach camera control update function to game
  game.updateCameraControls = updateControlsTarget;
  
  // Handle Resize
  window.addEventListener('resize', () => {
      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      // Update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);
  
      // Update render target size
      lowResRenderTarget.setSize(
          window.innerWidth / renderResolutionFactor,
          window.innerHeight / renderResolutionFactor
      );
  });
  
  // Animation Loop
  const clock = new THREE.Clock(); // Clock to track time
  let previousTime = 0;
  
  function animate() {
      requestAnimationFrame(animate);
  
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;
  
      // Update game with window focus state
      game.update(deltaTime, isWindowFocused);
  
      // Update shader time uniform
      ps1Material.uniforms.time.value = elapsedTime;
  
      // Update controls
      controls.update();
  
      // 1. Render main scene to low-res render target
      renderer.setRenderTarget(lowResRenderTarget);
      renderer.clear();
      renderer.render(scene, camera);
  
      // 2. Render low-res texture to screen
      renderer.setRenderTarget(null); // Render to canvas
      renderer.clear(); // Optional: clear if needed, though quad covers screen
      renderer.render(postProcessingScene, orthoCamera);
  }
  
  animate();
} 