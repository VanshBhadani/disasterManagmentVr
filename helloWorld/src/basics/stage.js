import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e); // Dark blue background for stage atmosphere

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Enable XR
document.body.appendChild(renderer.domElement);

// Add VR button
document.body.appendChild(VRButton.createButton(renderer));

// Position camera at VR eye level
camera.position.set(0, 2.5, 10); // Raised to 2.5m and moved back to 10 units for better stage view
camera.lookAt(0, 1, 0); // Look at the center of the stage (slightly above ground)

// Lighting setup - Enhanced stage lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Brighter ambient light
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2); // Brighter
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

// Main spotlight from above
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Much brighter
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Front spotlight (key light)
const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
frontLight.position.set(0, 5, 10);
scene.add(frontLight);

// Left stage light (fill light)
const leftLight = new THREE.PointLight(0xff6b6b, 1, 50); // Warm red light
leftLight.position.set(-5, 3, 0);
scene.add(leftLight);

// Right stage light (fill light)
const rightLight = new THREE.PointLight(0x6b9fff, 1, 50); // Cool blue light
rightLight.position.set(5, 3, 0);
scene.add(rightLight);

// Back rim light for depth
const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
backLight.position.set(0, 5, -10);
scene.add(backLight);

// Overhead spotlight directly above stage
const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, 15, 0);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.2;
spotLight.decay = 2;
spotLight.distance = 30;
scene.add(spotLight);

// Create a simple stage platform since we don't have the actual stage model
const stageGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 32); // Round stage platform
const stageMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B4513, // Brown wood color
    shininess: 30 
});
const stage = new THREE.Mesh(stageGeometry, stageMaterial);
stage.position.set(0, -0.25, 0); // Slightly below ground level
scene.add(stage);

// Add stage edge lighting
const edgeLight = new THREE.RingGeometry(7.8, 8.2, 32);
const edgeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffd700, // Gold color
    transparent: true,
    opacity: 0.6
});
const stageEdge = new THREE.Mesh(edgeLight, edgeMaterial);
stageEdge.rotation.x = -Math.PI / 2;
stageEdge.position.set(0, 0.01, 0);
scene.add(stageEdge);

// 🎭 Load 3D Models
const loader = new GLTFLoader();

// Get the base URL for assets (works in both dev and production)
const baseUrl = import.meta.env.BASE_URL;

// 🕺 Load Shrek Model with Animation (temporary replacement)
let shrekMixer; // For animation
loader.load('/shrek_doing_the_toothless_dance.glb', (gltf) => {
    const shrekModel = gltf.scene;
    shrekModel.position.set(0, 0, 0); // Center everything at origin
    shrekModel.scale.set(2, 2, 2); // Make it bigger for stage presence
    scene.add(shrekModel);
    
    // Play animations if they exist
    if (gltf.animations && gltf.animations.length > 0) {
        shrekMixer = new THREE.AnimationMixer(shrekModel);
        gltf.animations.forEach((clip) => {
            shrekMixer.clipAction(clip).play();
        });
        console.log('🧌 Shrek is performing on stage! Animations:', gltf.animations.length);
    }
    
    console.log('🎯 Shrek model loaded successfully on stage!');
}, undefined, (error) => {
    console.error('❌ Error loading shrek_doing_the_toothless_dance.glb:', error);
});

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
const clock = new THREE.Clock(); // For animation timing

renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    
    // Update Shrek's animation if it exists
    if (shrekMixer) {
        shrekMixer.update(delta);
    }
    
    renderer.render(scene, camera);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});