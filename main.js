import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50); // Stormy atmosphere fog

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
dynamicLight.position.set(0, 10, 0);
scene.add(dynamicLight);

// Starry Sky (Background Effect)
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = [];
for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = Math.random() * 50 + 10;
    const z = (Math.random() - 0.5) * 200;
    starPositions.push(x, y, z);
}
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Ocean Geometry
const geometry = new THREE.PlaneGeometry(50, 50, 400, 400); // High subdivisions for smooth waves
geometry.rotateX(-Math.PI / 2);

// Ocean Shader Material
const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        waveHeight: { value: 1.5 }, // Adjusted for smoother wave dynamics
        waveFrequency: { value: 0.6 },
        secondaryWaveHeight: { value: 0.3 },
        secondaryWaveFrequency: { value: 2.0 },
        foamColor: { value: new THREE.Color(0xffffff) },
        deepColor: { value: new THREE.Color(0x001d3a) },
        shallowColor: { value: new THREE.Color(0x1e90ff) },
    },
    vertexShader: `
        uniform float time;
        uniform float waveHeight;
        uniform float waveFrequency;
        uniform float secondaryWaveHeight;
        uniform float secondaryWaveFrequency;
        varying vec2 vUv;
        varying float vWaveHeight;

        void main() {
            vUv = uv;
            vec3 pos = position;

            // Large stormy waves
            float largeWave = sin(pos.x * waveFrequency + time) * waveHeight;
            largeWave += cos(pos.z * waveFrequency + time * 1.5) * waveHeight;

            // Secondary small waves for rough surface
            float secondaryWave = sin(pos.x * secondaryWaveFrequency + time * 2.0) * secondaryWaveHeight;
            secondaryWave += cos(pos.z * secondaryWaveFrequency + time * 2.5) * secondaryWaveHeight;

            pos.y += largeWave + secondaryWave;

            vWaveHeight = pos.y; // Pass wave height to fragment shader
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 foamColor;
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        varying vec2 vUv;
        varying float vWaveHeight;

        void main() {
            // Base color blend based on wave height
            vec3 color = mix(shallowColor, deepColor, vUv.y);

            // Foam effect at wave peaks
            float foam = smoothstep(1.0, 1.5, abs(vWaveHeight));
            color = mix(color, foamColor, foam);

            gl_FragColor = vec4(color, 1.0);
        }
    `,
});

// Add Ocean Mesh
const ocean = new THREE.Mesh(geometry, oceanMaterial);
scene.add(ocean);

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Update Ocean
    oceanMaterial.uniforms.time.value = elapsedTime;

    // Move Light Source Dynamically
    dynamicLight.position.set(
        10 * Math.sin(elapsedTime * 0.5),
        10,
        10 * Math.cos(elapsedTime * 0.5)
    );

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

