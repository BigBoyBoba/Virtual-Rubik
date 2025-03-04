
function hideScreen(id) {
  const element = document.getElementById(id);
  if (element) element.style.display = 'none';
}

function toggleStartMenu(id) {
  confirm_m = new Audio('../sounds/confirmMenu.ogg');
  confirm_m.volume = 0.1;
  confirm_m.play();
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
  }
}


function resetSettings() {
  const sliders = ['volumeSlider', 'resolutionSlider', 'brightnessSlider', 'rotationSpeedSlider', 'RubrikSlider'];
  sliders.forEach(id => {
    const slider = document.getElementById(id);
    if (slider) slider.value = 50;
  });
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


