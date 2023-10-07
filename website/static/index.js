import * as THREE from 'three';

let earthRadius= 6378; //radius of sphere1(Earth)

//setting up earth(globe)
const mainSphere= new THREE.SphereGeometry(earthRadius,64,64); //creating geometry
const textureimg= new THREE.TextureLoader().load('textures/earth.jpg');
const texturebump= new THREE.TextureLoader().load('textures/bump.jpg');
const texturespec= new THREE.TextureLoader().load('textures/spec.jpg')
var material= new THREE.MeshPhongMaterial({ map:textureimg, bumpMap:texturebump, specularMap:texturespec }); //creating material& adding texture

var earthmesh= new THREE.Mesh(mainSphere, material); //adding geometry and material to mesh

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viz').appendChild(renderer.domElement);

// Setup scene
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xbbbbbb));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

scene.add(earthmesh);

//setting camera
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,1,20000);
camera.position.set(1425,8000,-6160); //This is for demo
camera.lookAt(0,0,0);
camera.updateProjectionMatrix();

function animate(){
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  // Add camera controls
    var controls= new OrbitControls(camera, renderer.domElement);
    controls.target.set(0,0,0);
    controls.minDistance=6385;
    controls.maxDistance=40000;
    controls.enableDamping=true;
    controls.dampingFactor=0.05;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

//add controls.update() inside animate() function
}

animate();