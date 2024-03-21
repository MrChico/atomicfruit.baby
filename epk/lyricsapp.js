import * as THREE          from 'three'
import { GLTFLoader }      from 'three/examples/jsm/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const bgcolor = new THREE.Color( 0x202020 );
var scene = new THREE.Scene();
scene.background = bgcolor;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const loader = new GLTFLoader();

loader.load('openeyes-opt.glb', function(gltf) {
    gltf.scene.traverse(function(child) {
        if (child.isMesh) {
            // Apply a basic material without textures
            child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        }
    });

    scene.add(gltf.scene);
});

const animate = function() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();
