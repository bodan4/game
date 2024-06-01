import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Definirea variabilelor in scop global

let scene; // scena 3D
let camera; // camera de vizualizare
let renderer; // renderer-ul WebGL
let cssRenderer; // renderer-ul CSS2D
let rocket; // obiectul navei spațiale
let asteroids = []; //vector de asteroizi
let planets = []; // vector de planete
let lasers = []; // vector de lasere
let energies = []; // vector de energii
let laserSpeed = 5; // viteza laserului
let clock; // ceasul de măsurare a timpului
let health = 100; // sănătate inițială
let score = 0; // scor inițial
let energyCollected = 0; // energia colectată
let healthLabel; // eticheta de sănătate
let scoreLabel; // eticheta de scor
let energyLabel; // eticheta de energie
let keysPressed = {}; // rol de a urmări tastele apăsate


// Funcția de inițializare a scenei și a obiectelor din joc
function init() {
  scene = new THREE.Scene(); // Creează o nouă scenă

  // Creează o cameră perspectiva
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5; // Setează poziția camerei

  // Creează renderer-ul WebGL
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight); // Setează dimensiunea renderer-ului
  document.body.appendChild(renderer.domElement); // Adaugă renderer-ul la document

  // Creează renderer-ul CSS2D
  cssRenderer = new CSS2DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight); // Setează dimensiunea renderer-ului CSS2D
  cssRenderer.domElement.style.position = 'absolute'; // Setează poziția absolută
  cssRenderer.domElement.style.top = '0'; // Setează poziția în partea de sus a ferestrei
  document.body.appendChild(cssRenderer.domElement); // Adaugă renderer-ul CSS2D la document

  // Încarcă texturile folosind TextureLoader
  const textureLoader = new THREE.TextureLoader();
  const rocketTexture = textureLoader.load('./ship.png'); // Încarcă textura navei
  const asteroidTextures = [
    textureLoader.load('./asteroid1.png'), // Încarcă textura asteroidului 1
    textureLoader.load('./asteroid2.png'), // Încarcă textura asteroidului 2
    textureLoader.load('./asteroid3.png'), // Încarcă textura asteroidului 3
    textureLoader.load('./asteroid4.png')  // Încarcă textura asteroidului 4
  ];
  const energyTexture = textureLoader.load('./energy.png'); // Încarcă textura energiei

  // Creează geometria și materialul pentru navă
  const rocketGeometry = new THREE.PlaneGeometry(0.8, 0.65);
  const rocketMaterial = new THREE.MeshBasicMaterial({ map: rocketTexture, transparent: true });
  rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
  rocket.position.set(0, 0, 0); // Setează poziția navei în scenă
  scene.add(rocket); // Adaugă nava la scenă

  // Creează asteroizii
  for (let i = 0; i < 10; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const randomTextureIndex = Math.floor(Math.random() * asteroidTextures.length);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTextures[randomTextureIndex] });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.x = Math.random() * 10 - 5; // Setează poziția X a asteroidului
    asteroid.position.y = Math.random() * 4 - 2;  // Setează poziția Y a asteroidului
    asteroid.position.z = Math.random() * -20;    // Setează poziția Z a asteroidului
    asteroids.push(asteroid); // Adaugă asteroidul la array
    scene.add(asteroid); // Adaugă asteroidul la scenă
  }

  // Creează energiile
  for (let i = 0; i < 5; i++) {
    const energyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 32);  // Geometrie mică pentru energie
    const energyMaterial = new THREE.MeshBasicMaterial({ map: energyTexture });
    const energy = new THREE.Mesh(energyGeometry, energyMaterial);
    energy.position.x = Math.random() * 10 - 5; // Setează poziția X a energiei
    energy.position.y = Math.random() * 4 - 2;  // Setează poziția Y a energiei
    energy.position.z = Math.random() * -20;    // Setează poziția Z a energiei
    energies.push(energy); // Adaugă energia la array
    scene.add(energy); // Adaugă energia la scenă
  }

  // Funcție pentru adăugarea aleatorie a planetelor
  function addRandomPlanets(numPlanets) {
    const textureLoader = new THREE.TextureLoader();
    const planetTextures = [
      textureLoader.load('./planet1.png'), // Încarcă textura planetei 1
      textureLoader.load('./planet2.png'), // Încarcă textura planetei 2
      textureLoader.load('./planet3.png'), // Încarcă textura planetei 3
      textureLoader.load('./planet4.png')  // Încarcă textura planetei 4
    ];

    for (let i = 0; i < numPlanets; i++) {
      const planetGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Geometrie pentru planetă
      const randomTextureIndex = Math.floor(Math.random() * planetTextures.length);
      const planetMaterial = new THREE.MeshBasicMaterial({ map: planetTextures[randomTextureIndex], transparent: true });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      // Randomizează poziția
      planet.position.x = Math.random() * 20 - 10; // Setează poziția X a planetei
      planet.position.y = Math.random() * 10 - 5;  // Setează poziția Y a planetei
      planet.position.z = Math.random() * -50 - 10; // Setează poziția Z a planetei

      planets.push(planet); // Adaugă planeta la array
      scene.add(planet); // Adaugă planeta la scenă
    }
  }
  // Adaugă planetele aleatorii
  addRandomPlanets(9); // Ajustează numărul de planete după necesitate

  clock = new THREE.Clock(); // Inițializează ceasul

  // Adaugă ascultători pentru evenimente
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Creează etichetele și actualizează afișările inițiale
  createLabels();
  updateHealthDisplay();
  updateScoreDisplay();
  updateEnergyDisplay();
}

