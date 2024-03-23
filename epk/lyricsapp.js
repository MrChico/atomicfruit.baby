import * as THREE          from 'three'
import { GLTFLoader }      from 'three/examples/jsm/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set the background color to transparent
renderer.setClearColor(0x000000, 0); // 0x000000 is the color (black), 0 is the alpha (transparent)

var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
renderer.setSize(400, 400); // Set your desired canvas size here
document.getElementById('targetElement').appendChild(renderer.domElement);
// Set the size of the renderer to match the canvas size
const canvas = document.querySelector('canvas');
const canvasRect = canvas.getBoundingClientRect();

camera.position.z = 5;

const loader = new GLTFLoader();

let model;

loader.load('openeyes-opt.glb', function(gltf) {
    model = gltf.scene;
    gltf.scene.traverse(function(child) {
        if (child.isMesh) {
            // Apply a pink color to the material with metallic properties
            child.material = new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.2, roughness: 0.8 });
        }
    });
    scene.add(model);
});

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

   
const animate = function() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

document.addEventListener('mousemove', (event) => {
    if (!model) return;
    const { clientX, clientY } = event;
    // Calculate mouse position relative to canvas
    const canvasX = clientX - canvasRect.left;
    const canvasY = clientY - canvasRect.top;
    
    const mouseX = (canvasX / canvasRect.width) * 2 - 1;
    const mouseY = -(canvasY / canvasRect.height) * 2 + 1;
    
    const vector = new THREE.Vector3(mouseX * 25, mouseY * 25, -0.5);
    vector.unproject(camera);
        
    model.lookAt(vector);
});

animate();

document.addEventListener('DOMContentLoaded', function() {
  const expandableItems = document.querySelectorAll('.expandable');

  expandableItems.forEach(function(item) {
    item.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
  });
});
