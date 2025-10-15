# Proximity Detection System - proximity.js

## 📚 Learning Objectives
After studying this code, students will understand:
- How to calculate distances between 3D objects
- How to create interactive object behaviors
- How to implement state-based systems (near/far)
- How to add visual feedback and animations

---

## 🎯 What This Code Does
This builds on the basic movement system and adds **proximity detection**. The player can now:
- Walk near a special cube that detects their presence
- See the cube change color when they get close (green → red)
- Watch the cube pulsate when they're nearby
- Experience interactive VR environments

Think of it like a **motion sensor** that responds to your presence!

---

## 🔑 New Concepts Introduced

### 1. **Distance Calculation**
Using 3D math to measure how far apart two objects are in space.

### 2. **State Management**
Tracking whether the player is "near" or "far" from objects.

### 3. **Visual Feedback**
Changing object appearance based on player proximity.

### 4. **Animation Effects**
Making objects pulsate and scale based on conditions.

---

## 🧱 Code Structure Breakdown

### 1. New Global Variables
```javascript
let proximityCube;                    // The special cube that detects proximity
let isNearCube = false;              // State: are we currently near the cube?
const proximityDistance = 4.0;       // Distance threshold for detection
```

**What each variable does:**
- `proximityCube` = Reference to the interactive cube object
- `isNearCube` = Boolean flag tracking proximity state
- `proximityDistance` = How close you need to be (4 units = about 4 meters)

---

### 2. Enhanced Scene Setup

#### Creating the Proximity Cube
```javascript
// Add proximity detection cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Default green
proximityCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
proximityCube.position.set(0, 0.5, -5); // Position further away to test proximity
scene.add(proximityCube);
```

**Key Points:**
- **Default color:** Green (0x00ff00)
- **Position:** 5 units away from starting position
- **Global reference:** Stored in `proximityCube` variable for later access

#### Adding Reference Objects
```javascript
// Add a few more cubes for reference
for (let i = 0; i < 3; i++) {
    const refCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const refCubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0099ff });
    const refCube = new THREE.Mesh(refCubeGeometry, refCubeMaterial);
    refCube.position.set((i - 1) * 3, 0.25, -8);
    scene.add(refCube);
}
```

**Loop Explanation:**
- `i = 0`: Position = (-1 * 3, 0.25, -8) = (-3, 0.25, -8)
- `i = 1`: Position = (0 * 3, 0.25, -8) = (0, 0.25, -8)  
- `i = 2`: Position = (1 * 3, 0.25, -8) = (3, 0.25, -8)

This creates 3 blue cubes in a line for spatial reference.

---

### 3. The Proximity Detection System (Core Magic!)

#### Main Proximity Function
```javascript
function checkProximity() {
    // Calculate distance between camera/player and the proximity cube
    const playerPosition = new THREE.Vector3();
    cameraRig.getWorldPosition(playerPosition);
    
    const cubePosition = new THREE.Vector3();
    proximityCube.getWorldPosition(cubePosition);
    
    const distance = playerPosition.distanceTo(cubePosition);
    
    // Check if player is near the cube
    if (distance < proximityDistance && !isNearCube) {
        // Player just got close - change to red
        proximityCube.material.color.setHex(0xff0000);
        isNearCube = true;
        console.log(`Near cube! Distance: ${distance.toFixed(2)}`);
    } else if (distance >= proximityDistance && isNearCube) {
        // Player moved away - change back to green
        proximityCube.material.color.setHex(0x00ff00);
        isNearCube = false;
        console.log(`Away from cube! Distance: ${distance.toFixed(2)}`);
    }
    
    // Optional: Make cube pulsate when near
    if (isNearCube) {
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
        proximityCube.scale.setScalar(scale);
    } else {
        proximityCube.scale.setScalar(1);
    }
}
```

**Step-by-Step Breakdown:**

