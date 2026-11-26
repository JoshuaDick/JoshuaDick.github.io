/*
This file builds the animated wireframe ocean under the cube
*/

import * as THREE from 'three';

const OCEAN_SIZE = 80;     // world units across (cube is 2)
const OCEAN_SEGS = 160;    // grid cells per side -> 0.5 unit spacing
const OCEAN_Y    = -2.5;   // cube spans y = -1..1, so this sits just below it
const CELL       = OCEAN_SIZE / OCEAN_SEGS;

// Square grid of line segments (no triangle diagonals like wireframe:true gives)
function buildGridGeometry(size, segs) {
    const half = size / 2;
    const step = size / segs;
    const pts = [];
    for (let i = 0; i <= segs; i++) {
        const a = -half + i * step;
        for (let j = 0; j < segs; j++) {
            const b0 = -half + j * step;
            const b1 = b0 + step;
            pts.push(b0, 0, a,  b1, 0, a);   // segment along X
            pts.push(a, 0, b0,  a, 0, b1);   // segment along Z
        }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geom;
}

const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime:     { value: 0 },
        uColor:    { value: new THREE.Color(0xffffff) },  // ocean color
        uFadeNear: { value: 6.0 },    // fully visible inside this distance
        uFadeFar:  { value: 28.0 },   // fully faded into the black background
    },
    vertexShader: /* glsl */`
        uniform float uTime;
        varying float vDepth;
        varying float vHeight;

        // A few stacked sine waves, evaluated in WORLD space so the
        // grid can slide with the camera without the waves moving
        float waveHeight(vec2 p, float t) {
            float h = 0.0;
            h += sin(p.x * 0.35 + t * 0.9) * 0.30;
            h += sin(p.y * 0.25 + t * 0.7) * 0.25;
            h += sin((p.x + p.y) * 0.60 + t * 1.3) * 0.12;
            h += sin((p.x - p.y) * 1.10 + t * 1.7) * 0.05;
            return h;
        }

        void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            float h = waveHeight(world.xz, uTime);
            world.y += h;
            vHeight = h;

            vec4 mv = viewMatrix * world;
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
        }
    `,
    fragmentShader: /* glsl */`
        uniform vec3  uColor;
        uniform float uFadeNear;
        uniform float uFadeFar;
        varying float vDepth;
        varying float vHeight;

        void main() {
            float fade  = 1.0 - smoothstep(uFadeNear, uFadeFar, vDepth);
            float crest = 0.35 + 0.55 * smoothstep(-0.5, 0.6, vHeight); // brighter peaks
            gl_FragColor = vec4(uColor * crest, fade);
        }
    `,
    transparent: true,
    depthWrite: false,
});

export const ocean = new THREE.LineSegments(buildGridGeometry(OCEAN_SIZE, OCEAN_SEGS), oceanMaterial);
ocean.position.y = OCEAN_Y;
ocean.frustumCulled = false; 

// Call once per frame from the render loop
export function updateOcean(timeSeconds, camera) {
    oceanMaterial.uniforms.uTime.value = timeSeconds;

    // Keep the grid centered under the camera (snapped to whole cells so it doesn't swim)
    ocean.position.x = Math.round(camera.position.x / CELL) * CELL;
    ocean.position.z = Math.round(camera.position.z / CELL) * CELL;

    // Clicking the bottom (-Y) face flies the camera under the cube; hide the
    // ocean then so its lines don't draw over that face's video
    ocean.visible = camera.position.y > OCEAN_Y + 0.5;
}