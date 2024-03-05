import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'https://unpkg.com/three@v0.161.0/examples/jsm/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const bgcolor = new THREE.Color(0x202020);
var scene = new THREE.Scene();
scene.background = bgcolor;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const enterButton = document.getElementById('enter');
function webglAvailable() {
  try {
    var canvas = document.createElement("canvas");
    return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (e) {
    return false;
  }
}

webglAvailable ? {} : enterButton.innerHTML = "HI PATTI (browser does not support webgl rendering)";
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const rolldown = document.getElementById('rollDownButton');
rolldown.style.right = "10px";

var descriptions = {
  "raf_low_poly": ["Player: Raf", "Weapon: Guitar", "Warning! VERY LOUD!", "Special ability: Brain hemorrage"],
  "fede_low_poly": ["Player: Fede", "Weapon: Drums", "Very FAST", "Makes a very good risotto, miam miam miam"],
  "marti_low_poly": ["Player: Martin", "Weapon: Synthesizer", "Mumbles a lot... What is he saying?"],
  "fardi_low_poly": ["Player: Farhad", "Weapon: Microcosm", "Special ability: hang on, let me do the Johnny Greenwood thing"]

  // Particle system setup
};const particlesA = new THREE.Group();
scene.add(particlesA);

// Particle material
const particleMaterialA = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.01 });

var sizes = {
  "raf_low_poly": 1,
  "fede_low_poly": 1.6,
  "marti_low_poly": 1.5,
  "fardi_low_poly": 1.2
};

var models = ['./raf_low_poly.glb', './marti_low_poly.glb', './fede_low_poly.glb', 'fardi_low_poly.glb']; // Add paths to your models
var currentModelIndex = 0;
var model;
let main = document.getElementById("MAIN");
var leftArrow = createArrow('leftArrow');
var rightArrow = createArrow('rightArrow');

leftArrow.addEventListener('click', function () {
  changeModel(-1);
});

rightArrow.addEventListener('click', function () {
  changeModel(1);
});

main.appendChild(leftArrow);
main.appendChild(rightArrow);

var startInteraction = function (event) {
  isMouseDown = true;
  scene.add(particleSystem);
  previousMouseX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
  previousMouseY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;
  inertiaX = 0;
  inertiaY = 0;
  deltaX = 0;
  deltaY = 0;
};

var handleInteraction = function (event) {
  if (isMouseDown) {
    var x = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
    var y = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;

    deltaX = x - previousMouseX;
    deltaY = y - previousMouseY;

    // Rotate the model based on mouse movement
    model.rotation.y += deltaX * 0.01;
    model.rotation.x += deltaY * 0.01;

    previousMouseX = x;
    previousMouseY = y;
  }
};

var endInteraction = function () {
  isMouseDown = false;
  // Add inertia to keep spinning after releasing the mouse
  inertiaX = deltaX * 0.01;
  inertiaY = deltaY * 0.01;
};
// Event listeners for mouse and touch interaction
renderer.domElement.addEventListener('mousedown', startInteraction);
renderer.domElement.addEventListener('mousemove', handleInteraction);
renderer.domElement.addEventListener('mouseup', endInteraction);

renderer.domElement.addEventListener('touchstart', startInteraction);
renderer.domElement.addEventListener('touchmove', handleInteraction);
renderer.domElement.addEventListener('touchend', endInteraction);
// Event listeners for mouse interaction


// Create a particle system
var particleGeometry = new THREE.BufferGeometry();
var particleSize = 0.03;
// Adjust particle size based on screen width
if (window.innerWidth <= 600) {
  particleSize = 0.06; // Increase particle size for smaller screens
}
var particleMaterial = new THREE.PointsMaterial({
  color: 0x77cc77,
  size: particleSize,
  transparent: true, // Enable transparency
  opacity: 0 // Initial opacity
});

// Variables for mouse interaction and inertia
let isMouseDown = false;
let previousMouseX = 0;
let previousMouseY = 0;
let inertiaX = 0;
let inertiaY = 0;
let deltaX = 0;
let deltaY = 0;

var particles = [];
const radius = 2;
var velocities = [];
const nParticles = 300;
var initialPositions = [];
const zOffset = 0.7;
var g = 0.003;
var d = function (x, z) {
  return Math.sqrt(x * x + z * z);
};

for (let i = 0; i < nParticles; i++) {
  const r = 1 / Math.sqrt(Math.random()) * radius;
  const theta = Math.random() * 6.32;
  const z = Math.sin(theta) * r - zOffset;
  const x = Math.cos(theta) * r;
  const y = Math.random() * 0.1 - 2.3;
  const distance = d(x, z);
  particles.push(x, y, z);
  initialPositions.push({ x: x, y: y, z: z });
  velocities.push({
    x: (g * (radius - distance) - x) * 0.01,
    y: 0,
    z: (g * (radius - distance) - z) * 0.01
  });
}
particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
var particleSystem = new THREE.Points(particleGeometry, particleMaterial);
// Create a post-processing composer
var composer = new EffectComposer(renderer);

