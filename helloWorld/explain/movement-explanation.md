# Basic VR Movement System - movement.js

## 📚 Learning Objectives
After studying this code, students will understand:
- How to create a basic VR scene with Three.js
- How VR controller input works
- How to implement smooth movement in VR
- The concept of camera rigs for VR development

---

## 🎯 What This Code Does
This is the **foundation** of VR movement. It creates a simple VR world where you can:
- Put on a VR headset (like Quest 3)
- Use the left controller's thumbstick to move around
- Walk on a gray floor
- See a green reference cube

Think of this as learning to walk before you run - it's the simplest movement system possible!

---

## 🧱 Code Structure Breakdown

### 1. Import Section
```javascript
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
```

**What's happening here?**
- `THREE` is our 3D graphics library (like having a toolbox for 3D)
- `VRButton` creates the "Enter VR" button on the webpage

**Teaching Analogy:** Think of imports like getting tools from a toolshed before starting a project.

---

### 2. Global Variables
```javascript
let camera, scene, renderer, controllers = [], cameraRig;
```

**What each variable does:**
- `camera` = Your eyes in the VR world
- `scene` = The entire 3D world container
- `renderer` = The painter that draws everything on screen
- `controllers` = Array to store VR controller objects
- `cameraRig` = A invisible platform that carries your camera (super important!)

**Why use a cameraRig?**
In VR, you can't just move the camera directly because VR systems control it. Instead, we move the "platform" (rig) that the camera sits on. It's like moving a chair with someone sitting on it!

---

### 3. Scene Setup (init function)

#### Creating the Basic World
```javascript
scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);
```
- Creates an empty 3D space
- Sets background to gray color (0x505050 is hexadecimal color code)

#### Setting Up the Camera
```javascript
camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
```
**Parameters explained:**
- `70` = Field of view (like how wide your vision is)
- `window.innerWidth / window.innerHeight` = Aspect ratio (screen shape)
- `0.1` = Closest thing you can see
- `1000` = Farthest thing you can see

#### The Camera Rig (Most Important Concept!)
```javascript
cameraRig = new THREE.Group();
cameraRig.position.set(0, 1.6, 3);
cameraRig.add(camera);
scene.add(cameraRig);
```

**Step by step:**
1. Create an invisible group/container
2. Position it 1.6 meters high (average human eye height) and 3 meters forward
3. Put the camera inside this container
4. Add the container to the scene

**Why 1.6 meters?** That's about eye level for an average person!

#### Adding Objects to the Scene
```javascript
// Floor to walk on
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Make it horizontal
floor.position.y = 0; // Ground level
scene.add(floor);
```

**Three.js Object Creation Pattern:**
1. **Geometry** = The shape (20x20 plane)
2. **Material** = How it looks (gray color)
3. **Mesh** = Geometry + Material combined
4. **Transform** = Position and rotate it
5. **Add to scene** = Make it visible

---

### 4. VR Controller Setup

```javascript
function setupControllers() {
    const controller1 = renderer.xr.getController(0); // Left controller
    cameraRig.add(controller1); // Attach to camera rig
    controllers.push(controller1); // Store reference
    
    const controller2 = renderer.xr.getController(1); // Right controller
    cameraRig.add(controller2);
    controllers.push(controller2);
}
```

**Key Points:**
- Index 0 = Left controller
- Index 1 = Right controller
- Controllers are attached to cameraRig so they move with the player

---

### 5. Movement Logic (The Heart of the System!)

```javascript
function animate() {
    if (renderer.xr.isPresenting) { // Only work in VR mode
        const session = renderer.xr.getSession();
        if (session && session.inputSources) {
            session.inputSources.forEach((inputSource) => {
                if (inputSource.handedness === "left" && inputSource.gamepad) {
```

**What's happening:**
1. Check if we're in VR mode
2. Get the VR session (connection to headset)
3. Look through all input devices
4. Find the left controller with gamepad

#### Reading Thumbstick Input
```javascript
const thumbstickX = gamepad.axes[2]; // Left/Right movement
const thumbstickY = gamepad.axes[3]; // Forward/Backward movement

const deadzone = 0.15;
if (Math.abs(thumbstickX) > deadzone || Math.abs(thumbstickY) > deadzone) {
```

**Deadzone explained:**
Thumbsticks are never perfectly centered, so we ignore tiny movements (below 0.15) to prevent unwanted drifting.

#### Converting Input to Movement
```javascript
const moveSpeed = 0.05;

// Calculate movement direction based on camera orientation
const moveDir = new THREE.Vector3(thumbstickX, 0, thumbstickY).applyQuaternion(
    camera.quaternion
);
moveDir.y = 0; // Don't move up/down
moveDir.normalize(); // Make it unit length

// Move the camera rig
cameraRig.position.addScaledVector(moveDir, moveSpeed);
```

**Step by step breakdown:**
1. **Create direction vector:** Use thumbstick values for X and Z, set Y to 0
2. **Apply camera rotation:** `applyQuaternion(camera.quaternion)` makes movement relative to where you're looking
3. **Normalize:** Ensures consistent speed in all directions
4. **Move the rig:** Add the movement to current position

**Why camera.quaternion?**
If you push forward on the thumbstick, you want to move in the direction you're looking, not always toward the same world direction. The quaternion handles this rotation math.

---

## 🔄 The Animation Loop

```javascript
renderer.setAnimationLoop(animate);
```

This tells the browser to call the `animate()` function about 60 times per second (60 FPS). Each frame:
1. Check for controller input
2. Update movement
3. Render the scene

---

## 🎓 Key Concepts for Students

### 1. **Camera Rig Concept**
- **Problem:** VR systems control the camera directly
- **Solution:** Move the platform (rig) that holds the camera
- **Analogy:** Like pushing a wheelchair - you move the chair, not the person

### 2. **Coordinate System**
- **X-axis:** Left (-) and Right (+)
- **Y-axis:** Down (-) and Up (+)
- **Z-axis:** Toward you (-) and Away from you (+)

### 3. **VR Input Handling**
- Controllers are separate input devices
- Each has buttons, triggers, and thumbsticks
- We access them through the WebXR API

### 4. **Smooth Movement**
- Small movement increments (0.05) create smooth motion
- Frame-by-frame updates (60 FPS) make it fluid
- Deadzone prevents unwanted micro-movements

---

## 🚀 What Students Can Try

### Beginner Modifications:
1. **Change move speed:** Modify `moveSpeed = 0.05` to `0.1` (faster) or `0.02` (slower)
2. **Change floor color:** Modify `color: 0x808080` to `0x00ff00` (green)
3. **Move the reference cube:** Change `referenceCube.position.set(0, 0.5, -3)`

### Intermediate Challenges:
1. Add more objects to the scene
2. Change the starting position
3. Add different colored lights

### Advanced Extensions:
1. Add right controller functionality
2. Implement teleportation instead of smooth movement
3. Add boundaries to prevent walking off the floor

---

## 📝 Summary

This basic movement system teaches the fundamental concepts of VR development:
- Scene setup and object creation
- Camera rig for VR movement
- Controller input handling
- Smooth locomotion implementation

Master these concepts before moving on to more complex features like terrain following or proximity detection!
