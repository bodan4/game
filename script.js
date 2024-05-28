// Funcția pentru afișarea ecranului de game over
function gameOver() {
    alert("Game Over!");
    restartGame();
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('menu').style.display = 'none';
    renderer.domElement.style.display = 'none';
    cssRenderer.domElement.style.display = 'none';
}

// Funcția pentru restartarea jocului
function restartGame() {
    // Resetarea stării jocului
    health = 100;
    score = 0;
    updateHealthDisplay();
    updateScoreDisplay();

    // Eliminarea asteroizilor și laserelor existente din scenă
    asteroids.forEach(asteroid => scene.remove(asteroid));
    lasers.forEach(laser => scene.remove(laser));
    energies.forEach(energy => scene.remove(energy));
    // Golește array-urile
    asteroids = [];
    lasers = [];
    energies = [];

    // Reinițializează obiectele jocului
    for (let i = 0; i < 10; i++) {
        const asteroidGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const randomTextureIndex = Math.floor(Math.random() * asteroidTextures.length);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTextures[randomTextureIndex] });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.x = Math.random() * 10 - 5;
        asteroid.position.y = Math.random() * 10 - 5;
        asteroid.position.z = Math.random() * -20;
        asteroids.push(asteroid);
        scene.add(asteroid);
    }

    for (let i = 0; i < 5; i++) {
        const energyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
        const energyMaterial = new THREE.MeshBasicMaterial({ map: energyTexture });
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.position.x = Math.random() * 10 - 5;
        energy.position.y = Math.random() * 10 - 5;
        energy.position.z = Math.random() * -20;
        energies.push(energy);
        scene.add(energy);
    }

    // Ascunde ecranul de game over și afișează ecranul de joc
    document.getElementById('gameOver').style.display = 'none';
    renderer.domElement.style.display = 'block';
    cssRenderer.domElement.style.display = 'block';
}