// world.js - VR Nature World with Land, Plants, Trees, and Water
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 10, 100); // Distance fog for atmosphere

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true; // Enable WebXR
document.body.appendChild(renderer.domElement);

// Add VR button
document.body.appendChild(VRButton.createButton(renderer));

// Create camera rig for VR movement
const cameraRig = new THREE.Group();
cameraRig.position.set(0, 1.6, 15); // Start position
cameraRig.add(camera);
scene.add(cameraRig);

// ===== LIGHTING =====
// Sun (main directional light)
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(30, 40, 20);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Ambient light (soft overall illumination)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Hemisphere light (sky and ground colors)
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x6b8e23, 0.6);
scene.add(hemiLight);

// ===== TERRAIN / LAND =====
// Create rolling terrain with slight variations
const terrainGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
const terrainMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a5f0b, // Grass green
    roughness: 0.9,
    metalness: 0.0
});

// Add some height variation to terrain
const positions = terrainGeometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getY(i);
    // Simple noise-like height variation
    const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5 + 
                   Math.random() * 0.3;
    positions.setZ(i, height);
}
terrainGeometry.computeVertexNormals();

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = 0;
terrain.receiveShadow = true;
scene.add(terrain);

// ===== WATER =====
// Create a lake/pond
const waterGeometry = new THREE.PlaneGeometry(30, 30);
const waterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1e90ff, // Dodger blue
    roughness: 0.1,
    metalness: 0.5,
    transparent: true,
    opacity: 0.8
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.set(-20, 0.1, -10); // Slightly above terrain to avoid z-fighting
water.receiveShadow = true;
scene.add(water);

// Animate water (subtle wave effect)
function animateWater() {
    const time = Date.now() * 0.001;
    water.position.y = 0.1 + Math.sin(time) * 0.05;
}

// ===== TREES =====
function createTree(x, z, height = 3, trunkRadius = 0.2) {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, height, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2f1a }); // Brown
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    
    // Foliage (3 cone layers for pine tree effect)
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 }); // Dark green
    
    const layer1 = new THREE.Mesh(
        new THREE.ConeGeometry(height * 0.5, height * 0.8, 8),
        foliageMaterial
    );
    layer1.position.y = height + height * 0.4;
    layer1.castShadow = true;
    tree.add(layer1);
    
    const layer2 = new THREE.Mesh(
        new THREE.ConeGeometry(height * 0.4, height * 0.6, 8),
        foliageMaterial
    );
    layer2.position.y = height + height * 0.7;
    layer2.castShadow = true;
    tree.add(layer2);
    
    const layer3 = new THREE.Mesh(
        new THREE.ConeGeometry(height * 0.25, height * 0.5, 8),
        foliageMaterial
    );
    layer3.position.y = height + height * 0.95;
    layer3.castShadow = true;
    tree.add(layer3);
    
    tree.position.set(x, 0, z);
    return tree;
}

// Add forest of trees
const treePositions = [
    // Left side forest
    { x: -15, z: 5, h: 4 },
    { x: -18, z: 8, h: 3.5 },
    { x: -12, z: 7, h: 3.8 },
    { x: -16, z: 12, h: 4.2 },
    { x: -20, z: 10, h: 3.3 },
    { x: -14, z: 15, h: 3.6 },
    { x: -10, z: 9, h: 3.9 },
    
    // Right side forest
    { x: 15, z: -5, h: 3.7 },
    { x: 18, z: -8, h: 4.1 },
    { x: 12, z: -7, h: 3.4 },
    { x: 16, z: -12, h: 3.8 },
    { x: 20, z: -10, h: 4.0 },
    { x: 14, z: -15, h: 3.5 },
    
    // Scattered trees
    { x: 5, z: -20, h: 4.3 },
    { x: -8, z: -18, h: 3.6 },
    { x: 3, z: 15, h: 3.9 },
];

treePositions.forEach(pos => {
    const tree = createTree(pos.x, pos.z, pos.h);
    scene.add(tree);
});

// ===== PLANTS / BUSHES =====
function createBush(x, z, size = 0.5) {
    const bushGeometry = new THREE.SphereGeometry(size, 8, 6);
    const bushMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7d2e, // Medium green
        roughness: 0.9
    });
    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
    bush.position.set(x, size * 0.6, z);
    bush.scale.set(1, 0.8, 1); // Flatten slightly
    bush.castShadow = true;
    bush.receiveShadow = true;
    return bush;
}

// Add scattered bushes/plants
const bushPositions = [
    { x: 2, z: 3 }, { x: -3, z: 5 }, { x: 5, z: -2 },
    { x: -7, z: -3 }, { x: 8, z: 6 }, { x: -5, z: 8 },
    { x: 10, z: 2 }, { x: -9, z: -6 }, { x: 4, z: -8 },
    { x: -2, z: 10 }, { x: 6, z: -5 }, { x: -4, z: -10 },
    // Near water
    { x: -18, z: -8 }, { x: -22, z: -12 }, { x: -16, z: -14 },
];

bushPositions.forEach(pos => {
    const size = 0.4 + Math.random() * 0.4; // Random sizes
    const bush = createBush(pos.x, pos.z, size);
    scene.add(bush);
});

// ===== GRASS PATCHES =====
function createGrassClump(x, z) {
    const grassGroup = new THREE.Group();
    const grassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a7023,
        side: THREE.DoubleSide
    });
    
    // Create several grass blades
    for (let i = 0; i < 5; i++) {
        const blade = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, 0.3),
            grassMaterial
        );
        blade.position.x = (Math.random() - 0.5) * 0.2;
        blade.position.z = (Math.random() - 0.5) * 0.2;
        blade.position.y = 0.15;
        blade.rotation.y = Math.random() * Math.PI;
        grassGroup.add(blade);
    }
    
    grassGroup.position.set(x, 0, z);
    return grassGroup;
}

// Add grass clumps
for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const grass = createGrassClump(x, z);
    scene.add(grass);
}

// ===== ROCKS =====
function createRock(x, z) {
    const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969, // Gray
        roughness: 0.95
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, 0.2, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

// Add rocks near water and scattered
const rockPositions = [
    { x: -18, z: -6 }, { x: -24, z: -10 }, { x: -16, z: -12 },
    { x: 7, z: 4 }, { x: -6, z: -7 }, { x: 12, z: -3 },
];

rockPositions.forEach(pos => {
    const rock = createRock(pos.x, pos.z);
    scene.add(rock);
});

// ===== VR CONTROLLERS =====
const controller1 = renderer.xr.getController(0);
cameraRig.add(controller1);

const controller2 = renderer.xr.getController(1);
cameraRig.add(controller2);

// Controller models
function addControllerModel(controller) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    controller.add(mesh);
}

addControllerModel(controller1);
addControllerModel(controller2);

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
                            const moveSpeed = 0.05;
                            
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

// ===== ANIMATION LOOP =====
function animate() {
    renderer.setAnimationLoop(() => {
        // Handle VR movement
        handleMovement();
        
        // Animate water
        animateWater();
        
        renderer.render(scene, camera);
    });
}

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the experience
animate();
