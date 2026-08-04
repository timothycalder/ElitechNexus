import * as THREE from "three";

const app = document.getElementById("app");
const loading = document.getElementById("loading");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05060a, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070914, 0.038);

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(1.1, 1.35, 7.4);

const clock = new THREE.Clock();
const pointer = new THREE.Vector2(0, 0);
const targetCam = new THREE.Vector3().copy(camera.position);
const lookAt = new THREE.Vector3(0.1, 0.7, 0);
let scrollOrbit = 0;

function makeStarfield(count = 2500) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 18 + Math.random() * 70;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.45;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xc4ceff,
      size: 0.045,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
  );
}

/** Build letter D as merged meshes, then sample surface points. */
function createDGeometry() {
  const group = new THREE.Group();

  // Vertical stem
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.4, 0.55));
  stem.position.set(-1.05, 0.7, 0);
  group.add(stem);

  // Outer bowl
  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.32, 16, 64, Math.PI)
  );
  outer.rotation.z = -Math.PI / 2;
  outer.position.set(-0.15, 0.7, 0);
  group.add(outer);

  // Inner bowl (thicker rim feel via second torus)
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.18, 12, 48, Math.PI)
  );
  inner.rotation.z = -Math.PI / 2;
  inner.position.set(-0.05, 0.7, 0);
  group.add(inner);

  // Caps connecting stem to bowl
  const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.5));
  topCap.position.set(-0.7, 2.2, 0);
  group.add(topCap);
  const botCap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.5));
  botCap.position.set(-0.7, -0.8, 0);
  group.add(botCap);

  group.updateMatrixWorld(true);
  return group;
}

function sampleMeshGroup(group, count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  const purple = new THREE.Color("#b56bff");
  const cyan = new THREE.Color("#7affff");
  const deep = new THREE.Color("#6a2fad");

  // Rasterize via many random points in bounding volume + keep near surfaces
  // Simpler: sample each child geometry's vertices + random face points
  const samples = [];
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    const pos = geo.attributes.position;
    const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
    const p = nonIndexed.attributes.position;
    for (let i = 0; i < p.count; i += 3) {
      // triangle
      const ax = p.getX(i), ay = p.getY(i), az = p.getZ(i);
      const bx = p.getX(i + 1), by = p.getY(i + 1), bz = p.getZ(i + 1);
      const cx = p.getX(i + 2), cy = p.getY(i + 2), cz = p.getZ(i + 2);
      for (let n = 0; n < 14; n++) {
        let r1 = Math.random();
        let r2 = Math.random();
        if (r1 + r2 > 1) {
          r1 = 1 - r1;
          r2 = 1 - r2;
        }
        const x = ax + r1 * (bx - ax) + r2 * (cx - ax);
        const y = ay + r1 * (by - ay) + r2 * (cy - ay);
        const z = az + r1 * (bz - az) + r2 * (cz - az);
        samples.push(x, y, z);
      }
    }
  });

  const triCount = samples.length / 3;
  for (let i = 0; i < count; i++) {
    const si = ((Math.random() * triCount) | 0) * 3;
    let x = samples[si];
    let y = samples[si + 1];
    let z = samples[si + 2] + (Math.random() - 0.5) * 0.35;

    const dissolve = Math.random() > 0.68 ? Math.random() : 0;
    x += dissolve * (1.4 + Math.random() * 2.6);
    y += (Math.random() - 0.5) * dissolve * 1.5;
    z -= dissolve * (0.8 + Math.random() * 2.4);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const onInner = x > -0.4 && Math.abs(y - 0.7) < 1.2;
    const c = deep.clone().lerp(purple, 0.55 + Math.random() * 0.45);
    if (onInner || dissolve > 0.15) c.lerp(cyan, 0.55 + dissolve * 0.45 + (onInner ? 0.35 : 0));
    // Ensure minimum brightness
    c.r = Math.max(c.r, 0.35);
    c.g = Math.max(c.g, 0.2);
    c.b = Math.max(c.b, 0.55);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    seeds[i * 3] = Math.random() * Math.PI * 2;
    seeds[i * 3 + 1] = 0.4 + Math.random();
    seeds[i * 3 + 2] = Math.random();
  }
  return { positions, colors, seeds };
}