#### 1. Get Object Positions
```javascript
const playerPosition = new THREE.Vector3();
cameraRig.getWorldPosition(playerPosition);

const cubePosition = new THREE.Vector3();
proximityCube.getWorldPosition(cubePosition);
```

**Why `getWorldPosition()`?**
- Objects can be nested inside other objects
- `getWorldPosition()` gets the final position in world space
- More reliable than using `.position` directly

#### 2. Calculate Distance
```javascript
const distance = playerPosition.distanceTo(cubePosition);
```

**3D Distance Formula:**
```
distance = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
```

Three.js handles this complex math for us with `distanceTo()`!

#### 3. State-Based Detection
```javascript
if (distance < proximityDistance && !isNearCube) {
    // Just entered proximity zone
} else if (distance >= proximityDistance && isNearCube) {
    // Just left proximity zone
}
```

**State Logic Explained:**
- **Condition 1:** Close AND not currently flagged as near → **Just got close**
- **Condition 2:** Far AND currently flagged as near → **Just moved away**
- **Why check flags?** Prevents triggering the same action repeatedly

#### 4. Visual Feedback
```javascript
// Change color
proximityCube.material.color.setHex(0xff0000); // Red
proximityCube.material.color.setHex(0x00ff00); // Green
```

**Color Codes:**
- `0xff0000` = Pure red
- `0x00ff00` = Pure green  
- `0x0099ff` = Blue (reference cubes)

#### 5. Pulsation Animation
```javascript
if (isNearCube) {
    const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
    proximityCube.scale.setScalar(scale);
} else {
    proximityCube.scale.setScalar(1);
}
```

**Animation Math:**
- `Date.now()` = Current time in milliseconds
- `* 0.005` = Controls animation speed
- `Math.sin()` = Creates smooth wave pattern (-1 to +1)
- `* 0.2` = Controls pulsation intensity
- `1 +` = Shifts range from (0.8 to 1.2) instead of (-0.2 to 0.2)

---

### 4. Enhanced Animation Loop

```javascript
function animate() {
    // VR Movement Logic (same as movement.js)
    if (renderer.xr.isPresenting) {
        // ... movement code ...
    }
    
    // Check proximity detection
    checkProximity();
    
    renderer.render(scene, camera);
}
```

**Key Addition:**
- `checkProximity()` runs every frame (60 times per second)
- Provides real-time proximity detection
- Updates visual feedback continuously

---

## 🔬 Understanding 3D Distance Calculation

### Vector3 Basics
```javascript
const playerPosition = new THREE.Vector3(); // Creates empty vector (0, 0, 0)
cameraRig.getWorldPosition(playerPosition);  // Fills vector with actual position
```

### Distance Calculation Methods

#### Method 1: Three.js Built-in (Recommended)
```javascript
const distance = playerPosition.distanceTo(cubePosition);
```

#### Method 2: Manual Calculation (Educational)
```javascript
const dx = cubePosition.x - playerPosition.x;
const dy = cubePosition.y - playerPosition.y;
const dz = cubePosition.z - playerPosition.z;
const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
```

Both methods give the same result!

---

## 🎨 Understanding Color Changes

### Hexadecimal Color System
```javascript
0x00ff00  // Green: Red=0, Green=255, Blue=0
0xff0000  // Red:   Red=255, Green=0, Blue=0
0x0099ff  // Blue:  Red=0, Green=153, Blue=255
```

### Dynamic Color Changes
```javascript
// Method 1: Direct hex assignment
proximityCube.material.color.setHex(0xff0000);

// Method 2: RGB values (0.0 to 1.0)
proximityCube.material.color.setRGB(1.0, 0.0, 0.0); // Red

// Method 3: Color names
proximityCube.material.color.set('red');
```

---

## 🎭 Understanding Animation and Scaling

### Sine Wave Animation
```javascript
const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
```

**Breaking it down:**
1. `Date.now()` → 1735123456789 (current timestamp)
2. `* 0.005` → 8675617.28 (slow down the wave)
3. `Math.sin()` → 0.8 (wave value between -1 and 1)
4. `* 0.2` → 0.16 (scale the wave amplitude)
5. `1 +` → 1.16 (final scale value)

