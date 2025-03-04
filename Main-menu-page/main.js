function exitGame() {
  const timer = document.getElementById('timerDisplay');
  if (timer) timer.style.display = 'none';

  const blankScreen = document.getElementById('blankScreen');
  if (blankScreen) blankScreen.style.display = 'none';
}

function toggleStartMenu(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
  }
}

function hideScreen(id) {
  const element = document.getElementById(id);
  if (element) element.style.display = 'none';
}

function resetSettings() {
  const sliders = ['volumeSlider', 'resolutionSlider', 'brightnessSlider', 'rotationSpeedSlider', 'RubrikSlider'];
  sliders.forEach(id => {
    const slider = document.getElementById(id);
    if (slider) slider.value = 50;
  });
}

function updateThemeColor() {
  const themeColor = document.getElementById('themeColor')?.value;
  if (themeColor) {
    // console.log(`Updating theme color to ${themeColor}`); // Remove this line
    document.body.style.backgroundColor = themeColor;
  }
}

document.addEventListener('visibilitychange', function () {
  document.body.style.opacity = document.hidden ? '0.5' : '1';
});

window.addEventListener('blur', function () {
  document.body.style.opacity = '0.5';
});

window.addEventListener('focus', function () {
  document.body.style.opacity = '1';
});

window.onload = function () {
  const fullScreenLogo = document.getElementById('fullScreenLogo');
  if (fullScreenLogo) {
    fullScreenLogo.style.transition = 'opacity 1s ease-in-out'; // Smooth transition
    setTimeout(() => {
      fullScreenLogo.style.opacity = '0';
    }, 500); // Start fading sooner

    setTimeout(() => {
      fullScreenLogo.style.display = 'none';
    }, 1500); // Allow fade-out to complete before hiding
  }
};