// Add a render pass
var renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add a bloom pass for the glow effect
var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.4;
bloomPass.strength = 2;
bloomPass.radius = 0.03;
composer.addPass(bloomPass);

// Gradual fade-in animation
var fadeInDuration = 5000; // milliseconds
var startTimestamp = null;

var animateP = function (timestamp) {
  if (!startTimestamp) startTimestamp = timestamp;

  // Calculate elapsed time
  var elapsed = timestamp - startTimestamp;

  // Update opacity based on elapsed time
  particleMaterial.opacity = Math.min(1, elapsed / fadeInDuration);

  requestAnimationFrame(animateP);
  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = velocities[i / 3].x + positions[i];
    positions[i + 2] = velocities[i / 3].z + positions[i + 2];
    if (d(positions[i], positions[i + 2] + zOffset) < radius) {
      positions[i] = initialPositions[i / 3].x;
      positions[i + 2] = initialPositions[i / 3].z;
    }
  }
  if (isMouseDown) {
    particleGeometry.attributes.position.needsUpdate = true; // Update positions
  }
  // Render the scene through the composer for post-processing
  composer.render();
};

// Add arrows

// Add Matrix-style text
var textNearObject = createMatrixText('textNearObject');
main.appendChild(textNearObject);

// Add a directional light
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 1, 1).normalize();
var alight = new THREE.AmbientLight(0xffa0ff);
scene.add(light);
scene.add(alight);

camera.position.z = 5;
// Animation loop with inertia
var loading = true;
const animate = function () {
  requestAnimationFrame(animate);

  // Update rotation with inertia
  if (!loading) {
    if (!isMouseDown && Math.abs(inertiaX + inertiaY) > 0.0001) {
      model.rotation.y += inertiaX;
      model.rotation.x += inertiaY;
      inertiaX *= 0.99; // Adjust the inertia decay rate
      inertiaY *= 0.99;
    } else if (!isMouseDown) {
      model.rotation.y += 0.01;
    }
  }
  composer.render();
};

function loadModel(modelPath, add) {
  loading = true;
  return new Promise(resolve => {
    scene.remove(model);
    var loader = new GLTFLoader();
    document.getElementById('textNearObject').innerText = "Loading...";
    loader.load(modelPath, function (gltf) {
      model = gltf.scene;
      if (add) {
        var modelName = modelPath.split('/').pop().split('.')[0];
        model.scale.set(sizes[modelName], sizes[modelName], sizes[modelName]);
        scene.add(model);
        document.getElementById('textNearObject').innerText = descriptions[modelName].join('^');
        clearTimeout(timeoutId);
        unveilText();
      }
      loading = false;
      resolve();
    });
  });
}

let timeoutId;

function unveilText() {
  const textElement = document.getElementById("textNearObject");
  const textContent = textElement.innerHTML;
  textElement.innerHTML = "";
  let index = 0;
  function appendNextCharacter() {
    if (textContent[index] == "^") {
      textElement.innerHTML += '<br><br>';
    } else {
      textElement.innerHTML += textContent[index];
    }

    index++;
    if (index < textContent.length) {
      timeoutId = setTimeout(appendNextCharacter, 50); // Adjust the delay (100 milliseconds in this example)
    } else {
      textElement.classList.remove("hidden");
    }
  }
  appendNextCharacter();
}

function createArrow(id) {
  var arrow = document.createElement('div');
  arrow.id = id;
  arrow.className = 'arrow';
  return arrow;
}

function createMatrixText(id) {
  var matrixText = document.createElement('div');
  matrixText.id = id;
  matrixText.className = 'matrix-text';
  return matrixText;
}

function changeModel(direction) {
  currentModelIndex = (models.length + currentModelIndex + direction) % models.length;
  // Load and add the new model to the scene
  loadModel(models[currentModelIndex], true);
}
// Audio tracks
const audioTracks = ['play_dough_smol.mp3']; //, 'Hibernated_Embrace_smol.mp3', 'eternal_afternoon_smol.mp3'];
let currentTrackIndex = 0;
let audioElement = new Audio(audioTracks[currentTrackIndex]);

volumeSlider.addEventListener('input', () => {
  audioElement.volume = volumeSlider.value;
});

