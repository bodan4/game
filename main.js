let scene, camera, renderer, rocket, asteroids = [], clock;

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

  // Create rocket
  const rocketGeometry = new THREE.ConeGeometry(0.2, 1, 32);
  const rocketMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
  rocket.rotation.x = Math.PI / 2;
  scene.add(rocket);

  // Load asteroid texture
  const textureLoader = new THREE.TextureLoader();
  const asteroidTexture = textureLoader.load('./moon.png');

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

  // Initialize clock
  clock = new THREE.Clock();

  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

    // Collision detection
    if (rocket.position.distanceTo(asteroid.position) < 0.5) {
      alert("Game Over!");
      window.location.reload();
    }
  });

  renderer.render(scene, camera);
}

function startGame() {
  document.getElementById('menu').style.display = 'none';
  init();
  animate();
}

document.getElementById('startButton').addEventListener('click', startGame);
