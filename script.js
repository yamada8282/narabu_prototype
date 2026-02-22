/* ===========================
   ナラブ - App Logic
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // === Screen Navigation ===
  function showScreen(screenId, animation = 'fade') {
    const screens = document.querySelectorAll('.screen');
    const target = document.getElementById(screenId);
    if (!target) return;

    screens.forEach(s => {
      s.classList.remove('active', 'fade-in', 'slide-in');
    });

    target.classList.add('active');
    if (animation === 'slide') {
      target.classList.add('slide-in');
    } else {
      target.classList.add('fade-in');
    }

    // Re-init map if showing main screen
    if (screenId === 'screen-main') {
      initMap();
      resetQuizTimer();
    }
  }

  // === Splash Screen → Main ===
  setTimeout(() => {
    showScreen('screen-main', 'fade');
    // Show notification after a brief delay
    setTimeout(() => showNotification(), 1500);
  }, 2000);

  // === Menu ===
  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');

  menuBtn.addEventListener('click', () => {
    menuOverlay.classList.toggle('open');
  });

  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove('open');
    }
  });

  // Menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.screen;
      menuOverlay.classList.remove('open');
      showScreen(target, 'slide');
    });
  });

  // === Back Buttons ===
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      showScreen(target, 'fade');
    });
  });

  // === Profile Navigation (clicking YOU marker) ===
  // Will be set up after map init

  // === Notification Banner ===
  function showNotification() {
    const banner = document.getElementById('notifBanner');
    banner.classList.add('show');
    setTimeout(() => {
      banner.classList.remove('show');
    }, 3500);
  }

  // === Quiz Timer Reset ===
  function resetQuizTimer() {
    const bar = document.getElementById('quizProgressBar');
    if (bar) {
      bar.style.animation = 'none';
      bar.offsetHeight; // force reflow
      bar.style.animation = 'countdown 30s linear forwards';
    }
  }

  // === Map Initialization ===
  const shapes = [
    { src: 'Group-1.svg', name: 'pink-hex' },
    { src: 'Group.svg', name: 'orange-hex' },
    { src: 'Group-2.svg', name: 'coral-hex' },
    { src: 'Vector-1.svg', name: 'teal-hex' },
    { src: 'Vector.svg', name: 'teal-square' },
  ];

  const TOTAL_SHAPES = 20;
  const centerSrc = 'Vector-1.svg';

  function initMap() {
    const mapArea = document.getElementById('mapArea');
    if (!mapArea) return;

    // Keep timer badge, remove everything else
    const timerBadge = mapArea.querySelector('.timer-badge');
    mapArea.innerHTML = '';
    if (timerBadge) mapArea.appendChild(timerBadge);

    const mapWidth = mapArea.offsetWidth || 393;
    const mapHeight = mapArea.offsetHeight || 400;
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    const centerExclusionRadius = 115;

    // Center shape
    const centerSize = 130;
    const centerDiv = document.createElement('div');
    centerDiv.className = 'center-shape';
    centerDiv.style.width = centerSize + 'px';
    centerDiv.style.height = centerSize + 'px';
    const centerImg = document.createElement('img');
    centerImg.src = centerSrc;
    centerImg.alt = 'YOU';
    centerDiv.appendChild(centerImg);
    centerDiv.style.animation = 'floatCenter 3.5s ease-in-out infinite';
    mapArea.appendChild(centerDiv);

    // Make center shape clickable → go to profile
    centerDiv.style.cursor = 'pointer';
    centerDiv.addEventListener('click', () => {
      showScreen('screen-profile', 'slide');
    });

    // YOU label
    const youLabel = document.createElement('div');
    youLabel.className = 'you-indicator';
    youLabel.style.top = (centerY - centerSize / 2 - 32) + 'px';
    youLabel.innerHTML = '<span>YOU</span><span>↓</span>';
    mapArea.appendChild(youLabel);

    // Placed positions for collision detection
    const placedPositions = [
      { x: centerX - centerSize / 2, y: centerY - centerSize / 2, size: centerSize }
    ];

    const timerExclusion = { x: mapWidth - 140, y: 0, w: 140, h: 50 };

    function isValidPosition(x, y, size) {
      if (x < 0 || y < 0 || x + size > mapWidth || y + size > mapHeight) return false;
      const cx2 = x + size / 2, cy2 = y + size / 2;
      const dist = Math.sqrt((cx2 - centerX) ** 2 + (cy2 - centerY) ** 2);
      if (dist < centerExclusionRadius) return false;
      if (x + size > timerExclusion.x && y < timerExclusion.h) return false;
      for (const p of placedPositions) {
        const dx = (x + size / 2) - (p.x + p.size / 2);
        const dy = (y + size / 2) - (p.y + p.size / 2);
        if (Math.sqrt(dx * dx + dy * dy) < (size + p.size) / 2 * 0.75) return false;
      }
      return true;
    }

    function getRandomPosition(size) {
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * (mapWidth - size);
        const y = Math.random() * (mapHeight - size);
        if (isValidPosition(x, y, size)) return { x, y };
      }
      return { x: Math.random() * (mapWidth - size), y: Math.random() * (mapHeight - size) };
    }

    // Scattered shapes
    const shapeSize = 72;
    for (let i = 0; i < TOTAL_SHAPES; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const pos = getRandomPosition(shapeSize);
      const rotation = Math.floor(Math.random() * 360);

      const wrapper = document.createElement('div');
      wrapper.className = 'map-shape';
      wrapper.style.width = shapeSize + 'px';
      wrapper.style.height = shapeSize + 'px';
      wrapper.style.left = pos.x + 'px';
      wrapper.style.top = pos.y + 'px';
      wrapper.style.opacity = 0.85 + Math.random() * 0.15;

      const duration = 2.5 + Math.random() * 2;
      const delay = Math.random() * 3;
      wrapper.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.transform = `rotate(${rotation}deg)`;

      const img = document.createElement('img');
      img.src = shape.src;
      img.alt = shape.name;
      inner.appendChild(img);
      wrapper.appendChild(inner);

      mapArea.appendChild(wrapper);
      placedPositions.push({ x: pos.x, y: pos.y, size: shapeSize });
    }
  }

  // === Quiz Option Interaction ===
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.quiz-option').forEach(b => {
        b.style.background = '';
        b.style.color = '';
        b.style.border = '';
      });
      this.style.background = '#35C6C1';
      this.style.color = 'white';
      this.style.border = '2px solid #2BA8A4';
    });
  });

});