const muteButton = document.getElementById('mute');
let isMuted = true;
rolldown.innerHTML = "ABOUT";
rolldown.style.width = "70px";
var toggleMute = function (setup) {
  muteButton.innerHTML = isMuted ? '<img src="./whiteMute.svg" alt="Mute"  width="24" height="24">' : '<img src="./whiteUnmute.svg" alt="Unmute"  width="24" height="24">'; // Change image paths accordingly
  if (setup) {
    audioElement.play();
    isMuted = false;
  } else {
    isMuted = !isMuted;
    if (!isMuted) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }
};

muteButton.addEventListener('click', () => {
  toggleMute(false);
});

function startParticleAnimation() {
  const duration = 5000; // Animation duration in milliseconds
  const startTime = Date.now();

  function animateParticles() {
    const currentTime = Date.now();
    const deltaTime = currentTime - startTime;

    if (deltaTime < duration) {
      // Create a particle at a random location
      const particle = new THREE.Vector3(Math.random() * 10 - 5, // X coordinate
      Math.random() * 10 - 5, // Y coordinate
      Math.random() * 10 - 5 // Z coordinate
      );

      particlesA.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints([particle]), particleMaterialA));
    }

    requestAnimationFrame(animateParticles);
    composer.render();
  }

  animateParticles();
}
startParticleAnimation();

loadModel(models[currentModelIndex], false);
const menu = document.getElementById('menu');

enterButton.addEventListener('click', () => {
  // Load initial model
  loadModel(models[currentModelIndex], true);
  audioElement.play();
  isMuted = false;
  animateP();
  animate();
  main.style.display = "flex";
  menu.style.display = "none";
  main.appendChild(renderer.domElement);
});

// Hotkey event listener
window.addEventListener('keydown', function (event) {
  switch (event.key) {
    case 'ArrowLeft':
      changeModel(-1);
      // Call the function for button 1 action
      var ra = document.getElementById("leftArrow");
      ra.style = "filter: brightness(1.5) blur(2px);";
      break;
    case 'ArrowRight':
      changeModel(1);
      // Call the function for button 2 action
      var ra = document.getElementById("rightArrow");
      ra.style = "filter: brightness(1.5) blur(2px);";
      break;
    // Add more cases for additional hotkeys
    case ' ':
      toggleMute();
      break;
  }
});

window.addEventListener('keyup', function (event) {
  switch (event.key) {
    case 'ArrowLeft':
      var ra = document.getElementById("leftArrow");
      ra.style = "filter: none;";
      break;
    case 'ArrowRight':
      // Call the function for button 2 action
      var ra = document.getElementById("rightArrow");
      ra.style = "filter: none;";
      break;
  }
});
// Resize event listener
window.addEventListener('resize', function () {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
});
var visible = false;
function toggleRollDown() {
  // Toggle the width and height to open/close the menu
  if (!visible) {
    rolldown.innerHTML = `
<p style={font-family: 'Orbitron', sans-serif}>UPCOMING</p><br>
<div id=dates>
    	  March 19th &mdash; <a href="https://privatclub-berlin.de/event/lyca/">Privatclub, Berlin (supporting Lyca)</a></div>
<br>
<br>
<p style={font-family: 'Orbitron', sans-serif}>ABOUT</p> 
<br>
<div id=abouttext>
Atomic Fruit is an international Berlin-based group with roots in Sweden, Pakistan, Italy and France and formed in late 2021 after meeting at an art punk concert.
<br>
The four members found a shared interest in effects pedals and unconventional compositions and quickly became a popular live act in the independent music scene of Berlin.
<br><br>
Their debut album “Play Dough” was released in October 2023 to a sold out crowd in Schokoladen and got featured in major editorial playlists as well as airplay on Berlin radio stations.
<br>
<br>
Hear it on <a href="https://atomicfruit.bandcamp.com/">Bandcamp</a> or <a href="https://open.spotify.com/artist/3uuRFQ0o6Iqa8mXe0gNjeB?si=C1mBWZGMSui7cLj8EalO1Q">Spotify</a>.
</div>
`;
    if (window.innerWidth <= 600) {
      rolldown.style.width = "350px";
      rolldown.style.height = "700px";
    } else {
      rolldown.style.width = "500px";
      rolldown.style.height = "600px";
    }
    var ds = document.getElementById("dates");
    ds.style["font-family"] = "'Ariel', sans-serif";
    var ts = document.getElementById("abouttext");
    ts.style["font-family"] = "'Ariel', sans-serif";
    rolldown.style.right = null;
    rolldown.style.margin = "auto";
    rolldown.style["backdrop-filter"] = "blur(10px)";
    rolldown.style["background-color"] = "#fff7";
    visible = true;
  } else {
    rolldown.innerHTML = "ABOUT";
    rolldown.style.width = "70px";
    rolldown.style.right = "10px";
    rolldown.style.height = "20px";
    rolldown.style["background-color"] = "#aaa";
    visible = false;
  }
}

document.getElementById("rollDownButton").addEventListener("click", toggleRollDown);