function createParticleD() {
  const shell = createDGeometry();
  const { positions, colors, seeds } = sampleMeshGroup(shell, 22000);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 56 * renderer.getPixelRatio() },
    },
    vertexShader: `
      attribute vec3 aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uSize;
      void main() {
        vColor = color * 1.35;
        vec3 p = position;
        float t = uTime * (0.45 + aSeed.y * 0.55);
        p.x += sin(t + aSeed.x) * 0.05 * (0.4 + aSeed.z);
        p.y += cos(t * 1.2 + aSeed.x) * 0.045;
        p.z += sin(t * 0.9 + aSeed.y) * 0.055;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(3.0, uSize * (1.0 / -mv.z));
        vAlpha = 0.75 + aSeed.z * 0.25;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float glow = pow(smoothstep(0.5, 0.0, d), 1.15);
        gl_FragColor = vec4(vColor * (1.1 + glow * 0.8), glow * vAlpha);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  // Soft emissive core mesh for readable silhouette
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x9a5cff,
    transparent: true,
    opacity: 0.35,
  });
  shell.traverse((o) => {
    if (o.isMesh) o.material = coreMat;
  });
  const wrapper = new THREE.Group();
  wrapper.add(shell);
  wrapper.add(points);
  return wrapper;
}

function createTerrain() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const tex = loader.load("./assets/textures/terrain/bake.webp");
  if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

  for (let i = 0; i < 9; i++) {
    const w = 1.6 + Math.random() * 3.2;
    const h = 0.9 + Math.random() * 2.0;
    const geo = new THREE.PlaneGeometry(w, h, 30, 20);
    const pos = geo.attributes.position;
    for (let vi = 0; vi < pos.count; vi++) {
      const x = pos.getX(vi);
      const y = pos.getY(vi);
      pos.setZ(
        vi,
        Math.sin(x * 3.1 + i) * 0.1 +
          Math.cos(y * 4.3 + i * 1.4) * 0.08 +
          (Math.random() - 0.5) * 0.07
      );
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        map: tex,
        color: new THREE.Color().setHSL(0.67, 0.1, 0.14 + Math.random() * 0.1),
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true,
      })
    );
    mesh.rotation.x = -Math.PI / 2.1;
    mesh.rotation.z = (Math.random() - 0.5) * 0.6;
    mesh.position.set(
      (Math.random() - 0.5) * 9,
      -1.7 - Math.random() * 0.45,
      1.0 + Math.random() * 5.5
    );
    group.add(mesh);
  }

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(22, 64),
    new THREE.MeshStandardMaterial({ color: 0x080a11, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.05;
  group.add(ground);
  return group;
}

function createDust(count = 1400) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 4.5 - 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0x7af3ff,
      size: 0.03,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
}

const key = new THREE.PointLight(0x66f0ff, 55, 24, 2);
key.position.set(-2.0, 1.6, 2.8);
scene.add(key);
const fill = new THREE.PointLight(0x8a45ff, 40, 26, 2);
fill.position.set(2.6, 1.1, 1.6);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xb0c4ff, 0.7);
rim.position.set(-3, 5, -2);
scene.add(rim);
scene.add(new THREE.AmbientLight(0x1c2333, 0.65));

scene.add(makeStarfield());
const particleD = createParticleD();
scene.add(particleD);
scene.add(createTerrain());
const dust = createDust();
scene.add(dust);

window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener(
  "wheel",
  (e) => {
    scrollOrbit += e.deltaY * 0.0015;
  },
  { passive: true }
);
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  const pts = particleD.children.find((c) => c.isPoints);
  if (pts) pts.material.uniforms.uSize.value = 56 * renderer.getPixelRatio();
});

function animate() {
  const t = clock.getElapsedTime();
  const pts = particleD.children.find((c) => c.isPoints);
  if (pts) pts.material.uniforms.uTime.value = t;
  particleD.rotation.y = Math.sin(t * 0.12) * 0.1 + pointer.x * 0.18;
  particleD.rotation.x = pointer.y * 0.08;
  dust.rotation.y = t * 0.025;

  targetCam.x = 1.1 + pointer.x * 0.7 + Math.sin(scrollOrbit) * 0.5;
  targetCam.y = 1.35 + pointer.y * 0.3;
  targetCam.z = 7.4 + Math.cos(scrollOrbit) * 0.45;
  camera.position.lerp(targetCam, 0.07);
  lookAt.set(0.1 + pointer.x * 0.25, 0.7 + pointer.y * 0.12, 0);
  camera.lookAt(lookAt);
  key.intensity = 48 + Math.sin(t * 1.6) * 10;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loading.classList.add("hide");
animate();
