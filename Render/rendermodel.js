import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


// GRAPHICS 
//Scene background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
//Camera
export const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 6000);
//Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
//Effect Composer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());
//Initialize model group to null
let modelGroup = null;
export let obj = null

//Probably unnecessary, but used when line segments exist without a mesh
function sparsifyLineGeometry(geometry, step = 3) {
    const pos = geometry.attributes.position.array;
    const newPositions = [];

    // Each line segment = 2 points = 6 values (x,y,z * 2)
    for (let i = 0; i < pos.length; i += 6 * step) {
        for (let j = 0; j < 6; j++) {
            if (i + j < pos.length) {
                newPositions.push(pos[i + j]);
            }
        }
    }

    const newGeom = new THREE.BufferGeometry();
    newGeom.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(newPositions, 3)
    );

    return newGeom;
}

// Function to create outline of 3D model with white lines. Styled like tron (my favorite movie)
function makeCRTModel(obj) {
    const group = new THREE.Group();
    obj.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const fill = new THREE.Mesh(
                child.geometry,
                new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    side: THREE.DoubleSide,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                    polygonOffsetUnits: 1
                })
            );

            const edges = new THREE.EdgesGeometry(child.geometry, 5);
            const lines = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xffffff })
            );

            group.add(fill);
            group.add(lines);
        }
        //Honestly, this segment seems to cause some trouble and may need to be changed for some models
        else if (child.isLineSegments && child.geometry) {
            const sparseGeom = sparsifyLineGeometry(child.geometry, 3);
            const lines = new THREE.LineSegments(
                sparseGeom,
                new THREE.LineBasicMaterial({ color: 0xffffff })
            );
            group.add(lines);
        }

    });


    // Center the inner contents so the outer group can rotate around (0,0,0)
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    group.children.forEach((c) => c.position.sub(center));
    group.scale.setScalar(0.5);
    const pivot = new THREE.Group();
    pivot.add(group);
    //set camera position based on size of model
    camera.position.set(size * 0.3, size * 0.2, size * 0.6);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
    return pivot;
}

if (!window.OBJ_DATA) {
    console.log("Error! No object data detected");
} else {
    obj = new OBJLoader().parse(window.OBJ_DATA);
    modelGroup = makeCRTModel(obj);
    scene.add(modelGroup);
}

function animate() {
    requestAnimationFrame(animate);
    if (modelGroup) {
        modelGroup.rotation.y += 0.002;

    }
    controls.update();
    composer.render();
}
animate();

addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
});


