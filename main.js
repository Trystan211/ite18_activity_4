// Import necessary classes from Three.js (if using modules)
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';

// Basic Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);  // Enable mouse controls

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const movingLight = new THREE.PointLight(0xffaa33, 1, 100);
movingLight.position.set(0, 10, 0);
scene.add(movingLight);

// Ocean
let ocean;
function createOcean() {
    const oceanGeometry = new THREE.PlaneGeometry(50, 50, 100, 100);
    const oceanMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1e90ff,
        metalness: 0.8,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        reflectivity: 0.6,
        side: THREE.DoubleSide,
    });
    ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);
}
createOcean();

// Palm Trees with Raycasting
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const palmTrees = [];
function createPalmTree(x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 2, 16), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
    trunk.position.set(x, 1, z);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 8), treeMaterial);
    leaves.position.set(x, 2, z);
    scene.add(trunk, leaves);
    palmTrees.push(trunk); // Add trunk for raycasting
}
createPalmTree(-5, 5);
createPalmTree(10, -10);

// Rain
const rainGeometry = new THREE.BufferGeometry();
const rainCount = 1500;
const rainPositions = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = Math.random() * 50 - 25; // X
    rainPositions[i * 3 + 1] = Math.random() * 30;  // Y
    rainPositions[i * 3 + 2] = Math.random() * 50 - 25; // Z
}
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.PointsMaterial({ color: 0x87ceeb, size: 0.2 });
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Boat
const boat = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x8b0000 })
);
boat.position.set(0, 0.3, 10);
scene.add(boat);

// Ripples on Click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ocean);
    if (intersects.length > 0) {
        const ripple = new THREE.Mesh(
            new THREE.CircleGeometry(0.5, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        );
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.set(intersects[0].point.x, 0.1, intersects[0].point.z);
        scene.add(ripple);

        // Fade out and remove the ripple
        setTimeout(() => scene.remove(ripple), 1000);
    }
});

// Animate Waves
function animateWaves() {
    const time = Date.now() * 0.001;
    const positions = ocean.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = Math.sin((i + time * 5) * 0.05); // Wave effect
    }
    ocean.geometry.attributes.position.needsUpdate = true;
}

// Animate Rain
function animateRain() {
    const positions = rain.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.3; // Move rain down
        if (positions[i] < 0) {
            positions[i] = Math.random() * 30; // Reset to top
            createSplash(positions[i - 1], positions[i + 1]);
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;
}

// Create Splash
function createSplash(x, z) {
    const splash = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.5 })
    );
    splash.position.set(x, 0.1, z);
    scene.add(splash);

    // Fade out splash
    setTimeout(() => {
        scene.remove(splash);
    }, 500);
}

// Animate Boat
function animateBoat() {
    const time = Date.now() * 0.001;
    boat.position.y = 0.5 + Math.sin(time) * 0.2; // Vertical motion
    boat.rotation.z = Math.sin(time * 0.5) * 0.1; // Rocking motion
}

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();  // Update controls after resizing
});

// Animation Loop
camera.position.set(0, 10, 30);
function animate() {
    requestAnimationFrame(animate);

    // Update animations
    animateWaves();
    animateRain();
    animateBoat();

    // Move light in a circular path
    movingLight.position.x = Math.sin(Date.now() * 0.001) * 10;
    movingLight.position.z = Math.cos(Date.now() * 0.001) * 10;

    // Update OrbitControls (to handle user input)
    controls.update();  // Only needed if controls.enableDamping or controls.auto-rotation are enabled

    renderer.render(scene, camera);
}
animate();
