/*
SVG texture handling
*/
import * as THREE from 'three';
import {renderer} from './renderhome.js';

export async function loadSvgAsTexture(url, resolution = 2048, tint = 'white', background = 'black') {
    const img = new Image();
    img.src = url;
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Failed to load SVG: ${url}`));
    });

    const imgW = img.naturalWidth || 300;
    const imgH = img.naturalHeight || 150;
    const imgAspect = imgW / imgH;

    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');

    // Contain fit into a square canvas
    let drawW, drawH, drawX, drawY;
    if (imgAspect > 1) {
        drawW = resolution;
        drawH = resolution / imgAspect;
        drawX = 0;
        drawY = (resolution - drawH) / 2;
    } else {
        drawH = resolution;
        drawW = resolution * imgAspect;
        drawX = (resolution - drawW) / 2;
        drawY = 0;
    }

    // 1. Draw the SVG as-is
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 2. Tint non-transparent pixels to a solid color
    if (tint) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, resolution, resolution);
    }

    // 3. Fill background *under* existing content
    if (background) {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, resolution, resolution);
    }

    ctx.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    return texture;
}

export async function loadImageAsTexture(url, resolution = 2048) {
    const img = new Image();
    img.crossOrigin = 'anonymous';          // required so the canvas stays untainted
    img.src = url;
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = resolution;
    const ctx = canvas.getContext('2d');

    // Contain-fit into the square so nothing stretches.
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawW  = aspect > 1 ? resolution : resolution * aspect;
    const drawH  = aspect > 1 ? resolution / aspect : resolution;
    const drawX  = (resolution - drawW) / 2;
    const drawY  = (resolution - drawH) / 2;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, resolution, resolution);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    return texture;
}

export async function loadVideoAsTexture(url, { resolution = 2048, loop = true, muted = true } = {}) {
    const video = document.createElement('video');
    video.src         = url;
    video.crossOrigin = 'anonymous';
    video.loop        = loop;
    video.muted       = muted;        // required for autoplay without a user gesture
    video.playsInline = true;         // mobile Safari: stay inline instead of fullscreening
    video.preload     = 'auto';

    await new Promise((resolve, reject) => {
        video.addEventListener('canplay', resolve, { once: true });
        video.addEventListener('error',   () => reject(new Error(`Failed to load video: ${url}`)), { once: true });
    });

    try { await video.play(); } catch (_) { /* autoplay blocked; will start on first user gesture */ }

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = resolution;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const DARKEN = 0.0;   // 0 = no change, 1 = pure black

    const drawFrame = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
            ctx.drawImage(video, 0, 0, resolution, resolution);
            if (DARKEN > 0) {
                ctx.fillStyle = `rgba(0, 0, 0, ${DARKEN})`;
                ctx.fillRect(0, 0, resolution, resolution);
            }
            texture.needsUpdate = true;
        }
        if (video.requestVideoFrameCallback) {
            video.requestVideoFrameCallback(drawFrame);
        } else {
            requestAnimationFrame(drawFrame);
        }
    };
    drawFrame();

    return texture;
}