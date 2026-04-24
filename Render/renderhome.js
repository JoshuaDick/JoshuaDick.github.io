/*
This file renders the main scene
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { labelRenderer, titlelabel, reminderlabel, p1link } from './labels.js';
import { loadSvgAsTexture, loadImageAsTexture, loadVideoAsTexture} from './imageprocessing.js';

//vectors for cube positioning relative to label
const _labelWorldPos = new THREE.Vector3();
const _camToLabel    = new THREE.Vector3();
const _occlusionRay  = new THREE.Raycaster();


// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

export const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 6000);
camera.position.set(2, 1.5, 3);
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());


scene.add(titlelabel);
titlelabel.position.set(0,1.5,0);
scene.add(reminderlabel);
reminderlabel.position.set(-1,0,0);
scene.add(p1link);


function updateLabelOcclusion() {
    if (!cube) return;

    titlelabel.getWorldPosition(_labelWorldPos);
    _camToLabel.subVectors(_labelWorldPos, camera.position);
    const labelDist = _camToLabel.length();
    _camToLabel.normalize();

    _occlusionRay.set(camera.position, _camToLabel);
    const hit = _occlusionRay.intersectObject(cube, false)[0];

    // Occluded iff the cube is hit *closer* than the label.
    titlelabel.visible = !(hit && hit.distance < labelDist - 1e-3);
}


// CUBE
export let cube = null;
async function buildCube(faces, size = 2) {
    const textures = await Promise.all([faces.px, faces.nx, faces.py, faces.ny, faces.pz, faces.nz]);

    // One material per face
    const materials = textures.map(map => new THREE.MeshBasicMaterial({
        map,
        color: 0xffffff,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
    }));

    const geom = new THREE.BoxGeometry(size, size, size);
    cube = new THREE.Mesh(geom, materials);

    const edges = new THREE.EdgesGeometry(geom);
    const wireframe = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    const pivot = new THREE.Group();
    pivot.add(cube);
    pivot.add(wireframe);
    return pivot;
}


// BUILD 
export let modelGroup = null;

buildCube({
    px: loadVideoAsTexture('../Videos/Project4.mp4'), //project 4
    nx: loadVideoAsTexture('../Videos/Project2.MOV'), //project 2
    py: loadSvgAsTexture('../SVGs/resume.svg'),
    ny: loadVideoAsTexture('../Videos/Project5.mp4'), //project 5
    pz: loadVideoAsTexture('../Videos/Project1.mp4'), //project 1
    nz: loadVideoAsTexture('../Videos/Project3.mov'), //project 3
}, 2).then(group => {
    modelGroup = group;
    scene.add(modelGroup);
    modelGroup.attach(titlelabel);
    modelGroup.attach(reminderlabel);
    modelGroup.attach(p1link);
    p1link.visible = false;

}).catch(err => console.error('Cube build failed:', err));

// ANIMATE
export let autoRotate = true;
export function setAutoRotate(v) {autoRotate = v;}

function animate() {
    requestAnimationFrame(animate);
    if (modelGroup && autoRotate) {
        modelGroup.rotation.y += 0.002;
        reminderlabel.visible = false;
        titlelabel.visible = true;
    }
    else {
        //reminderlabel.visible = true;
        titlelabel.visible = false;
    }
    controls.update();
    if (titlelabel.visible) {
        updateLabelOcclusion();
    }
    composer.render();
    labelRenderer.render(scene,camera);
}
animate();

addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
});