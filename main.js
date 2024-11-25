// Import Three.js modules
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene and Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Soft light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, -10);
scene.add(directionalLight);

// Sand Floor
const sandGeometry = new THREE.PlaneGeometry(100, 100);
const sandMaterial = new THREE.MeshStandardMaterial({ color: 0xf4a460 });
const sand = new THREE.Mesh(sandGeometry, sandMaterial);
sand.rotation.x = -Math.PI / 2;
scene.add(sand);

// Ocean
const oceanGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
const oceanMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e90ff,
  wireframe: false,
  side: THREE.DoubleSide,
});
const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.5;
scene.add(ocean);

// Function to Animate Ocean
function animateOcean() {
  const positions = oceanGeometry.attributes.position.array;

  for (let i = 0; i < positions.length / 3; i++) {
    const x = positions[i * 3];
    const z = positions[i * 3 + 2];
    const yIndex = i * 3 + 1; // Y-coordinate index
    positions[yIndex] = Math.sin(Date.now() * 0.002 + x * 0.5 + z * 0.5) * 0.5; // Wave effect
  }

  oceanGeometry.attributes.position.needsUpdate = true;
  oceanGeometry.computeVertexNormals();
}

// Rain
const rainGeometry = new THREE.BufferGeometry();
const rainCount = 5000;
const rainPositions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = Math.random() * 50 - 25; // X
  rainPositions[i * 3 + 1] = Math.random() * 50; // Y
  rainPositions[i * 3 + 2] = Math.random() * 50 - 25; // Z
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Function to Animate Rain
function animateRain() {
  const positions = rainGeometry.attributes.position.array;

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 1] -= 0.1; // Y-coordinate falls down

    // Reset rain drop if it falls below ground level
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = Math.random() * 50;
    }
  }

  rainGeometry.attributes.position.needsUpdate = true;
}

// Palm Trees
const palmGeometry = new THREE.CylinderGeometry(0.2, 0.5, 8, 10);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const palmTree1 = new THREE.Mesh(palmGeometry, trunkMaterial);
palmTree1.position.set(-5, 4, -5);
scene.add(palmTree1);

const palmTree2 = new THREE.Mesh(palmGeometry, trunkMaterial);
palmTree2.position.set(5, 4, -5);
scene.add(palmTree2);

const leafGeometry = new THREE.ConeGeometry(1, 2, 10);
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

for (let i = 0; i < 3; i++) {
  const leaf1 = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf1.position.set(0, 8, 0);
  leaf1.rotation.x = Math.PI / 6 - (i * Math.PI) / 6;
  palmTree1.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf2.position.set(0, 8, 0);
  leaf2.rotation.x = Math.PI / 6 - (i * Math.PI) / 6;
  palmTree2.add(leaf2);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  animateOcean();
  animateRain();

  controls.update();
  renderer.render(scene, camera);
}

// Handle Window Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start Animation
animate();
