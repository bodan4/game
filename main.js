import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128/build/three.module.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.128/examples/jsm/renderers/CSS2DRenderer.js';

let scene;
let camera;
let renderer;
let cssRenderer;
let rocket;
let asteroids = [];
let lasers = [];
let energies = [];
let laserSpeed = 5;
let clock;
let health = 100;
let score = 0;
let healthLabel;
let scoreLabel;


function init() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create CSS renderer for 2D elements
  cssRenderer = new CSS2DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  document.body.appendChild(cssRenderer.domElement);

  // Load textures
  const textureLoader = new THREE.TextureLoader();
  const rocketTexture = textureLoader.load('./rocket.png');
  const asteroidTexture = textureLoader.load('./asteroid1.png');
  const energyTexture = textureLoader.load('./energy.png');

  // Create rocket
  const rocketGeometry = new THREE.ConeGeometry(0.2, 1, 32);
  const rocketMaterial = new THREE.MeshBasicMaterial({ map: rocketTexture });
  rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
  rocket.rotation.x = Math.PI / 2;
  scene.add(rocket);

  // Create asteroids
  for (let i = 0; i < 10; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTexture });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.x = Math.random() * 10 - 5;
    asteroid.position.y = Math.random() * 10 - 5;
    asteroid.position.z = Math.random() * -20;
    asteroids.push(asteroid);
    scene.add(asteroid);
  }

  // Create energies as small cylindrical batteries
  for (let i = 0; i < 5; i++) {
    const energyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32); // Adjusted size
    const energyMaterial = new THREE.MeshBasicMaterial({ map: energyTexture });
    const energy = new THREE.Mesh(energyGeometry, energyMaterial);
    energy.position.x = Math.random() * 10 - 5;
    energy.position.y = Math.random() * 10 - 5;
    energy.position.z = Math.random() * -20;
    energies.push(energy);
    scene.add(energy);
  }

  // Initialize clock
  clock = new THREE.Clock();

  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keydown', onKeyDownHandler);
  // Create and add health and score labels
  createLabels();

  // Initialize health and score display
  updateHealthDisplay();
  updateScoreDisplay();
}

function createLabels() {
  // Health label
  const healthDiv = document.createElement('div');
  healthDiv.className = 'label';
  healthDiv.style.color = 'white';
  healthDiv.style.fontSize = '20px';
  healthDiv.textContent = `Health: ${health}%`;
  healthLabel = new CSS2DObject(healthDiv);
  healthLabel.position.set(-2, 2, 0);
  scene.add(healthLabel);

  // Score label
  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'label';
  scoreDiv.style.color = 'white';
  scoreDiv.style.fontSize = '20px';
  scoreDiv.textContent = `Score: ${score}`;
  scoreLabel = new CSS2DObject(scoreDiv);
  scoreLabel.position.set(2, 2, 0);
  scene.add(scoreLabel);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.key) {
    case 'a': // A key
      rocket.position.x -= 0.1;
      break;
    case 'd': // D key
      rocket.position.x += 0.1;
      break;
    case 'w': // W key
      rocket.position.y += 0.1;
      break;
    case 's': // S key
      rocket.position.y -= 0.1;
      break;
  }
}

function updateHealthDisplay() {
  healthLabel.element.textContent = `Health: ${health}%`;
}

function updateScoreDisplay() {
  scoreLabel.element.textContent = `Score: ${score}`;
}

function gameOver() {
  alert("Game Over!");
  window.location.reload();
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Move asteroids
  asteroids.forEach(asteroid => {
    asteroid.position.z += 2 * delta;
    if (asteroid.position.z > 5) {
      asteroid.position.z = Math.random() * -20;
      asteroid.position.x = Math.random() * 10 - 5;
      asteroid.position.y = Math.random() * 10 - 5;
    }

    // Collision detection with asteroids
    if (rocket.position.distanceTo(asteroid.position) < 0.5) {
      score += 1;
      updateScoreDisplay();
      if (score >= 4) {
        health = 0;
        updateHealthDisplay();
        gameOver();
      } else {
        asteroid.position.z = Math.random() * -20;
        asteroid.position.x = Math.random() * 10 - 5;
        asteroid.position.y = Math.random() * 10 - 5;
      }
    }
  });

  // Move energies
  energies.forEach(energy => {
    energy.position.z += 1 * delta;
    if (energy.position.z > 5) {
      energy.position.z = Math.random() * -20;
      energy.position.x = Math.random() * 10 - 5;
      energy.position.y = Math.random() * 10 - 5;
    }

    // Collision detection with energies
    if (rocket.position.distanceTo(energy.position) < 0.5) {
      health = Math.min(100, health + 20); // Increase health
      updateHealthDisplay();
      energy.position.z = Math.random() * -20;
      energy.position.x = Math.random() * 10 - 5;
      energy.position.y = Math.random() * 10 - 5;
    }
  });

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

// Funcția pentru detectarea coliziunilor între lasere și asteroizi
function detectCollisions() {
  // Verifică fiecare asteroid pentru coliziunea cu laserele
  for (let i = 0; i < lasers.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (lasers[i].position.distanceTo(asteroids[j].position) < 0.5) { // Distanța de coliziune
        // Dacă un laser și un asteroid sunt suficient de apropiați, distrugem asteroidul și eliminăm laserul
        scene.remove(asteroids[j]);
        scene.remove(lasers[i]);
        lasers.splice(i, 1); // Eliminăm laserul din array
        asteroids.splice(j, 1); // Eliminăm asteroidul din array

        // Incrementăm scorul și actualizăm afișarea scorului
        score += 1;
        updateScoreDisplay();
        return; // Ne oprim din detectarea coliziunilor după distrugerea unui asteroid
      }
    }
  }
}



// Adaugă un event listener pentru tasta spațiu pentru a trage cu laserul
function onKeyDownHandler (event) {
  switch (event.key) {
    case ' ': // Spațiu pentru a trage
      createLaser();
      break;
    case 'a': // A key
      rocket.position.x -= 0.1;
      break;
    case 'd': // D key
      rocket.position.x += 0.1;
      break;
    case 'w': // W key
      rocket.position.y += 0.1;
      break;
    case 's': // S key
      rocket.position.y -= 0.1;
      break;
  }
}



// Funcția pentru animație

function animateLaser() {
  requestAnimationFrame(animateLaser);
  // Mișcare laser
  for (let i = 0; i < lasers.length; i++) {
    lasers[i].translateY(laserSpeed * clock.getDelta()); // Deplasare în sus
    if (lasers[i].position.y > 5) { // Dacă laserul iese din câmpul vizual, îl eliminăm
      scene.remove(lasers[i]);
      lasers.splice(i, 1);
    }
  }

  detectCollisions(); // Verifică coliziunile cu asteroizii

  renderer.render(scene, camera);
}



function startGame() {
  document.getElementById('menu').style.display = 'none';
  init();
  animate();
}

document.getElementById('startButton').addEventListener('click', startGame);