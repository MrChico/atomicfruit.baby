import * as THREE          from 'three'
import { GLTFLoader }      from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GlitchPass }      from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { FontLoader }      from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry }    from 'three/examples/jsm/geometries/TextGeometry.js';

const bgcolor = new THREE.Color( 0x101010 );
var scene = new THREE.Scene();
scene.background = bgcolor;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const enterButton = document.getElementById('enter');
function webglAvailable() {
    try {
        var canvas = document.createElement("canvas");
        return !!
        window.WebGLRenderingContext && 
	    (canvas.getContext("webgl") || 
             canvas.getContext("experimental-webgl"));
    } catch(e) { 
        return false;
    } 
}
var sizes = {
    "raf_opt": 1,
    "fede_opt": 1.6,
    "marti_opt": 1.5,
    "fardi_opt": 1.2
}

var models = ['./raf_opt.glb', './marti_opt.glb', './fede_opt.glb', 'fardi_opt.glb']; // Add paths to your models
var currentModelIndex = 0;
var model;
let main = document.getElementById("MAIN");
var leftArrow = createArrow('leftArrow');
var rightArrow = createArrow('rightArrow')


let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x000000, 0 ); // the default
main.appendChild(renderer.domElement);

const rolldown = document.getElementById('rollDownButton');

var descriptions = {
    "raf_opt": ["Player: Raf", "Weapon: Guitar", "Warning! VERY LOUD!", "Special ability: Brain hemorrage"],
    "fede_opt": ["Player: Fede", "Weapon: Drums", "Very FAST", "Makes a very good risotto, miam miam miam"],
    "marti_opt": ["Player: Martin", "Weapon: Synthesizer", "Mumbles a lot... What is he saying?"],
    "fardi_opt": ["Unknown Player", "Traces scattered", "across the Microcosm"]
}

// Particle system setup
const particlesA = new THREE.Group();
scene.add(particlesA);

// Particle material
const particleMaterialA = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.01 });



leftArrow.addEventListener('click', function () {
    changeModel(-1);
});

rightArrow.addEventListener('click', function () {
    changeModel(1);
});


main.appendChild(leftArrow);
main.appendChild(rightArrow);

var startInteraction = function(event) {
    isMouseDown = true;
    scene.add(particleSystem);
    previousMouseX = (event.type.startsWith('touch')) ? event.touches[0].clientX : event.clientX;
    previousMouseY = (event.type.startsWith('touch')) ? event.touches[0].clientY : event.clientY;
    inertiaX = 0;
    inertiaY = 0;
    deltaX = 0;
    deltaY = 0;
}

var handleInteraction = function(event) {
    if (isMouseDown) {
        var x = (event.type.startsWith('touch')) ? event.touches[0].clientX : event.clientX;
        var y = (event.type.startsWith('touch')) ? event.touches[0].clientY : event.clientY;

        deltaX = x - previousMouseX;
        deltaY = y - previousMouseY;

        // Rotate the model based on mouse movement
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;

        previousMouseX = x;
        previousMouseY = y;
    }
}

var endInteraction = function() {
    isMouseDown = false;
    // Add inertia to keep spinning after releasing the mouse
    inertiaX = deltaX * 0.01;
    inertiaY = deltaY * 0.01;
}
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
var initialPositions = []
const zOffset = 0.7;
var g = 0.003;
var d = function(x, z) {
    return Math.sqrt(x * x + z * z);
}

