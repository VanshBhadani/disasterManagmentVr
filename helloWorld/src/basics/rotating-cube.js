import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222); // Dark gray background
renderer.xr.enabled = true; // Enable XR
document.body.appendChild(renderer.domElement);

// Add VR button
document.body.appendChild(VRButton.createButton(renderer));

// Create cube geometry and material
const geometry = new THREE.BoxGeometry(1, 1, 1); // Smaller cube for VR
const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    wireframe: false 
});

// Create cube mesh
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.6, -2); // Position cube at eye level and in front
scene.add(cube);

// Add a ground plane for reference in VR
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// Position camera
camera.position.set(0, 1.6, 0); // Standard VR height

// Add some lighting (for better visuals in VR)
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 4, 2);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Update material to respond to lighting
material.dispose(); // Clean up old material
const litMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
cube.material = litMaterial;

// Add VR controllers
const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

// Add controller models (optional visual representation)
function addControllerModel(controller) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    controller.add(mesh);
    return mesh;
}

addControllerModel(controller1);
addControllerModel(controller2);

// Animation loop
function animate() {
    renderer.setAnimationLoop(animate); // Use setAnimationLoop for VR compatibility
    
    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();