// Funcția pentru crearea scorului, sanătății navei și afișarea numărului de energii colectate în timpul jocului

function createLabels() {

  // Creează eticheta pentru sănătate
  const healthDiv = document.createElement('div'); // Creează un div pentru eticheta de sănătate
  healthDiv.className = 'label'; // Setează clasa div-ului
  healthDiv.style.color = 'white'; // Setează culoarea textului
  healthDiv.style.fontSize = '20px'; // Setează dimensiunea textului
  healthDiv.textContent = `Health: ${health}%`; // Setează conținutul textului
  healthLabel = new CSS2DObject(healthDiv); // Creează un obiect CSS2D pentru eticheta de sănătate
  healthLabel.position.set(-3.5, 3.2, 0); // Setează poziția etichetei în scenă
  scene.add(healthLabel); // Adaugă eticheta la scenă


  // Creează eticheta pentru energii
  const energyDiv = document.createElement('div');
  energyDiv.className = 'label';
  energyDiv.style.color = 'white';
  energyDiv.style.fontSize = '20px';
  energyDiv.textContent = `Energy: ${energyCollected}`;
  energyLabel = new CSS2DObject(energyDiv);
  energyLabel.position.set(0, 3.2, 0);
  scene.add(energyLabel);

  // Creează eticheta pentru scor
  const scoreDiv = document.createElement('div'); // Creează un div pentru eticheta de scor
  scoreDiv.className = 'label'; // Setează clasa div-ului
  scoreDiv.style.color = 'white'; // Setează culoarea textului
  scoreDiv.style.fontSize = '20px'; // Setează dimensiunea textului
  scoreDiv.textContent = `Score: ${score}`; // Setează conținutul textului
  scoreLabel = new CSS2DObject(scoreDiv); // Creează un obiect CSS2D pentru eticheta de scor
  scoreLabel.position.set(2.5, 3.2, 0); // Setează poziția etichetei în scenă
  scene.add(scoreLabel); // Adaugă eticheta la scenă
}

// Funcția pentru redimensionarea ferestrei
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight; // Actualizează aspectul camerei
  camera.updateProjectionMatrix(); // Actualizează matricea de proiecție a camerei
  renderer.setSize(window.innerWidth, window.innerHeight); // Redimensionează renderer-ul WebGL
  cssRenderer.setSize(window.innerWidth, window.innerHeight); // Redimensionează renderer-ul CSS2D
}

// Funcția pentru detectarea apăsării tastelor
function onKeyDown(event) {
  keysPressed[event.key] = true;// Setează tasta ca fiind apăsată
}

function onKeyUp(event) {
  keysPressed[event.key] = false;// Setează tasta ca fiind eliberată
}

// Funcția pentru actualizarea afișării sănătății
function updateHealthDisplay() {
  healthLabel.element.textContent = `Health: ${health}%`;// Actualizează textul
}

// Funcția pentru actualizarea afișării scorului
function updateScoreDisplay() {
  scoreLabel.element.textContent = `Score: ${score}`;// Actualizează textul
}

// Funcția pentru actualizarea afișării energiei
function updateEnergyDisplay() {
  energyLabel.element.textContent = `Energy: ${energyCollected}`;// Actualizează textul
}

