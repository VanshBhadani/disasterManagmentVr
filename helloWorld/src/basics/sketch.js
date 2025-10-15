// vr.js - Three.js VR scene
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer, controllers = [], cameraRig;

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

    // Add additional directional light for better model visibility
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add ambient light to ensure everything is visible
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

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
    referenceCube.position.set(3, 0.5, -1); // Move to the right side
    scene.add(referenceCube);

    // Load the Shrek GLB model
    const loader = new GLTFLoader();
    loader.load('/shrek_doing_the_toothless_dance.glb', 
        function (gltf) {
            // Success callback
            console.log('Shrek model loaded successfully');
            const shrekModel = gltf.scene;
            
            // Get model size for better positioning
            const box = new THREE.Box3().setFromObject(shrekModel);
            const size = box.getSize(new THREE.Vector3());
            console.log('Model size:', size);
            
            // Position the model directly in front of the player
            shrekModel.position.set(0, 0, -2); // Center it, 2 units in front
            
            // Scale based on model size - make it human-sized
            const targetHeight = 1.8; // 1.8 meters tall
            const scaleMultiplier = targetHeight / size.y;
            shrekModel.scale.setScalar(scaleMultiplier);
            console.log('Applied scale:', scaleMultiplier);
            
            // Ensure model is on the ground
            shrekModel.position.y = 0;
            
            // Add to scene
            scene.add(shrekModel);
            console.log('Model added to scene at position:', shrekModel.position);
            
            // Add a bright material to make it more visible
            shrekModel.traverse((child) => {
                if (child.isMesh) {
                    // Increase material brightness
                    if (child.material) {
                        child.material.metalness = 0;
                        child.material.roughness = 0.8;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                }
            });
            
            // Optional: Play animations if the model has them
            if (gltf.animations && gltf.animations.length > 0) {
                console.log('Found animations:', gltf.animations.length);
                const mixer = new THREE.AnimationMixer(shrekModel);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                
                // Store mixer for animation updates
                shrekModel.userData.mixer = mixer;
            }
        },
        function (progress) {
            // Progress callback
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function (error) {
            // Error callback
            console.error('Error loading Shrek model:', error);
        }
    );

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

function animate() {
    // Update any model animations
    scene.traverse((child) => {
        if (child.userData.mixer) {
            child.userData.mixer.update(0.016); // 60fps delta time
        }
    });

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
                            
                            // Move the camera rig
                            cameraRig.position.addScaledVector(moveDir, moveSpeed);
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
