import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Ocean (Dynamic water simulation)
const oceanGeometry = new THREE.PlaneGeometry(50, 50, 64, 64);
const oceanMaterial = new THREE.MeshPhongMaterial({
  color: 0x1E90FF,
  shininess: 80,
  transparent: true,
  opacity: 0.8,
});
const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

// Animate Ocean Waves
const waveSpeed = 0.03;
function animateOcean() {
  const time = performance.now() * 0.001;
  ocean.geometry.vertices.forEach((vertex, i) => {
    const wave = Math.sin(vertex.x * 0.5 + time) + Math.cos(vertex.y * 0.5 + time);
    vertex.z = wave * waveSpeed;
  });
  ocean.geometry.verticesNeedUpdate = true;
}

// Palm Trees
const palmMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown trunks
const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 }); // Green leaves
const raycastingObjects = [];

for (let i = 0; i < 10; i++) {
  const x = Math.random() * 20 - 10;
  const z = Math.random() * 20 - 10;

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 4),
    palmMaterial
  );
  trunk.position.set(x, 2, z);
  raycastingObjects.push(trunk);
  scene.add(trunk);

  // Leaves
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(2, 2, 16),
    leavesMaterial
  );
  leaves.position.set(x, 5, z);
  raycastingObjects.push(leaves);
  scene.add(leaves);
}

// Blue Rain Particles
const rainCount = 1000;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = [];
for (let i = 0; i < rainCount; i++) {
  rainPositions.push(
    Math.random() * 40 - 20,
    Math.random() * 20 + 5,
    Math.random() * 40 - 20
  );
}
rainGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(rainPositions, 3)
);
const rainMaterial = new THREE.PointsMaterial({
  color: 0x0000ff,
  size: 0.2,
  transparent: true,
});
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Moving Lights
const movingLights = [];
for (let i = 0; i < 5; i++) {
  const light = new THREE.PointLight(0xff0000, 1, 10);
  light.position.set(Math.random() * 20 - 10, 5, Math.random() * 20 - 10);
  movingLights.push(light);
  scene.add(light);
}

// Animate Moving Lights
function animateLights() {
  movingLights.forEach((light, index) => {
    light.position.x += Math.sin(performance.now() * 0.001 + index) * 0.05;
    light.position.z += Math.cos(performance.now() * 0.001 + index) * 0.05;
  });
}

// Raycasting Setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(raycastingObjects);

  if (intersects.length > 0) {
    if (intersectedObject) {
      intersectedObject.material.color.set(0x8B4513);
    }

    intersectedObject = intersects[0].object;
    intersectedObject.material.color.set(0xffff00); // Highlight color
  }
});

// Window Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

const animate = () => {
  const delta = clock.getDelta();
  controls.update();

  animateOcean();
  animateLights();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
