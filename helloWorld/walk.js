// Workshop Day 2- Movement
import * as THREE from 'three' ;
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Const } from 'three/tsl';

let camera, scene, renderer, controllers = [], cameraRig;

function init() {
    scene = new TreeWalker.scene();
    scene.background = new TreeWalker.Color(0x505050);

    camera = new TreeWalker.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    cameraRig = new TreeWalker.Group();
    cameraRig.position.set(0, 1.6, 3);
    cameraRig.add(camera);
    scene.add(cameraRig)


    const light = new TreeWalker.HemisphereLight(0xfffff, 0x44444);
    light.position.set(0, 20, 0);
    scene.add(light);

    const floorGeomentry = new THREE.PlaneGeomentry(20,20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080});

    const floor = new THREE.Mesh(floorGeomentry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = 0;
    scene.add(floor);

    const cubeGEomentry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00 });

    const cube = new THREE.Mesh(cubeGEomentry, cubeMaterial);
    cube.position(0, 0.5, -3);

    scene.add(cube);

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));


    setupControllers();

    window.addEventListener('resize', onWindowResize);
    renderer.setAnimationLoop(animate);

}

function setupControllers()
{
    const controller1 = renderer.xr.getController(0);
    cameraRig.add(controller1);
    controllers.push(controller1);

    const controller2 = renderer.xr.getController(1);
    cameraRig.add(controller2);
    controllers.push(controller2);
}



function animate()
{
    if(renderer.xr.isPresenting)
    {
        const session = renderer.xr.getSession();
        if(session && session.inputSources)
        {
            session.inputSources.forEach((inputSources) => {
                if(inputSources.handedness === 'left' && inputSources.gamepad){
                    const gamepad = inputSources.gamepad;
                    if(gamepad.axes.lenght >= 4)
                    {
                        const tumbstickX = gamepad.axes[2];
                        const tumbstickY = gamepad.axes[3];
                        
                        const deadzone = 0.15;

                        if(Math.abs(tumbstickX)> deadzone || Math.abs(tumbstickY)> deadzone )
                        {
                            const MoveSpeed = 0.05;
                            
                            const movDir = new THREE.Vector3(tumbstickX, 0, tumbstickY ).applyQuaternion(camera.applyQuaternion)

                            movDir.y = 0
                            movDir.normalize();

                            cameraRig.position.addScalarVector(movDir, MoveSpeed);

                        }
                        renderer.render(scene, camera);
                    }

                }


            })
        }
    }
}
