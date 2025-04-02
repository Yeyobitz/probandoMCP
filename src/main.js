import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pet } from './game/pet.js'; // Import our new Pet class

// Import shaders as text
import ps1VertexShader from './shaders/ps1.vert?raw';
import ps1FragmentShader from './shaders/ps1.frag?raw';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Dark background

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
const renderer = new THREE.WebGLRenderer({ antialias: false }); // Turn off default AA, we want sharp pixels
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1); // Use explicit pixel ratio 1 for pixelation
document.body.appendChild(renderer.domElement);

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

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('assets/textures/ground.png');
groundTexture.wrapS = THREE.RepeatWrapping; // Repeat texture horizontally
groundTexture.wrapT = THREE.RepeatWrapping; // Repeat texture vertically
groundTexture.repeat.set(4, 4); // Repeat texture 4 times in each direction
groundTexture.magFilter = THREE.NearestFilter; // Pixelated look when close
groundTexture.minFilter = THREE.NearestFilter; // Pixelated look when far

// Ground Plane
const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10); // Add segments for jitter
// const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide }); // Grey color, visible from both sides - REPLACED
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

// Create our pet and add it to the scene
const pet = new Pet(scene, 'Bitzy');

// Handle Resize
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // REMOVED - We use pixel ratio 1 now

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

    // Update pet
    pet.update(deltaTime);

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

    // renderer.render(scene, camera); // REMOVED - Now rendering via post-processing
}

animate(); 