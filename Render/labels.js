/*
File for all labels
*/

import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js';

// Initialize label renderer
export const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.position     = 'absolute';
labelRenderer.domElement.style.top          = '0';
labelRenderer.domElement.style.left         = '0';
labelRenderer.domElement.style.pointerEvents = 'none';  // lets OrbitControls still work
document.body.appendChild(labelRenderer.domElement);

// Title Label
const titlediv = document.createElement('titlediv');
titlediv.textContent = "Welcome to Josh's Portfolio! Click a face to begin";
titlediv.style.color = '#00FF00';
titlediv.style.background = 'rgba(0,0,0,0.5)';
titlediv.style.padding = '4px 8px';
titlediv.style.borderRadius = '4px';
titlediv.style.borderStyle = 'solid';
titlediv.style.borderWidth = '1px';
titlediv.style.borderColor = '#ffffff';
titlediv.style.fontFamily = 'Orbitron';
export const titlelabel = new CSS2DObject(titlediv);

// reminder Label
const reminderdiv = document.createElement('reminderdiv');
reminderdiv.textContent = "Press Esc to return";
reminderdiv.style.color = '#FF0000';
reminderdiv.style.background = 'rgba(0,0,0,0.5)';
reminderdiv.style.padding = '4px 8px';
reminderdiv.style.borderRadius = '4px';
reminderdiv.style.borderStyle = 'solid';
reminderdiv.style.borderWidth = '1px';
reminderdiv.style.borderColor = '#ffffff';
reminderdiv.style.fontFamily = 'Orbitron';
export const reminderlabel = new CSS2DObject(reminderdiv);

// project1 link
const p1linkDiv = document.createElement('div');
const p1linkAnchor = document.createElement('a');
p1linkAnchor.href = 'https://soonerracing.com';
p1linkAnchor.target = '_blank';
p1linkAnchor.rel = 'noopener noreferrer';
p1linkAnchor.textContent = 'Click to view more';
p1linkAnchor.style.color = '#fff';
p1linkAnchor.style.background = 'rgba(0,0,0,0.7)';
p1linkAnchor.style.padding = '6px 12px';
p1linkAnchor.style.borderRadius = '4px';
p1linkAnchor.style.border = '1px solid #fff';
p1linkAnchor.style.fontFamily = 'Orbitron';
p1linkAnchor.style.textDecoration = 'none';
p1linkAnchor.style.pointerEvents = 'auto';  // override the renderer's default none
p1linkDiv.appendChild(p1linkAnchor);

export const p1link = new CSS2DObject(p1linkDiv);