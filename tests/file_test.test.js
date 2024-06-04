import { createLabels, updateHealthDisplay, updateScoreDisplay, updateEnergyDisplay } from '../game';

test('createLabels creates correct labels', () => {
    document.body.innerHTML = '<div id="labels"></div>';
    createLabels();
    const labels = document.getElementById('labels').children;
    expect(labels.length).toBe(3); // Assuming you expect 3 labels
});

test('updateHealthDisplay updates health correctly', () => {
    document.body.innerHTML = '<div id="healthDisplay"></div>';
    updateHealthDisplay(75);
    const healthDisplay = document.getElementById('healthDisplay').textContent;
    expect(healthDisplay).toBe('Health: 75');
});

test('updateScoreDisplay updates score correctly', () => {
    document.body.innerHTML = '<div id="scoreDisplay"></div>';
    updateScoreDisplay(150);
    const scoreDisplay = document.getElementById('scoreDisplay').textContent;
    expect(scoreDisplay).toBe('Score: 150');
});

test('updateEnergyDisplay updates energy correctly', () => {
    document.body.innerHTML = '<div id="energyDisplay"></div>';
    updateEnergyDisplay(90);
    const energyDisplay = document.getElementById('energyDisplay').textContent;
    expect(energyDisplay).toBe('Energy: 90');
});
