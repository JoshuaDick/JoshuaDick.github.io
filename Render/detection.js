/*
This file detects user interaction with the website
*/

import * as THREE from 'three';
import { camera, cube, controls, setAutoRotate, modelGroup } from './renderhome.js';
import {p1link} from './labels.js';

const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();
let   pointerInScene = false;
let rotationTween = null;
//camera home position
const HOME_POS = new THREE.Vector3(2, 1.5, 3);

// Hover highlight 
const HIGHLIGHT = new THREE.Color(0xFF0000);
let hoveredIndex = -1;
let savedColor   = null;

const FACE_LINKS = [
    'https://soonerracing.com/circuit.html',  // Project 4
    'https://github.com/JoshuaDick/P2PMoving',  // Project 2
    '../Resume/Dick_Joshua_Resume.pdf', // +Y
    null,                      // 3: -Y  (no link on this face)
    'https://soonerracing.com',  // Project 1
    'https://github.com/JoshuaDick/EngineData',  // Project 3
];

const HALF_SIZE     = 1;
const LINK_LIFT     = 0.02;  // push out from the face to avoid z-fighting
const _cubeWorldPos = new THREE.Vector3();

const FACE_UP_LOCAL = [
    new THREE.Vector3( 0,  1,  0), // 0: +X
    new THREE.Vector3( 0,  1,  0), // 1: -X
    new THREE.Vector3( 0,  0, -1), // 2: +Y  (top)
    new THREE.Vector3( 0,  0,  1), // 3: -Y  (bottom)
    new THREE.Vector3( 0,  1,  0), // 4: +Z
    new THREE.Vector3( 0,  1,  0), // 5: -Z
];
const WORLD_UP = new THREE.Vector3(0, 1, 0);

const FACE_NORMAL_LOCAL = [
    new THREE.Vector3( 1, 0, 0), // 0: +X
    new THREE.Vector3(-1, 0, 0), // 1: -X
    new THREE.Vector3( 0, 1, 0), // 2: +Y
    new THREE.Vector3( 0,-1, 0), // 3: -Y
    new THREE.Vector3( 0, 0, 1), // 4: +Z
    new THREE.Vector3( 0, 0,-1), // 5: -Z
];

const FACE_RIGHT_LOCAL = [
    new THREE.Vector3( 0, 0,-1), // 0: +X  (looking at +X, right is -Z)
    new THREE.Vector3( 0, 0, 1), // 1: -X
    new THREE.Vector3( 1, 0, 0), // 2: +Y  (top: right is +X)
    new THREE.Vector3( 1, 0, 0), // 3: -Y  (bottom: right is +X — flip if it looks wrong)
    new THREE.Vector3( 1, 0, 0), // 4: +Z
    new THREE.Vector3(-1, 0, 0), // 5: -Z
];

const LINK_RIGHT_OFFSET = 1.5;   // slide toward the right edge (face is 2 units wide)

function positionProjectLink(faceIdx) {
    const url = FACE_LINKS[faceIdx];
    if (!url) { p1link.visible = false; return; }

    p1link.element.firstChild.href = url;

    const normal = FACE_NORMAL_LOCAL[faceIdx];
    const right  = FACE_RIGHT_LOCAL[faceIdx];

    p1link.position
        .copy(normal).multiplyScalar(HALF_SIZE + LINK_LIFT)
        .addScaledVector(right, LINK_RIGHT_OFFSET);

    p1link.visible = true;
}

function clearHover() {
    if (hoveredIndex !== -1 && cube) {
        cube.material[hoveredIndex].color.copy(savedColor);
    }
    hoveredIndex = -1;
    savedColor   = null;
    document.body.style.cursor = '';
}

function updateHover() {
    if (!cube || !pointerInScene) return;

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(cube)[0];

    if (!hit) { clearHover(); return; }

    const idx = hit.face.materialIndex;
    if (idx === hoveredIndex) return; 

    clearHover();
    savedColor = cube.material[idx].color.clone();
    cube.material[idx].color.copy(HIGHLIGHT);
    hoveredIndex = idx;
    document.body.style.cursor = 'pointer';
}


function tweenCameraTo(endPos, endUp = WORLD_UP, dur = 700) {
    const m = new THREE.Matrix4().lookAt(endPos, controls.target, endUp);
    const endQuat = new THREE.Quaternion().setFromRotationMatrix(m);

    tween = {
        fromPos:  camera.position.clone(),
        toPos:    endPos.clone(),
        fromQuat: camera.quaternion.clone(),
        toQuat:   endQuat,
        endUp:    endUp.clone(),
        t0:       performance.now(),
        dur,
    };
}



//EVENT LISTENERS
addEventListener('pointermove', (e) => {
    pointer.x =  (e.clientX / innerWidth)  * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    pointerInScene = true;
});
addEventListener('pointerleave', () => { pointerInScene = false; clearHover(); });

// Click: reorient camera so the clicked face faces you
let tween = null;

addEventListener('click', (e) => {
    if (!cube) return;

    pointer.x =  (e.clientX / innerWidth)  * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(cube)[0];
    if (!hit) return;

    const worldNormal = hit.face.normal
        .clone()
        .transformDirection(cube.matrixWorld)
        .normalize();

    const worldUp = FACE_UP_LOCAL[hit.face.materialIndex]
        .clone()
        .transformDirection(cube.matrixWorld)
        .normalize();

    const distance = camera.position.distanceTo(controls.target);
    const endPos   = controls.target.clone().addScaledVector(worldNormal, distance);

    setAutoRotate(false);
    tweenCameraTo(endPos, worldUp);

    positionProjectLink(hit.face.materialIndex);
});

addEventListener('keydown',(event)=> {
    if (event.key === 'Escape') {
        setAutoRotate(true);
        tweenCameraTo(HOME_POS,WORLD_UP);
        p1link.visible = false;
    }
});

// If the user grabs OrbitControls mid-flight, abandon
controls.addEventListener('start', () => { tween = null; });

function tick() {
    updateHover();   // re-raycast every frame so the cube's rotation is tracked

    if (tween) {
        const k = Math.min((performance.now() - tween.t0) / tween.dur, 1);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
        camera.quaternion.slerpQuaternions(tween.fromQuat, tween.toQuat, e);
        if (k === 1) {
            camera.up.copy(tween.endUp);   // keep OrbitControls consistent after landing
            tween = null;
        }
    }

    requestAnimationFrame(tick);
}
tick();