// Funcția pentru repornirea jocului
function restartGame() {
  // Resetează starea jocului

  health = 100; // Resetează sănătatea
  score = 0; // Resetează scorul
  energyCollected = 0; // Resetează energia colectată
  updateHealthDisplay(); // Actualizează afișarea sănătății
  updateScoreDisplay(); // Actualizează afișarea scorului
  updateEnergyDisplay(); // Actualizează afișarea energiei


  // Elimină asteroizii și laserele existente din scenă
  asteroids.forEach(asteroid => scene.remove(asteroid)); // Elimină asteroizii
  lasers.forEach(laser => scene.remove(laser)); // Elimină laserele
  energies.forEach(energy => scene.remove(energy)); // Elimină energiile
  // Golește array-urile
  asteroids = []; // Golește array-ul de asteroizi
  lasers = []; // Golește array-ul de lasere
  energies = []; // Golește array-ul de energii

  // Reinitializează obiectele jocului
  for (let i = 0; i < 10; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const randomTextureIndex = Math.floor(Math.random() * asteroidTextures.length);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTextures[randomTextureIndex] });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.x = Math.random() * 10 - 5; // Setează poziția X a asteroidului
    asteroid.position.y = Math.random() * 4 - 2;  // Setează poziția Y a asteroidului
    asteroid.position.z = Math.random() * -20;    // Setează poziția Z a asteroidului
    asteroids.push(asteroid); // Adaugă asteroidul la array
    scene.add(asteroid); // Adaugă asteroidul la scenă
  }

  for (let i = 0; i < 5; i++) {
    const energyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 32);  // Geometrie mică pentru energie
    const energyMaterial = new THREE.MeshBasicMaterial({ map: energyTexture });
    const energy = new THREE.Mesh(energyGeometry, energyMaterial);
    energy.position.x = Math.random() * 10 - 5; // Setează poziția X a energiei
    energy.position.y = Math.random() * 4 - 2;  // Setează poziția Y a energiei
    energy.position.z = Math.random() * -20;    // Setează poziția Z a energiei
    energies.push(energy); // Adaugă energia la array
    scene.add(energy); // Adaugă energia la scenă
  }

  // Ascunde ecranul de finalizare a jocului și arată ecranul de joc
  document.getElementById('gameOver').style.display = 'none'; // Ascunde ecranul de finalizare a jocului
  renderer.domElement.style.display = 'block'; // Arată renderer-ul WebGL
  cssRenderer.domElement.style.display = 'block'; // Arată renderer-ul CSS2D
}

// Funcția pentru terminarea jocului
function gameOver() {
  alert('Game Over!'); // Afișează un mesaj de finalizare a jocului
  restartGame(); // Repornire joc
}

// Funcția pentru animație și actualizarea jocului
function animate() {
  requestAnimationFrame(animate);//Solicita o nouă animație

  const delta = clock.getDelta(); // Obține timpul trecut de la ultimul cadru

  // Mișcarea navei
  if (keysPressed['a']) {
    rocket.position.x -= 2 * delta; // Deplasare stânga
  }
  if (keysPressed['d']) {
    rocket.position.x += 2 * delta; //Deplasare dreapta
  }
  if (keysPressed['w']) {
    rocket.position.y += 2 * delta; // Deplasare sus
  }
  if (keysPressed['s']) {
    rocket.position.y -= 2 * delta; // Deplasare jos
  }
  if (keysPressed[' ']) {
    createLaser(); // Creează un laser
  }

  //...

  // Mișcarea asteroizilor
  asteroids.forEach(asteroid => {
    asteroid.position.z += 2 * delta; // Deplasare asteroid
    if (asteroid.position.z > 5) {
      asteroid.position.z = Math.random() * -20; // Resetează poziția Z a asteroidului
      asteroid.position.x = Math.random() * 10 - 5; // Resetează poziția X a asteroidului
      asteroid.position.y = Math.random() * 4 - 2;  // Resetează poziția Y a asteroidului
    }
    
    // Detectarea coliziunii cu asteroizii
    if (rocket.position.distanceTo(asteroid.position) < 0.5) {
      health -= 20;// Reducerea sănătății cu 20%
      updateHealthDisplay();// Actualizează afișarea sănătății
      if (health <= 0) {
        gameOver();// Finalizează jocul dacă sănătatea este zero sau mai mică
      } else {
        asteroid.position.z = Math.random() * -20;
        asteroid.position.x = Math.random() * 10 - 5;
        asteroid.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
      }
    }
  });

   // Mișcarea energiilor
  energies.forEach(energy => {
    energy.position.z += 1 * delta;// Deplasare energie
    if (energy.position.z > 5) {
      energy.position.z = Math.random() * -20;
      energy.position.x = Math.random() * 10 - 5;
      energy.position.y = Math.random() * 4 - 2;  // Adjusted to be higher
    }

    // Detectarea coliziunii cu energiile
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

// Function pentru detectarea colosiunilor dintre laser și asteroizi
function detectCollisions() {
  // Check each asteroid for collision with lasers
  for (let i = 0; i < lasers.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (lasers[i].position.distanceTo(asteroids[j].position) < 0.5) { // Collision distance
        // If a laser and an asteroid are close enough, destroy the asteroid and remove the laser
        scene.remove(asteroids[j]);
        scene.remove(lasers[i]);
        lasers.splice(i, 1); // Remove laser from array
        asteroids.splice(j, 1); // Remove asteroid from array
        // Increment score and update score display
        score += 1;
        updateScoreDisplay();
        return; // Stop collision detection after destroying an asteroid
      }
    }
  }
}

// Creare laser
function createLaser() {
  const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
  const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const laser = new THREE.Mesh(laserGeometry, laserMaterial);
  laser.position.set(rocket.position.x, rocket.position.y, rocket.position.z);
  laser.rotation.x = Math.PI / 2;
  lasers.push(laser);
  scene.add(laser);
}
// mișcare laser
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
