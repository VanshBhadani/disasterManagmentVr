# Terrain Following System - terrain.js

## 📚 Learning Objectives
After studying this code, students will understand:
- How raycasting works in 3D space
- How to detect terrain height automatically
- How to implement smooth height transitions
- The difference between proactive and reactive terrain detection

---

## 🎯 What This Code Does
This builds on the basic movement system and adds **automatic terrain following**. The player can now:
- Walk up stairs automatically
- Follow ramps and slopes
- Stay at the correct height above any terrain
- Move smoothly without getting stuck

Think of it like having **invisible legs** that automatically adjust to the ground height!

---

## 🔑 New Concepts Introduced

### 1. **Raycasting**
Imagine shooting an invisible laser beam downward from the player to detect what's below them. That's raycasting!

### 2. **Terrain Array**
A list that contains all objects the player can walk on (floors, stairs, ramps).

### 3. **Smooth Interpolation**
Instead of instantly jumping to new heights, we smoothly transition using `lerp()` (linear interpolation).

---

## 🧱 Code Structure Breakdown

### 1. New Global Variables
```javascript
let terrainMeshes = [];
let currentY = 1.6; // Current player height
const interpolationFactor = 0.2; // Smoothness control
```

**What each variable does:**
- `terrainMeshes[]` = Array storing all walkable surfaces
- `currentY` = Tracks the player's current Y position
- `interpolationFactor` = Controls how smooth the height changes are (0.1 = very smooth, 0.5 = more responsive)

---

### 2. Enhanced Scene Setup

#### Creating Terrain Objects
```javascript
// Main floor plane
const floorGeometry = new THREE.PlaneGeometry(30, 30);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xFF69B4 }); // Pink floor
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Make horizontal
floor.position.y = 0; // Ground level
floor.name = "terrain_floor"; // Give it a name for debugging
scene.add(floor);
terrainMeshes.push(floor); // Add to terrain array ← IMPORTANT!
```

**Key Point:** Every walkable surface must be added to `terrainMeshes[]` array!

#### Creating Stairs for Testing
```javascript
// Stairs for testing step terrain
for (let i = 0; i < 8; i++) {
    const stepGeometry = new THREE.BoxGeometry(4, 0.2, 1.5);
    const stepMaterial = new THREE.MeshStandardMaterial({ color: 0xD2691E }); // Brown
    const step = new THREE.Mesh(stepGeometry, stepMaterial);
    step.position.set(0, (i * 0.2) + 0.1, -5 - (i * 1.5)); // Calculate position
    step.name = `terrain_step${i}`;
    scene.add(step);
    terrainMeshes.push(step); // Add each step to terrain array
}
```

**Stair Math Explained:**
- `i * 0.2` = Each step is 0.2 units higher than the previous
- `+ 0.1` = Offset to center the step (step height is 0.2, so center is at 0.1)
- `-5 - (i * 1.5)` = Each step is 1.5 units deeper than the previous

---

### 3. The Terrain Following System (Core Magic!)

#### Main Terrain Following Function
```javascript
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
```

**Step-by-Step Breakdown:**

1. **Create Raycaster:**
   - Start point: 5 units above the player
   - Direction: Straight down (0, -1, 0)
   - Range: 0 to 20 units

2. **Cast Ray:**
   - `intersectObjects(terrainMeshes, true)` checks which terrain objects the ray hits
   - Returns array of intersection points, sorted by distance

3. **Process Results:**
   - `hits[0].point.y` gets the Y coordinate where ray hit terrain
   - Add 1.6 to terrain height (eye level above ground)

4. **Smooth Transition:**
   - `THREE.MathUtils.lerp()` smoothly blends current height with target height
   - Formula: `newValue = oldValue + (targetValue - oldValue) * factor`

#### Proactive Terrain Detection
```javascript
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
```

**Proactive vs Reactive:**
- **Proactive:** Check terrain BEFORE moving there
- **Reactive:** Check terrain AFTER arriving there
- **Why both?** Proactive prevents getting stuck, reactive handles fine adjustments

---

### 4. Enhanced Movement Logic

```javascript
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
```

**Movement Strategy:**
1. Calculate where we want to move
2. Check if there's terrain at that location
3. If terrain found: Move horizontally, let terrain system handle height
4. If no terrain: Move normally (fallback)

