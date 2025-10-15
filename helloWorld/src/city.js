// city.js - VR Futuristic City Experience
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Bright sky blue (daytime)
scene.fog = new THREE.Fog(0x87ceeb, 50, 200); // Sky blue fog

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true; // Enable WebXR
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Add VR button
document.body.appendChild(VRButton.createButton(renderer));

// Create camera rig for VR movement
const cameraRig = new THREE.Group();
// Start at headset coordinates from screenshot
cameraRig.position.set(-0.39, 1, 1.2);
// Scale down the camera rig so you feel proportional to the city
cameraRig.scale.set(0.45, 0.45, 0.45); // Makes you 30% of normal size (adjust as needed)
cameraRig.add(camera);
scene.add(cameraRig);

// ===== LIGHTING =====
// Ambient light for overall illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Brighter for daytime
scene.add(ambientLight);

// Hemisphere light for sky glow
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8888ff, 1.0); // Bright sky
scene.add(hemiLight);

// Main directional light (sunlight)
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5); // Bright white sun
sunLight.position.set(30, 50, 20);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Additional fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-30, 20, -20);
scene.add(fillLight);

// Remove or tone down futuristic colored lights for daytime
// Keeping them but making them subtle
const accentLight1 = new THREE.PointLight(0xffffff, 0.3, 30); // Subtle white
accentLight1.position.set(15, 10, 0);
scene.add(accentLight1);

const accentLight2 = new THREE.PointLight(0xffffff, 0.3, 30); // Subtle white
accentLight2.position.set(-15, 10, 0);
scene.add(accentLight2);

const accentLight3 = new THREE.PointLight(0xffffff, 0.3, 30); // Subtle white
accentLight3.position.set(0, 10, -15);
scene.add(accentLight3);

// ===== GROUND PLANE =====
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080, // Light gray for daytime
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05; // Slightly below the city model to prevent z-fighting
ground.receiveShadow = true;
scene.add(ground);

// ===== LOAD NEIGHBOURHOOD CITY MODEL =====
const loader = new GLTFLoader();
let cityModel = null;
let cityMixer = null; // For animations if the model has them

console.log('🏙️ Loading neighbourhood city model...');

loader.load(
    '/neighbourhood_city_modular_lowpoly.glb',
    function (gltf) {
        // Success callback
        console.log('✅ Neighbourhood city loaded successfully!');
        cityModel = gltf.scene;
        
        // Position and scale the city
        cityModel.position.set(0, 0, 0); // Center at origin
        cityModel.scale.set(2, 2, 2); // Make the city 2x bigger
        
        // Enable shadows for the city
        cityModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Enhance materials for better look
                if (child.material) {
                    child.material.envMapIntensity = 1.5;
                }
            }
        });
        
        // Add to scene
        scene.add(cityModel);
        
        // Play animations if they exist
        if (gltf.animations && gltf.animations.length > 0) {
            cityMixer = new THREE.AnimationMixer(cityModel);
            gltf.animations.forEach((clip) => {
                const action = cityMixer.clipAction(clip);
                action.play();
            });
            console.log('🎬 Playing', gltf.animations.length, 'animations');
        }
        
        console.log('🎯 City model details:', {
            position: cityModel.position,
            scale: cityModel.scale,
            animations: gltf.animations?.length || 0
        });
    },
    function (progress) {
        // Progress callback
        const percentComplete = (progress.loaded / progress.total * 100).toFixed(1);
        console.log(`📦 Loading city: ${percentComplete}%`);
    },
    function (error) {
        // Error callback
        console.error('❌ Error loading neighbourhood_city_modular_lowpoly.glb:', error);
        console.log('💡 Make sure neighbourhood_city_modular_lowpoly.glb is in the public folder');
    }
);

// ===== VR CONTROLLERS =====
const controller1 = renderer.xr.getController(0);
cameraRig.add(controller1);

const controller2 = renderer.xr.getController(1);
cameraRig.add(controller2);

// Controller visual models
function addControllerModel(controller) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 6);
    const material = new THREE.MeshPhongMaterial({ color: 0x666666 }); // Gray for daytime
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    controller.add(mesh);
    
    // Add a tip
    const tipGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const tipMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.z = -0.04;
    mesh.add(tip);
    
    return mesh;
}

