/**
 * three-scene.js
 * Three.js interactive 3D background for Hero section
 * — Particle field (180 glowing dots) that follow mouse
 * — 3 wireframe geometric shapes (torus, icosahedron, octahedron) floating & rotating
 * — Camera parallax on mousemove
 */

(function () {
  'use strict';

  // Skip on small screens for performance
  if (window.innerWidth < 768) return;

  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  // ─── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  // ─── Scene & Camera ──────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 18);

  // ─── Lighting ────────────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x6b52ff, 1.5, 40);
  pointLight1.position.set(-8, 5, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xfca311, 1.2, 40);
  pointLight2.position.set(8, -5, 8);
  scene.add(pointLight2);

  // ─── Particle Field ──────────────────────────────────────────────────────────
  const PARTICLE_COUNT = 180;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const colorPalette = [
    new THREE.Color(0x6b52ff), // purple
    new THREE.Color(0xfca311), // amber
    new THREE.Color(0x4f7cff), // blue
    new THREE.Color(0x34c48a), // green
    new THREE.Color(0xffffff), // white
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread in a sphere volume
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 6 + Math.random() * 8;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

    const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = 0.04 + Math.random() * 0.12;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ─── Connecting Lines (sparse web) ───────────────────────────────────────────
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = [];
  const threshold = 4.5;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const dx = positions[i * 3]     - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < threshold) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }

  lineGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(linePositions), 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x6b52ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lineWeb = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineWeb);

  // ─── Wireframe Geometric Shapes ───────────────────────────────────────────────
  function createWireShape(geometry, color, x, y, z, scale) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    scene.add(mesh);
    return mesh;
  }

  const torus = createWireShape(
    new THREE.TorusGeometry(1.4, 0.4, 10, 36),
    0x6b52ff,
    -7, 2.5, -2,
    1
  );

  const icosa = createWireShape(
    new THREE.IcosahedronGeometry(1.2, 1),
    0xfca311,
    6.5, -2, -4,
    1
  );

  const octa = createWireShape(
    new THREE.OctahedronGeometry(0.9, 0),
    0x4f7cff,
    3, 5, -3,
    1
  );

  // Small decorative ring
  const ring = createWireShape(
    new THREE.TorusGeometry(0.6, 0.08, 6, 24),
    0x34c48a,
    -4, -4, -1,
    1
  );

  // ─── Mouse Tracking ───────────────────────────────────────────────────────────
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ─── Resize Handler ───────────────────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(canvas);

  // ─── Animate ─────────────────────────────────────────────────────────────────
  let frameId;
  const clock = new THREE.Clock();

  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse follow
    currentMouseX += (targetMouseX - currentMouseX) * 0.04;
    currentMouseY += (targetMouseY - currentMouseY) * 0.04;

    // Camera parallax
    camera.position.x = currentMouseX * 1.5;
    camera.position.y = -currentMouseY * 1.2;
    camera.lookAt(0, 0, 0);

    // Rotate particle cloud slowly
    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.02;
    lineWeb.rotation.y = t * 0.04;
    lineWeb.rotation.x = t * 0.02;

    // Rotate wireframe shapes
    torus.rotation.x = t * 0.45 + currentMouseY * 0.4;
    torus.rotation.z = t * 0.3  + currentMouseX * 0.3;

    icosa.rotation.x = t * 0.3;
    icosa.rotation.y = t * 0.55 + currentMouseX * 0.3;

    octa.rotation.x  = t * 0.6  + currentMouseY * 0.4;
    octa.rotation.y  = t * 0.4;

    ring.rotation.x  = t * 0.8;
    ring.rotation.z  = t * 0.5 + currentMouseX * 0.5;

    // Float shapes up/down
    torus.position.y = 2.5  + Math.sin(t * 0.7) * 0.5;
    icosa.position.y = -2   + Math.sin(t * 0.5 + 1) * 0.6;
    octa.position.y  = 5    + Math.sin(t * 0.9 + 2) * 0.4;
    ring.position.y  = -4   + Math.sin(t * 1.1 + 3) * 0.35;

    // Pulse particle opacity
    particleMaterial.opacity = 0.6 + Math.sin(t * 0.8) * 0.15;

    renderer.render(scene, camera);
  }

  animate();

  // ─── Cleanup when section leaves viewport ─────────────────────────────────────
  const heroSection = document.getElementById('home');
  if (heroSection) {
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!frameId) animate();
        } else {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(heroSection);
  }
})();
