const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let model;
let tooltip = document.getElementById("tooltip");

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = 1;
document.body.appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();
let object3D;

loader.load('https://raw.githubusercontent.com/aARdeLife/www/24c418c270c508983064244597f661b3791889a8/polforweb%20(3).glb', function (gltf) {
  object3D = gltf.scene;
  object3D.visible = false;
  scene.add(object3D);
  camera.position.z = 5;
}, undefined, function (error) {
  console.error(error);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

canvas.addEventListener("mousemove", (event) => {
  handleTooltip(event);
});

canvas.addEventListener("mouseout", () => {
  hideTooltip();
});

canvas.addEventListener("click", (event) => {
  if (object3D) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    object3D.position.set(x / 100, -y / 100, 0);
    object3D.visible = true;
  }
});

async function loadModel() {
  model = await cocoSsd.load();
  console.log("Model loaded");
  detectFrame(video, model);
}

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", loadModel);
    });
}

async function detectFrame(video, model) {
  const predictions = await model.detect(video);
  renderPredictions(predictions);
  requestAnimationFrame(() => {
    detectFrame(video, model);
  });
}

function renderPredictions(predictions) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;
  ctx.font = "24px Arial";
  ctx.fillStyle = "green";

  predictions.forEach((prediction) => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.fillText(prediction.class, x, y - 10);
  });
}

function handleTooltip(event) {
  // ... existing tooltip handling code ...
}

function hideTooltip() {
  // ... existing tooltip hiding code ...
}

startVideo();
