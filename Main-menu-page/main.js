function exitGame() {
    const timer = document.getElementById('timerDisplay');
    timer.style.display = 'none';
    document.getElementById('blankScreen').style.display = 'none';
  }
  
  function toggleStartMenu(id) {
    const popup = document.getElementById(id);
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
  }
  
  function hideScreen(id) {
    document.getElementById(id).style.display = 'none';
  }
  
  function resetSettings() {
    document.getElementById('volumeSlider').value = 50;
    document.getElementById('resolutionSlider').value = 50;
    document.getElementById('brightnessSlider').value = 50;
    document.getElementById('rotationSpeedSlider').value = 50;
    document.getElementById('RubrikSlider').value = 50;
  }
  function updateThemeColor() {
    const themeColor = document.getElementById('themeColor').value;  // Get the selected color value
    console.log(`Updating theme color to ${themeColor}`);
    document.body.style.backgroundColor = themeColor;  // Update the background color of the page
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      document.body.style.opacity = '0.5';
    } else {
      document.body.style.opacity = '1';
    }
  });
  
  window.addEventListener('blur', function () {
    document.body.style.opacity = '0.5';
  });
  
  window.addEventListener('focus', function () {
    document.body.style.opacity = '1';
  });
  
  window.onload = function() {
    const fullScreenLogo = document.getElementById('fullScreenLogo');
    setTimeout(function() {
      fullScreenLogo.style.opacity = '0';
    }, 2000);
  
    setTimeout(function() {
      fullScreenLogo.style.display = 'none';
    }, 2500);
  };
  