#### Continuous Terrain Following
```javascript
// Continuous terrain following (when stationary or for fine adjustments)
terrainFollowing(cameraRig.position);
```

This runs every frame to ensure the player is always at the correct height, even when standing still.

---

## 🔬 Understanding Raycasting

### What is a Raycaster?
```javascript
const ray = new THREE.Raycaster(
    startPoint,    // Where the ray begins
    direction,     // Which way it's pointing
    near,          // Minimum detection distance
    far            // Maximum detection distance
);
```

### Visual Analogy
Imagine you're holding a laser pointer:
- **Start Point:** Where you're holding it
- **Direction:** Where you're pointing it
- **Near/Far:** How close/far the laser can detect things

### Why Start 5 Units Above?
```javascript
new THREE.Vector3(checkPosition.x, checkPosition.y + 5, checkPosition.z)
```

If we start the ray at ground level, it might miss terrain slightly above the player. Starting high ensures we always detect the ground below.

---

## 🔄 Linear Interpolation (Lerp) Explained

### The Math
```javascript
currentY = THREE.MathUtils.lerp(currentY, terrainY + 1.6, interpolationFactor);
```

**Formula:** `result = start + (end - start) * factor`

### Examples with different factors:
- **Factor 0.1:** Very smooth, gradual changes
- **Factor 0.5:** Balanced smoothness and responsiveness  
- **Factor 1.0:** Instant jumping (no smoothness)

### Why Use Lerp?
Without lerp: Player teleports instantly to new heights (jarring)
With lerp: Player smoothly glides to new heights (comfortable)

---

## 🎓 Key Concepts for Students

### 1. **Dual Detection System**
- **Proactive:** Look ahead before moving
- **Reactive:** Adjust current position
- **Together:** Prevent getting stuck AND maintain accuracy

### 2. **Array Management**
```javascript
terrainMeshes.push(floor);     // Add terrain object
terrainMeshes.push(step);      // Add each stair step
```
Every walkable surface must be in the terrain array!

### 3. **Height Calculation**
```javascript
const terrainY = hits[0].point.y;           // Ground height
const playerHeight = terrainY + 1.6;        // Add eye level
```
Always add eye level offset to terrain height.

### 4. **Intersection Results**
```javascript
const hits = ray.intersectObjects(terrainMeshes, true);
```
- Results are sorted by distance (closest first)
- `hits[0]` is always the closest terrain
- Check `hits.length > 0` before accessing results

---

## 🚀 What Students Can Try

### Beginner Modifications:
1. **Adjust smoothness:** Change `interpolationFactor` from 0.2 to 0.1 (smoother) or 0.5 (more responsive)
2. **Change stair size:** Modify step dimensions in `new THREE.BoxGeometry(4, 0.2, 1.5)`
3. **Add more stairs:** Change loop condition `i < 8` to `i < 12`

### Intermediate Challenges:
1. **Create a ramp:** Add a sloped plane using `PlaneGeometry` and rotation
2. **Multiple stair sets:** Create stairs in different locations
3. **Different terrain heights:** Add platforms at various heights

### Advanced Extensions:
1. **Terrain materials:** Different textures for different terrain types
2. **Terrain boundaries:** Prevent walking off edges
3. **Dynamic terrain:** Moving platforms or elevators

---

## 🐛 Common Problems and Solutions

### Problem: Player falls through terrain
**Solution:** Make sure terrain objects are added to `terrainMeshes[]` array

### Problem: Movement feels jerky
**Solution:** Decrease `interpolationFactor` for smoother transitions

### Problem: Player gets stuck on edges
**Solution:** Proactive terrain checking is working - this is normal behavior

### Problem: Player doesn't follow terrain
**Solution:** Check if raycaster range (20 units) is sufficient

---

## 📝 Summary

The terrain following system adds intelligent height detection to basic movement:

**Core Components:**
1. **Terrain Array:** Stores all walkable surfaces
2. **Raycasting:** Detects ground height using invisible rays
3. **Dual Detection:** Proactive (look ahead) + Reactive (current position)
4. **Smooth Interpolation:** Comfortable height transitions

**Key Benefits:**
- Automatic stair climbing
- Smooth slope following
- No manual height adjustment needed
- Comfortable VR experience

This system forms the foundation for advanced VR locomotion and can be extended with features like collision detection, teleportation, and dynamic terrain interaction.
