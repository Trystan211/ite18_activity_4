import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50);

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

// Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Ocean Geometry
const geometry = new THREE.PlaneGeometry(50, 50, 100, 100);
geometry.rotateX(-Math.PI / 2);

// Ocean Shader Material
const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        waveHeight: { value: 1.5 },
        waveFrequency: { value: 3.0 },
        deepColor: { value: new THREE.Color(0x000d3a) },
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
            pos.y += sin(pos.x * waveFrequency + time) * waveHeight;
            pos.y += cos(pos.z * waveFrequency + time * 1.5) * waveHeight;
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
    // Update Ocean
    oceanMaterial.uniforms.time.value = clock.getElapsedTime();

    // Update Rain
    const positions = rain.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] += rainVelocities[i]; // Y-axis movement (falling)
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 50; // Reset rain drop
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;

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
