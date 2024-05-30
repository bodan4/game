import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

let scene;
let camera;
let renderer;
let cssRenderer;
let rocket;
let asteroids = [];
let planets = [];
let lasers = [];
let energies = [];
let laserSpeed = 5;
let clock;
let health = 100;
let score = 0;
let energyCollected = 0;
let healthLabel;
let scoreLabel;
let energyLabel;
let keysPressed = {};

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  cssRenderer = new CSS2DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  document.body.appendChild(cssRenderer.domElement);

  // Load textures
  const textureLoader = new THREE.TextureLoader();
  const rocketTexture = textureLoader.load('./ship.png');
  const asteroidTextures = [
    textureLoader.load('./asteroid1.png'),
    textureLoader.load('./asteroid2.png'),
    textureLoader.load('./asteroid3.png'),
    textureLoader.load('./asteroid4.png')
  ];
  const energyTexture = textureLoader.load('./energy.png');

  // Create rocket
  const rocketGeometry = new THREE.PlaneGeometry(0.8, 0.65);
  const rocketMaterial = new THREE.MeshBasicMaterial({ map: rocketTexture, transparent: true });
  rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
  rocket.position.set(0, 0, 0); // Set position in the scene
  scene.add(rocket);

  for (let i = 0; i < 10; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const randomTextureIndex = Math.floor(Math.random() * asteroidTextures.length);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTextures[randomTextureIndex] });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.x = Math.random() * 10 - 5;
    asteroid.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    asteroid.position.z = Math.random() * -20;
    asteroids.push(asteroid);
    scene.add(asteroid);
  }

  // Create energies
  for (let i = 0; i < 5; i++) {
    const energyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 32);  // Smaller geometry
    const energyMaterial = new THREE.MeshBasicMaterial({ map: energyTexture });
    const energy = new THREE.Mesh(energyGeometry, energyMaterial);
    energy.position.x = Math.random() * 10 - 5;
    energy.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    energy.position.z = Math.random() * -20;
    energies.push(energy);
    scene.add(energy);
  }


  function addRandomPlanets(numPlanets) {
    const textureLoader = new THREE.TextureLoader();
    const planetTextures = [
      textureLoader.load('./planet1.png'),
      textureLoader.load('./planet2.png'),
      textureLoader.load('./planet3.png'),
      textureLoader.load('./planet4.png')
    ];

    for (let i = 0; i < numPlanets; i++) {
      const planetGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Adjust size as needed
      const randomTextureIndex = Math.floor(Math.random() * planetTextures.length);
      const planetMaterial = new THREE.MeshBasicMaterial({ map: planetTextures[randomTextureIndex], transparent: true });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      // Randomize position
      planet.position.x = Math.random() * 20 - 10; // Adjust range as needed
      planet.position.y = Math.random() * 10 - 5;  // Adjust range as needed
      planet.position.z = Math.random() * -50 - 10; // Ensure planets are initially placed in front

      planets.push(planet);
      scene.add(planet);
    }
  }
  // Add random planets
  addRandomPlanets(9); // Adjust the number of planets as needed

  clock = new THREE.Clock();

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  createLabels();
  updateHealthDisplay();
  updateScoreDisplay();
  updateEnergyDisplay();
}

function createLabels() {
  const healthDiv = document.createElement('div');
  healthDiv.className = 'label';
  healthDiv.style.color = 'white';
  healthDiv.style.fontSize = '20px';
  healthDiv.textContent = `Health: ${health}%`;
  healthLabel = new CSS2DObject(healthDiv);
  healthLabel.position.set(-3.5, 3.2, 0);
  scene.add(healthLabel);

  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'label';
  scoreDiv.style.color = 'white';
  scoreDiv.style.fontSize = '20px';
  scoreDiv.textContent = `Score: ${score}`;
  scoreLabel = new CSS2DObject(scoreDiv);
  scoreLabel.position.set(2.5, 3.2, 0);
  scene.add(scoreLabel);

  const energyDiv = document.createElement('div');
  energyDiv.className = 'label';
  energyDiv.style.color = 'white';
  energyDiv.style.fontSize = '20px';
  energyDiv.textContent = `Energy: ${energyCollected}`;
  energyLabel = new CSS2DObject(energyDiv);
  energyLabel.position.set(0, 3.2, 0);
  scene.add(energyLabel);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  keysPressed[event.key] = true;
}

function onKeyUp(event) {
  keysPressed[event.key] = false;
}

function updateHealthDisplay() {
  healthLabel.element.textContent = `Health: ${health}%`;
}

function updateScoreDisplay() {
  scoreLabel.element.textContent = `Score: ${score}`;
}

function updateEnergyDisplay() {
  energyLabel.element.textContent = `Energy: ${energyCollected}`;
}

