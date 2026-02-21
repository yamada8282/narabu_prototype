// AFURI Quiz App - Script
document.addEventListener('DOMContentLoaded', () => {

  // === SVG shapes configuration ===
  const shapes = [
    { src: 'Group-1.svg', name: 'pink-hex' },    // ピンク六角形
    { src: 'Group.svg', name: 'orange-hex' },   // オレンジ六角形
    { src: 'Group-2.svg', name: 'coral-hex' },    // コーラル六角形
    { src: 'Vector-1.svg', name: 'teal-hex' },     // ティール六角形（自分）
    { src: 'Vector.svg', name: 'teal-square' },  // ティール四角形
  ];

  const centerSrc = 'Vector-1.svg'; // 自分のアイコン
  const mapArea = document.getElementById('mapArea');
  const mapWidth = 393;
  const mapHeight = mapArea.offsetHeight || 465; // ヘッダーとクイズ間のエリア高さ

  // How many random shapes to scatter
  const TOTAL_SHAPES = 20;

  // Avoid placing shapes too close to center or overlapping the timer badge
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;
  const centerExclusionRadius = 115; // center shape exclusion zone

  // === Place center shape (YOU) ===
  const centerSize = 130; // larger than others
  const centerDiv = document.createElement('div');
  centerDiv.className = 'center-shape';
  centerDiv.style.width = centerSize + 'px';
  centerDiv.style.height = centerSize + 'px';

  const centerImg = document.createElement('img');
  centerImg.src = centerSrc;
  centerImg.alt = 'YOU';
  centerDiv.appendChild(centerImg);
  mapArea.appendChild(centerDiv);

  // YOU label above center shape
  const youLabel = document.createElement('div');
  youLabel.className = 'you-indicator';
  youLabel.style.top = (centerY - centerSize / 2 - 32) + 'px';
  youLabel.innerHTML = '<span>YOU</span><span>↓</span>';
  mapArea.appendChild(youLabel);

  // === Generate random positions for scattered shapes ===
  const placedPositions = [];

  function isValidPosition(x, y, size) {
    // Don't overlap center
    const dx = x + size / 2 - centerX;
    const dy = y + size / 2 - centerY;
    if (Math.sqrt(dx * dx + dy * dy) < centerExclusionRadius) return false;

    // Don't overlap timer badge area (top-right)
    if (x > mapWidth - 160 && y < 60) return false;

    // Don't go off-screen too much (allow slight overflow for organic feel)
    if (x < -size * 0.3 || x > mapWidth - size * 0.3) return false;
    if (y < -size * 0.3 || y > mapHeight - size * 0.3) return false;

    // Check overlap with other placed shapes
    for (const pos of placedPositions) {
      const pdx = x - pos.x;
      const pdy = y - pos.y;
      const minDist = (size + pos.size) * 0.4;
      if (Math.sqrt(pdx * pdx + pdy * pdy) < minDist) return false;
    }

    return true;
  }

  function getRandomPosition(size) {
    let attempts = 0;
    while (attempts < 200) {
      const x = Math.random() * (mapWidth - size * 0.4) - size * 0.2;
      const y = Math.random() * (mapHeight - size * 0.4) - size * 0.2;
      if (isValidPosition(x, y, size)) {
        return { x, y };
      }
      attempts++;
    }
    // Fallback
    return {
      x: Math.random() * (mapWidth - size),
      y: Math.random() * (mapHeight - size),
    };
  }

  // Place scattered shapes
  const shapeSize = 72; // all non-center shapes same size
  for (let i = 0; i < TOTAL_SHAPES; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    const size = shapeSize;
    const pos = getRandomPosition(size);
    const rotation = Math.floor(Math.random() * 360);

    const div = document.createElement('div');
    div.className = 'map-shape';
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.left = pos.x + 'px';
    div.style.top = pos.y + 'px';
    div.style.transform = `rotate(${rotation}deg)`;
    div.style.opacity = 0.85 + Math.random() * 0.15;

    const img = document.createElement('img');
    img.src = shape.src;
    img.alt = shape.name;
    div.appendChild(img);

    mapArea.appendChild(div);
    placedPositions.push({ x: pos.x, y: pos.y, size });
  }

  // === Quiz interaction ===
  const options = document.querySelectorAll('.quiz-option');

  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(o => {
        o.classList.remove('selected');
        o.style.background = '';
        o.style.color = '';
        o.style.border = '';
      });

      option.classList.add('selected');
      option.style.background = '#35C6C1';
      option.style.color = '#fff';
      option.style.border = '2px solid #35C6C1';

      option.style.transform = 'scale(0.95)';
      setTimeout(() => {
        option.style.transform = '';
      }, 150);
    });
  });
});
