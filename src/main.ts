import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Langit siang cerah
scene.fog = new THREE.Fog(0x87ceeb, 15, 50);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(7, 5.5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5e4, 1.8);
sunLight.position.set(8, 12, 6);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 30;
const d = 8;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
scene.add(sunLight);


function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6b3e26';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#4e2a17';
  ctx.lineWidth = 2;
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + 6, 170, y - 6, 256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const woodTexture = createWoodTexture();

const groundMat = new THREE.MeshStandardMaterial({
  color: 0x4a7c59,
});

const stoneMat = new THREE.MeshStandardMaterial({
  // color: 0x000000,
  color: 0x7d848a,
});

const woodMat = new THREE.MeshStandardMaterial({
  map: woodTexture,
  bumpMap: woodTexture,
});

const roofMat = new THREE.MeshStandardMaterial({
  color: 0x9e3b24,
});

const jogloGroup = new THREE.Group();
scene.add(jogloGroup);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const basePlatform = new THREE.Mesh(
  new THREE.BoxGeometry(6.4, 0.25, 6.4),
  stoneMat
);
basePlatform.position.y = 0.125;
basePlatform.castShadow = true;
basePlatform.receiveShadow = true;
jogloGroup.add(basePlatform);

const mainFloor = new THREE.Mesh(
  new THREE.BoxGeometry(5.6, 0.2, 5.6),
  stoneMat
);
mainFloor.position.y = 0.35;
mainFloor.castShadow = true;
mainFloor.receiveShadow = true;
jogloGroup.add(mainFloor);

const pillarPositions: [number, number][] = [
  [-1.8, -1.8],
  [1.8, -1.8],
  [-1.8, 1.8],
  [1.8, 1.8],
];

const pillarHeight = 2.6;
const floorTopY = 0.45;

pillarPositions.forEach(([x, z]) => {
  const umpak = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 0.25, 8),
    stoneMat
  );
  umpak.position.set(x, floorTopY + 0.125, z);
  umpak.castShadow = true;
  umpak.receiveShadow = true;
  jogloGroup.add(umpak);

  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, pillarHeight, 0.24),
    woodMat
  );
  pillar.position.set(x, floorTopY + 0.25 + pillarHeight / 2, z);
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  jogloGroup.add(pillar);
});

const beamY = floorTopY + 0.25 + pillarHeight;
const beamOffsets: [number, number, number, number][] = [
  [0, beamY, -1.8, 0],
  [0, beamY, 1.8, 0],
  [-1.8, beamY, 0, Math.PI / 2],
  [1.8, beamY, 0, Math.PI / 2],
];

// beamOffsets.forEach(([x, y, z, rotY]) => {
//   const beam = new THREE.Mesh(
//     new THREE.BoxGeometry(4.2, 0.22, 0.22),
//     woodMat
//   );
//   beam.position.set(x, y, z);
//   beam.rotation.y = rotY;
//   beam.castShadow = true;
//   jogloGroup.add(beam);
// });

function createPyramidRoof(
  bottomRadius: number,
  topRadius: number,
  height: number,
  yPos: number
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 4);
  geo.rotateY(Math.PI / 4);
  const mesh = new THREE.Mesh(geo, roofMat);
  mesh.position.y = yPos;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const lowerRoof = createPyramidRoof(4.4, 2.2, 1.1, beamY + 0.55);
jogloGroup.add(lowerRoof);

let isWireframe = false;
let isNight = false;

const infoDiv = document.createElement('div');
infoDiv.style.position = 'fixed';
infoDiv.style.top = '12px';
infoDiv.style.left = '12px';
infoDiv.style.padding = '10px 14px';
infoDiv.style.background = 'rgba(0, 0, 0, 0.65)';
infoDiv.style.color = '#fff';
infoDiv.style.fontFamily = 'sans-serif';
infoDiv.style.fontSize = '13px';
infoDiv.style.borderRadius = '6px';
infoDiv.innerHTML = `
  <b>Eksplorasi 3D Joglo Sederhana (Three.js)</b><br/>
  • Drag Kiri: Putar | Scroll: Zoom | Drag Kanan: Geser<br/>
  • Tekan <b>[W]</b>: Toggle Wireframe | Tekan <b>[L]</b>: Mode Siang/Malam<br/>
  <span id="stats">Draw calls: -</span>
`;
document.body.appendChild(infoDiv);

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'w') {
    isWireframe = !isWireframe;
    [groundMat, stoneMat, woodMat, roofMat].forEach((m) => {
      m.wireframe = isWireframe;
    });
  } else if (e.key.toLowerCase() === 'l') {
    isNight = !isNight;
    if (isNight) {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.Fog(0x0f172a, 15, 50);
      sunLight.intensity = 0.25;
      ambientLight.intensity = 0.15;
    } else {
      scene.background = new THREE.Color(0x87ceeb);
      scene.fog = new THREE.Fog(0x87ceeb, 15, 50);
      sunLight.intensity = 1.8;
      ambientLight.intensity = 0.5;
    }
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const statsEl = document.getElementById('stats')!;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  statsEl.textContent = `Draw calls: ${renderer.info.render.calls} | Triangles: ${renderer.info.render.triangles}`;
}

animate();