function restartGame() {
  // Reset game state
  health = 100;
  score = 0;
  energyCollected = 0;
  updateHealthDisplay();
  updateScoreDisplay();
  updateEnergyDisplay();

  // Remove existing asteroids and lasers from the scene
  asteroids.forEach(asteroid => scene.remove(asteroid));
  lasers.forEach(laser => scene.remove(laser));
  energies.forEach(energy => scene.remove(energy));
  // Clear arrays
  asteroids = [];
  lasers = [];
  energies = [];

  // Reinitialize game objects
  for (let i = 0; i < 10; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const randomTextureIndex = Math.floor(Math.random() * asteroidTextures.length);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTextures[randomTextureIndex] });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.x = Math.random() * 10 - 5;
    asteroid.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    asteroid.position.z = Math.random() * -20;
    asteroids.push(asteroid);
    scene.add(asteroid);
  }

  for (let i = 0; i < 5; i++) {
    const energyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 32);  // Smaller geometry
    const energyMaterial = new THREE.MeshBasicMaterial({ map: energyTexture });
    const energy = new THREE.Mesh(energyGeometry, energyMaterial);
    energy.position.x = Math.random() * 10 - 5;
    energy.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    energy.position.z = Math.random() * -20;
    energies.push(energy);
    scene.add(energy);
  }

  // Hide game over screen and show game screen
  document.getElementById('gameOver').style.display = 'none';
  renderer.domElement.style.display = 'block';
  cssRenderer.domElement.style.display = 'block';
}

function gameOver() {
  alert('Game Over!');
  restartGame();
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Smooth rocket movement
  if (keysPressed['a']) {
    rocket.position.x -= 2 * delta;
  }
  if (keysPressed['d']) {
    rocket.position.x += 2 * delta;
  }
  if (keysPressed['w']) {
    rocket.position.y += 2 * delta;
  }
  if (keysPressed['s']) {
    rocket.position.y -= 2 * delta;
  }
  if (keysPressed[' ']) {
    createLaser();
  }

  // Move asteroids
  asteroids.forEach(asteroid => {
    asteroid.position.z += 2 * delta;
    if (asteroid.position.z > 5) {
      asteroid.position.z = Math.random() * -20;
      asteroid.position.x = Math.random() * 10 - 5;
      asteroid.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    }
    // Collision detection with asteroids
    if (rocket.position.distanceTo(asteroid.position) < 0.5) {
      health -= 20;
      updateHealthDisplay();
      if (health <= 0) {
        gameOver();
      } else {
        asteroid.position.z = Math.random() * -20;
        asteroid.position.x = Math.random() * 10 - 5;
        asteroid.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
      }
    }
  });

  // Move energies
  energies.forEach(energy => {
    energy.position.z += 1 * delta;
    if (energy.position.z > 5) {
      energy.position.z = Math.random() * -20;
      energy.position.x = Math.random() * 10 - 5;
      energy.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    }
    // Collision detection with energies
    if (rocket.position.distanceTo(energy.position) < 0.5) {
      energyCollected += 1;
      health = Math.min(100, health + 20);
      updateHealthDisplay();
      updateEnergyDisplay();
      energy.position.z = Math.random() * -20;
      energy.position.x = Math.random() * 10 - 5;
      energy.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    }
  });

  moveLasers(delta);
  detectCollisions();

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

// Function for detecting collisions between lasers and asteroids
function detectCollisions() {
  // Check each asteroid for collision with lasers
  for (let i = 0; i < lasers.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (lasers[i].position.distanceTo(asteroids[j].position) < 0.5) { // Collision distance
        // If a laser and an asteroid are close enough, destroy the asteroid and remove the laser
        scene.remove(asteroids[j]);
        scene.remove(lasers[i]);
        lasers.splice(i, 1); // Remove laser from array
        asteroids.splice(j, 1); // Remove asteroid
        // Increment score and update score display
        score += 1;
        updateScoreDisplay();
        return; // Stop collision detection after destroying an asteroid
      }
    }
  }
}

// Create laser
function createLaser() {
  const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
  const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const laser = new THREE.Mesh(laserGeometry, laserMaterial);
  laser.position.set(rocket.position.x, rocket.position.y, rocket.position.z);
  laser.rotation.x = Math.PI / 2;
  lasers.push(laser);
  scene.add(laser);
}

function moveLasers(delta) {
  for (let i = 0; i < lasers.length; i++) {
    lasers[i].position.z -= laserSpeed * delta;
    if (lasers[i].position.z < -20) {
      scene.remove(lasers[i]);
      lasers.splice(i, 1);
    }
  }
}

// Start the game
function startGame() {
  document.getElementById('menu').style.display = 'none';
  init();
  animate();
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', restartGame);