### Scale Application
```javascript
proximityCube.scale.setScalar(scale); // Apply uniform scaling
```

**Scale Values:**
- `1.0` = Normal size
- `1.2` = 20% larger
- `0.8` = 20% smaller

---

## 🎓 Key Concepts for Students

### 1. **State Management Pattern**
```javascript
let isNearCube = false; // Track current state

// State transition logic
if (condition && !currentState) {
    // Entering new state
    currentState = true;
    // Trigger enter actions
} else if (!condition && currentState) {
    // Leaving state
    currentState = false;
    // Trigger exit actions
}
```

### 2. **Event-Based vs Continuous Detection**
- **Event-based:** Trigger only when state changes (efficient)
- **Continuous:** Check every frame (real-time, but more processing)

### 3. **Visual Feedback Principles**
- **Immediate:** Changes happen instantly when proximity changes
- **Clear:** Obvious difference between states (green vs red)
- **Smooth:** Pulsation provides continuous feedback

### 4. **Distance Thresholds**
```javascript
const proximityDistance = 4.0; // 4 meters
```
- Too small: Hard to trigger
- Too large: Triggers too early
- Just right: Natural feeling interaction

---

## 🚀 What Students Can Try

### Beginner Modifications:
1. **Change proximity distance:** Modify `proximityDistance = 4.0` to `2.0` (closer) or `6.0` (farther)
2. **Change colors:** Modify color hex codes for different visual effects
3. **Adjust pulsation speed:** Change `* 0.005` to `* 0.01` (faster) or `* 0.002` (slower)

### Intermediate Challenges:
1. **Multiple proximity cubes:** Create several cubes with different trigger distances
2. **Different animations:** Rotation instead of scaling when near
3. **Sound effects:** Add audio feedback (requires Web Audio API)

### Advanced Extensions:
1. **Gradual color transitions:** Smoothly blend colors based on distance
2. **Multiple proximity zones:** Different effects at different distances
3. **Complex animations:** Combinations of rotation, scaling, and color changes

---

## 🔧 Common Proximity Patterns

### Pattern 1: Simple On/Off Detection
```javascript
if (distance < threshold) {
    // Near behavior
} else {
    // Far behavior
}
```

### Pattern 2: Multiple Distance Zones
```javascript
if (distance < 2.0) {
    // Very close zone
} else if (distance < 4.0) {
    // Close zone
} else {
    // Far zone
}
```

### Pattern 3: Gradual Effects
```javascript
const intensity = Math.max(0, 1 - (distance / maxDistance));
// intensity = 1.0 when distance = 0
// intensity = 0.0 when distance = maxDistance
```

---

## 🐛 Common Problems and Solutions

### Problem: Detection too sensitive
**Solution:** Increase `proximityDistance` value or add debouncing

### Problem: No color change visible
**Solution:** Check that material color is being modified, not geometry color

### Problem: Pulsation too fast/slow
**Solution:** Adjust the time multiplier in `Date.now() * 0.005`

### Problem: Detection not working
**Solution:** Verify `checkProximity()` is called in the animation loop

---

## 📝 Summary

The proximity detection system adds interactive behavior to VR environments:

**Core Components:**
1. **Distance Calculation:** 3D math to measure object separation
2. **State Management:** Tracking near/far conditions
3. **Visual Feedback:** Color changes and animations
4. **Real-time Updates:** Frame-by-frame proximity checking

**Key Benefits:**
- Interactive VR environments
- Immediate user feedback
- Foundation for complex interactions
- Engaging user experiences

**Real-world Applications:**
- Interactive art installations
- Educational VR experiences
- Game mechanics (pickups, triggers)
- UI element activation

This system demonstrates fundamental interaction patterns that can be extended to create complex, responsive VR environments with multiple interactive objects and sophisticated behavioral systems.