addControllerModel(controller1);
addControllerModel(controller2);

// ===== TERRAIN FOLLOWING SYSTEM =====
let currentPlayerHeight = 1.6; // Current player height
const playerEyeHeight = 1.6; // Standard VR eye level height
const raycaster = new THREE.Raycaster();

// Terrain following function - keeps player on the ground
function terrainFollowing() {
    if (!cityModel) return; // Wait until city is loaded
    
    // Get player's current position
    const playerPos = new THREE.Vector3();
    cameraRig.getWorldPosition(playerPos);
    
    // Create raycast from above the player, shooting downward
    const rayOrigin = new THREE.Vector3(playerPos.x, playerPos.y + 10, playerPos.z);
    const rayDirection = new THREE.Vector3(0, -1, 0); // Straight down
    
    raycaster.set(rayOrigin, rayDirection);
    raycaster.far = 20; // Max detection distance
    
    // Check for intersections with city model
    const intersects = raycaster.intersectObject(cityModel, true);
    
    if (intersects.length > 0) {
        // Found ground! Get the Y position
        const groundY = intersects[0].point.y;
        
        // Smoothly interpolate to new height (prevents sudden jumps)
        const targetHeight = groundY + playerEyeHeight;
        currentPlayerHeight = THREE.MathUtils.lerp(currentPlayerHeight, targetHeight, 0.15);
        
        // Apply the height
        cameraRig.position.y = currentPlayerHeight;
    }
}

// ===== VR MOVEMENT =====
function handleMovement() {
    if (renderer.xr.isPresenting) {
        const session = renderer.xr.getSession();
        if (session && session.inputSources) {
            session.inputSources.forEach((inputSource) => {
                if (inputSource.handedness === "left" && inputSource.gamepad) {
                    const gamepad = inputSource.gamepad;
                    if (gamepad.axes.length >= 4) {
                        const thumbstickX = gamepad.axes[2];
                        const thumbstickY = gamepad.axes[3];
                        
                        const deadzone = 0.15;
                        if (Math.abs(thumbstickX) > deadzone || Math.abs(thumbstickY) > deadzone) {
                            const moveSpeed = 0.1; // Slightly faster for exploring the city
                            
                            // Calculate movement direction based on camera orientation
                            const moveDir = new THREE.Vector3(thumbstickX, 0, thumbstickY)
                                .applyQuaternion(camera.quaternion);
                            moveDir.y = 0;
                            moveDir.normalize();
                            
                            // Move the camera rig
                            cameraRig.position.addScaledVector(moveDir, moveSpeed);
                        }
                    }
                }
            });
        }
    }
}

// ===== ANIMATED ELEMENTS =====
const clock = new THREE.Clock();

// Subtle light variations for daytime
function animateLights() {
    const time = Date.now() * 0.001;
    
    // Very subtle intensity changes for daytime
    accentLight1.intensity = 0.3 + Math.sin(time * 0.5) * 0.05;
    accentLight2.intensity = 0.3 + Math.sin(time * 0.5 + Math.PI * 0.66) * 0.05;
    accentLight3.intensity = 0.3 + Math.sin(time * 0.5 + Math.PI * 1.33) * 0.05;
}

// ===== ANIMATION LOOP =====
function animate() {
    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        
        // Update city animations if they exist
        if (cityMixer) {
            cityMixer.update(delta);
        }
        
        // Handle VR movement
        handleMovement();
        
        // Terrain following - keeps player on the ground
        terrainFollowing();
        
        // Animate lights
        animateLights();
        
        renderer.render(scene, camera);
    });
}

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== START =====
animate();
console.log('🚀 VR Neighbourhood City Experience initialized!');
console.log('👉 Click "Enter VR" to explore the city in VR mode');

// ===== POSITION DEBUGGING =====
// Log position every second for placement and debugging
setInterval(() => {
    const pos = cameraRig.position;
    console.log(`📍 Position: X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`);
}, 1000);

console.log('📊 Position logging active - check console every second for coordinates');

