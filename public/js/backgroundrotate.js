
  const backgrounds = [
    '/images/background1.png',
    '/images/background2.png',
    '/images/background3.png',
    '/images/background4.png',
    '/images/background5.png'
  ];

  let current = 0;
  const interval = 5000; // 5 seconds

  function rotateBackground() {
    const bg = document.getElementById('rotatingBackground');
    bg.style.backgroundImage = `url('${backgrounds[current]}')`;
    current = (current + 1) % backgrounds.length;
  }

  // Start rotation
  rotateBackground();
  setInterval(rotateBackground, interval);

