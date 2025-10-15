// terrain.js - Three.js VR scene with terrain following system
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let camera, scene, renderer, controllers = [], cameraRig;
let terrainMeshes = [];
let currentY = 1.6; // Current player height
const interpolationFactor = 0.2; // Smoothness control (0.1 = very smooth, 0.5 = more responsive)

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Create camera rig for VR movement
    cameraRig = new THREE.Group();
    cameraRig.position.set(0, 1.6, 3);
    cameraRig.add(camera);
    scene.add(cameraRig);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 20, 0);
    scene.add(light);

    // Add terrain system - Main floor plane and staircase only
    
    // Main floor plane
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    floor.position.y = 0; // Ground level
    floor.name = "terrain_floor";
    scene.add(floor);
    terrainMeshes.push(floor); // Add to terrain array
    
    // Stairs for testing step terrain
    for (let i = 0; i < 8; i++) {
        const stepGeometry = new THREE.BoxGeometry(4, 0.2, 1.5);
        const stepMaterial = new THREE.MeshStandardMaterial({ color: 0xD2691E });
        const step = new THREE.Mesh(stepGeometry, stepMaterial);
        step.position.set(0, (i * 0.2) + 0.1, -5 - (i * 1.5)); // Center the stairs
        step.name = `terrain_step${i}`;
        scene.add(step);
        terrainMeshes.push(step);
    }

    // Reference cube for navigation
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const referenceCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    referenceCube.position.set(3, 0.5, -3); // Move to side so it doesn't block stairs
    scene.add(referenceCube);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    // Set up VR controllers
    setupControllers();

    window.addEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(animate);
}

function setupControllers() {
    // Left controller (index 0) for movement
    const controller1 = renderer.xr.getController(0);
    cameraRig.add(controller1);
    controllers.push(controller1);
    
    // Right controller (index 1) 
    const controller2 = renderer.xr.getController(1);
    cameraRig.add(controller2);
    controllers.push(controller2);
}

// Terrain Following System - Core Implementation
function terrainFollowing(checkPosition) {
    // Create raycaster starting 5 units above the check position
    const ray = new THREE.Raycaster(
        new THREE.Vector3(checkPosition.x, checkPosition.y + 5, checkPosition.z), // Start 5 units above
        new THREE.Vector3(0, -1, 0), // Ray direction: straight down
        0,  // Near distance
        20  // Far distance (max detection range)
    );
    
    // Check for terrain intersections
    const hits = ray.intersectObjects(terrainMeshes, true);
    
    if (hits.length > 0) {
        // Get the height of the terrain at intersection point
        const terrainY = hits[0].point.y;
        
        // Smooth interpolation to new height
        currentY = THREE.MathUtils.lerp(currentY, terrainY + 1.6, interpolationFactor);
        
        // Apply the new height to camera rig
        cameraRig.position.y = currentY;
        
        return true; // Terrain found
    }
    
    return false; // No terrain found
}

// Proactive terrain following during movement
function checkTerrainAtNextPosition(nextPos) {
    const groundRay = new THREE.Raycaster(
        new THREE.Vector3(nextPos.x, nextPos.y + 5, nextPos.z),
        new THREE.Vector3(0, -1, 0),
        0,
        20
    );
    
    const groundHits = groundRay.intersectObjects(terrainMeshes, true);
    
    if (groundHits.length > 0) {
        const terrainY = groundHits[0].point.y;
        currentY = THREE.MathUtils.lerp(currentY, terrainY + 1.6, interpolationFactor);
        return terrainY + 1.6; // Return desired height
    }
    
    return null; // No terrain found
}

function animate() {
    // Simple VR Movement - Left Controller Only
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
                            const moveDir = new THREE.Vector3(thumbstickX, 0, thumbstickY).applyQuaternion(
                                camera.quaternion
                            );
                            moveDir.y = 0;
                            moveDir.normalize();
                            
                            // Calculate next position
                            const currentPos = cameraRig.position.clone();
                            const nextPos = currentPos.clone().addScaledVector(moveDir, moveSpeed);
                            
                            // Check terrain at next position (proactive terrain following)
                            const terrainHeight = checkTerrainAtNextPosition(nextPos);
                            
                            if (terrainHeight !== null) {
                                // Move horizontally
                                cameraRig.position.x = nextPos.x;
                                cameraRig.position.z = nextPos.z;
                                // Height is handled by terrain following
                                cameraRig.position.y = currentY;
                            } else {
                                // Fallback: move normally if no terrain detected
                                cameraRig.position.addScaledVector(moveDir, moveSpeed);
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Continuous terrain following (when stationary or for fine adjustments)
    terrainFollowing(cameraRig.position);
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
