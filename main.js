import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011); // Dark ocean background

// Add Fog
scene.fog = new THREE.FogExp2(0x000022, 0.02); // Color and density for exponential fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ocean
const oceanGeometry = new THREE.PlaneGeometry(50, 50, 200, 200);
const oceanMaterial = new THREE.MeshStandardMaterial({
  color: 0x004488,
  emissive: 0x001122,
  metalness: 0.5,
  roughness: 0.8,
});
const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

// Vertex Displacement
const clock = new THREE.Clock();
function animateOcean() {
  const time = clock.getElapsedTime();
  const vertices = oceanGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    vertices[i + 1] = Math.sin(x * 0.2 + time * 2) * Math.sin(z * 0.3 + time * 1.5) * 1.5;
  }
  oceanGeometry.attributes.position.needsUpdate = true;
}

// Rain Particles
const rainGeometry = new THREE.BufferGeometry();
const rainCount = 2000;
const rainPositions = [];
for (let i = 0; i < rainCount; i++) {
  rainPositions.push(
    Math.random() * 50 - 25, // x
    Math.random() * 50,      // y
    Math.random() * 50 - 25  // z
  );
}
rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
});
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Rain Animation
function animateRain() {
  const positions = rainGeometry.attributes.position.array;
  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 1] -= 0.5; // Falling speed
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 50; // Reset rain particle
    }
  }
  rainGeometry.attributes.position.needsUpdate = true;
}

// Lightning
const lightning = new THREE.PointLight(0xffffff, 0, 100);
scene.add(lightning);

function triggerLightning() {
  if (Math.random() > 0.98) { // Random chance for lightning
    lightning.intensity = 10;
    setTimeout(() => {
      lightning.intensity = 0;
    }, 100); // Flash duration
  }
}

// Lights
const ambientLight = new THREE.AmbientLight(0x222222); // Dim ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xccccff, 0.5); // Moonlight
directionalLight.position.set(-10, 20, 10);
scene.add(directionalLight);

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation Loop
function animate() {
  animateOcean();
  animateRain();
  triggerLightning();

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// Handle Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