for (let i = 0; i < nParticles; i++) {
    const r = (1 / Math.sqrt(Math.random())) * radius;
    const theta = Math.random() * 6.32;
    const z = Math.sin(theta) * r - zOffset;
    const x = Math.cos(theta) * r;
    const y = Math.random() * 0.1 - 2.3;
    const distance = d(x, z);
    particles.push(x, y, z);
    initialPositions.push({x: x, y: y, z: z});
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

// Add glitch pass
const glitchPass = new GlitchPass();
glitchPass.enabled = false; // Start disabled
composer.addPass(glitchPass);


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
        positions[i]     = velocities[i / 3].x + positions[i];
        positions[i + 2] = velocities[i / 3].z + positions[i + 2];
        if (d(positions[i], positions[i + 2] + zOffset) < radius) {
      	    positions[i]     = initialPositions[i / 3].x;
      	    positions[i + 2] = initialPositions[i / 3].z;
        }
    }
    if (Math.abs(inertiaX) + Math.abs(inertiaY) > 0.01 || isMouseDown) {
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
        if (!isMouseDown && Math.abs(inertiaX) + Math.abs(inertiaY) > 0.01) {
            model.rotation.y += inertiaX;
            model.rotation.x += inertiaY;
            inertiaX *= 0.99; // Adjust the inertia decay rate
            inertiaY *= 0.99;
        } else if (!isMouseDown) {
	    model.rotation.y += 0.01;
	}   
    }

  // Occasionally enable glitch effect
  if (Math.random() < 0.02 && currentModelIndex == 3) {  // ~1% chance each frame
    glitchPass.enabled = true;

    // Disable after a short time
    setTimeout(() => {
      glitchPass.enabled = false;
    }, 200); // glitch lasts 200 ms
  }
    composer.render();	
}

// Load a font (Three.js uses JSON font files)
const floader = new FontLoader();
let textMesh;
floader.load('./helvetiker_bold.typeface.json', function (font) {
    
    const textGeometry = new TextGeometry('?', {
	font: font,
	size: 1,         // size of the text
	height: 0.2,     // thickness
	curveSegments: 12,
	bevelEnabled: false
    });
    
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x5f5f5f });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Position the text above your model
    textMesh.position.set(0, 0, 0);  // adjust based on your model size
})

var loader = new GLTFLoader();
//const dracoLoader = new DRACOLoader();
//loader.setDRACOLoader( dracoLoader );

