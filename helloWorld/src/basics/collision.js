// collision.js - Three.js VR scene with collision detection
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let camera, scene, renderer, controllers = [], cameraRig;
// Add collision-related variables
let collidables = [];
const moveSpeed = 0.05;
const collisionDistance = 1.0;

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

    // Add a floor plane to walk on
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    floor.position.y = 0; // Position at ground level
    scene.add(floor);

    // Add a static reference cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const referenceCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    referenceCube.position.set(0, 0.5, -3); // Position in front of starting point
    scene.add(referenceCube);

    // Create collision objects
    createObstacles();

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

// Create obstacles for collision testing
function createObstacles() {
    // Create a few boxes as obstacles
    const obstacleGeometry = new THREE.BoxGeometry(1, 2, 1);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    // Obstacle 1
    const obstacle1 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle1.position.set(2, 1, -1);
    scene.add(obstacle1);
    collidables.push(obstacle1);
    
    // Obstacle 2
    const obstacle2 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle2.position.set(-2, 1, 1);
    scene.add(obstacle2);
    collidables.push(obstacle2);
    
    // Obstacle 3
    const obstacle3 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle3.position.set(0, 1, -5);
    scene.add(obstacle3);
    collidables.push(obstacle3);
}

// Check for collision before movement
function checkCollision(currentPos, moveDirection) {
    // Calculate next position
    const nextPos = currentPos.clone().addScaledVector(moveDirection, moveSpeed);
    
    // Create raycaster from next position in movement direction
    const raycaster = new THREE.Raycaster(
        new THREE.Vector3(nextPos.x, nextPos.y + 0.5, nextPos.z), // Start slightly above ground
        moveDirection,
        0,
        collisionDistance
    );
    
    // Check for collisions
    const hits = raycaster.intersectObjects(collidables, true);
    return hits.length > 0;
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
                            
                            // Calculate movement direction based on camera orientation
                            const moveDir = new THREE.Vector3(thumbstickX, 0, thumbstickY).applyQuaternion(
                                camera.quaternion
                            );
                            moveDir.y = 0;
                            moveDir.normalize();
                            
                            // CHECK FOR COLLISION BEFORE MOVING
                            if (!checkCollision(cameraRig.position, moveDir)) {
                                // Move the camera rig only if no collision
                                cameraRig.position.addScaledVector(moveDir, moveSpeed);
                            } else {
                                console.log("Movement blocked by collision!");
                            }
                        }
                    }
                }
            });
        }
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
