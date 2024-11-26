import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50); // Add fog for depth effect

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
scene.add(camera);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Dynamic Light
const dynamicLight = new THREE.PointLight(0xffffff, 2, 50);
dynamicLight.position.set(0, 10, 0); // Initial light position
scene.add(dynamicLight);

// Ocean Geometry
const geometry = new THREE.PlaneGeometry(50, 50, 200, 200); // Increased detail
geometry.rotateX(-Math.PI / 2);

// Ocean Shader Material
const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        waveHeight: { value: 2.5 }, // Increased wave height
        waveFrequency: { value: 0.5 }, // Lowered frequency for larger waves
        deepColor: { value: new THREE.Color(0x001d3a) },
        shallowColor: { value: new THREE.Color(0x1e90ff) },
    },
    vertexShader: `
        uniform float time;
        uniform float waveHeight;
        uniform float waveFrequency;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec3 pos = position;
            pos.y += sin(pos.x * waveFrequency + time) * waveHeight * 0.8;
            pos.y += cos(pos.z * waveFrequency + time * 1.5) * waveHeight * 0.6;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        varying vec2 vUv;

        void main() {
            vec3 color = mix(shallowColor, deepColor, vUv.y);
            gl_FragColor = vec4(color, 1.0);
        }
    `,
});

// Add Ocean Mesh
const ocean = new THREE.Mesh(geometry, oceanMaterial);
scene.add(ocean);

// Load Boat Model
const loader = new GLTFLoader();
let boat = null;

loader.load(
    'https://trystan211.github.io/ite18_activity_4/ramona_steam_boat.glb', 
    (gltf) => {
        boat = gltf.scene;
        boat.scale.set(0.5, 0.5, 0.5); // Scale the boat appropriately
        boat.position.set(0, 1, 0); // Position the boat on the ocean
        scene.add(boat);
    },
    undefined,
    (error) => {
        console.error("Error loading the boat model:", error);
    }
);

// Rain Geometry
const rainCount = 10000;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = [];
const rainVelocities = [];

for (let i = 0; i < rainCount; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = Math.random() * 50;
    const z = (Math.random() - 0.5) * 100;
    rainPositions.push(x, y, z);
    rainVelocities.push(-0.2 - Math.random() * 0.5); // Rain falls downward
}

rainGeometry.setAttribute("position", new THREE.Float32BufferAttribute(rainPositions, 3));

// Rain Material
const rainMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
});

// Add Rain Particles
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Update Ocean
    oceanMaterial.uniforms.time.value = elapsedTime;

    // Update Rain
    const positions = rain.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] += rainVelocities[i]; // Y-axis movement (falling)
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 50; // Reset rain drop
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;

    // Move Light Source
    dynamicLight.position.set(
        10 * Math.sin(elapsedTime * 0.5),
        10,
        10 * Math.cos(elapsedTime * 0.5)
    );

    // Move the Boat with the Waves
    if (boat) {
        boat.position.x = Math.sin(elapsedTime * 0.5) * 5; // Boat moves along the X-axis with the waves
        boat.position.z = Math.cos(elapsedTime * 0.5) * 5; // Boat moves along the Z-axis with the waves
        boat.position.y = Math.sin(elapsedTime * 0.5) * 2 + 1; // Boat moves up and down with the ocean
    }

    // Render Scene
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle Resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
