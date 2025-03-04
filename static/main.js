Colors = {
    U: 0xffffff,
    D: 0xffd500,
    F: 0xc41e3a,
    R: 0x0051ba,
    B: 0xff5800,
    L: 0x009e60,
    P: 0x08101a,
    G: 0x8abdff,
};

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
function hexColorToDecimal(hex) {
  // Remove '#' and convert to 0xRRGGBB format
  const fullHex = hex.replace(/^#/, '0x');
  return parseInt(fullHex, 16);
}

function updateColor(id){
    data = document.getElementById(id).value;
    Colors[id] = hexColorToDecimal(data);
    console.log(hexColorToDecimal(data));
}

function startGame(size){
        fetch("/startGame", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ SbyS: size, colors: Colors})
        }).then(response => {
            if (response.redirected) {
                window.location.href = response.url;  // Redirect to new page
            }
        })
        .catch(err => { console.log("POST Error: ", err); });
        console.log("startGame");
}

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