function loadModel(modelPath, add) {
    loading = true;
    return new Promise((resolve) => {
	scene.remove(model);
	scene.remove(textMesh);
	clearTimeout(timeoutId);
	document.getElementById('textNearObject').innerText = "Loading..."
        loader.load(modelPath, function (gltf) {
	    model = gltf.scene;
	    if (add) {  
		var modelName = modelPath.split('/').pop().split('.')[0];
		var scaleFactor = window.innerWidth <= 600 ? 0.8 : 1;
		model.scale.set(scaleFactor * sizes[modelName], scaleFactor * sizes[modelName], scaleFactor * sizes[modelName]);

		if (modelName == "fardi_opt") {
		    // Replace all materials with solid black
		    model.traverse((child) => {
			if (child.isMesh) {
			    child.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
			}
		    });
pp		    scene.add(textMesh);
	}
		
		scene.add(model);
		document.getElementById('textNearObject').innerText = descriptions[modelName].join('^');
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
	    textElement.innerHTML = textElement.innerHTML.replace("What is he saying?", "<a href='./lyrics.html'>What is he saying?</a>");
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

rolldown.innerHTML = "MENU";
rolldown.style.width = "70px";

function startParticleAnimation() {
    const duration = 5000; // Animation duration in milliseconds
    const startTime = Date.now();

    function animateParticles() {
	const currentTime = Date.now();
	const deltaTime = currentTime - startTime;

	if (deltaTime < duration) {
            // Create a particle at a random location
            const particle = new THREE.Vector3(
		Math.random() * 10 - 5, // X coordinate
		Math.random() * 10 - 5, // Y coordinate
		Math.random() * 10 - 5  // Z coordinate
            );

            particlesA.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints([particle]), particleMaterialA));
	}

	requestAnimationFrame(animateParticles);
	composer.render();
    }

    animateParticles();
}

const menu = document.getElementById('menu');
const menucontainer = document.getElementById('menucontainer');

function openMenu() {
    window.location.assign("#menu");
    rolldown.innerHTML = ""
    menu.style.display = "flex";
    menucontainer.style.display = "flex";
    menucontainer.style["-webkit-backdrop-filter"] = "blur(10px)";
    menucontainer.style["backdrop-filter"] = "blur(10px)";
    menucontainer.style["background-color"] = "#0001"
}

rolldown.addEventListener("click", () => {
    openMenu();
});

// Hotkey event listener
window.addEventListener('keydown', function (event) {
    switch (event.key) {
    case 'ArrowLeft':
        changeModel(-1);
        // Call the function for button 1 action
	var ra = document.getElementById("leftArrow");
	ra.style = "filter: brightness(1.5) blur(2px);"
        break;
    case 'ArrowRight':
        changeModel(1);
        // Call the function for button 2 action
	var ra = document.getElementById("rightArrow");
	ra.style = "filter: brightness(1.5) blur(2px);"
        break;
        // Add more cases for additional hotkeys
    case ' ':
	toggleMute();
	break;
    }
})

window.addEventListener('keyup', function (event) {
    switch (event.key) {
    case 'ArrowLeft':
	var ra = document.getElementById("leftArrow");
	ra.style = "filter: none;"
        break;
    case 'ArrowRight':
        // Call the function for button 2 action
	var ra = document.getElementById("rightArrow");
	ra.style = "filter: none;"
        break;
    }
})
// Resize event listener
window.addEventListener('resize', function () {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});
var visible = false;

startParticleAnimation();


loadModel(models[currentModelIndex], true);
animateP()
animate();

let liveOpen = false;
let aboutOpen = false;
function openLive() {
    liveOpen = !liveOpen
    if (liveOpen) {
	window.location.replace("#live")
    } else {
	window.location.replace("#menu");
    }	   
    document.getElementById("livelist").classList.toggle('show');
}

function openAbout() {
    aboutOpen = !aboutOpen
    if (aboutOpen) {
	window.location.replace("#about")
    } else {
	window.location.replace("#menu");
    }
    document.getElementById("aboutlist").classList.toggle('show');
}

document.getElementById("live").addEventListener('click', function() {
    openLive();
});

document.getElementById("news").addEventListener('click', function() {
    document.getElementById("newslist").classList.toggle('show');
});

document.getElementById("music").addEventListener('click', function() {
    document.getElementById("musiclist").classList.toggle('show');
});

document.getElementById("video").addEventListener('click', function() {
    document.getElementById("videolist").classList.toggle('show');
});

document.getElementById("contact").addEventListener('click', function() {
    document.getElementById("contactlist").classList.toggle('show');
});

document.getElementById("about").addEventListener('click', function() {
    openAbout();
});

document.getElementById("past").addEventListener('click', function() {
    document.getElementById("pastlist").classList.toggle('show');
});


document.addEventListener('DOMContentLoaded', () => {
    const closePopupButton = document.getElementById('closePopup');
    const popup = document.getElementById('popup');

    closePopupButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Optional: close popup when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    // setTimeout(() => {
    // 	console.log("opening the popup");
    // 	popup.style.display = 'block';
    //     setTimeout(() => {
    //         popup.classList.add('show');
    //     }, 10); // 
    // }, "2000");

});

function closemenu() {
    menu.style.display = "none";
    menucontainer.style.display = "none";
    rolldown.innerHTML = "MENU"
}


// Close menu if clicking outside
document.addEventListener("click", e => {
    if (menu.style.display === "flex" && !menu.contains(e.target) && e.target !== rolldown) {
	window.location.replace("#main");
	closemenu();
    }
})
			  
// navigate to the right place based on the hash in the url:
let loc = window.location.hash;
console.log('loc' + loc);
if (loc == "#menu") {
    openMenu();
} else if (loc == "#live") {
    openMenu();
    openLive();
} else if (loc == "#about") {
    openMenu();
    openAbout();
} else if (loc == "") {
    window.location.replace("#main");
}

// Show the correct section on hash change (back/forward)
window.addEventListener('hashchange', () => {
    // should be the only possible option?
    if (window.location.hash == "#main") {
	closemenu();
    }
});
