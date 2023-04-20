const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const threeCanvas = document.getElementById('threeCanvas');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

function isPointInRect(x, y, rect) {
    return x >= rect[0] && x <= rect[0] + rect[2] && y >= rect[1] && y <= rect[1] + rect[3];
}

canvas.addEventListener('mousemove', async event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const prediction of currentPredictions) {
        if (isPointInRect(x, y, prediction.bbox)) {
            displayObjectInfo(prediction, x, y);
            return;
        }
    }

    tooltip.style.display = 'none';
});

canvas.addEventListener('click', async event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const prediction of currentPredictions) {
        if (isPointInRect(x, y, prediction.bbox)) {
            render3DModel('https://github.com/aARdeLife/SuperVision/blob/6e7ab011f51b2483b72237297fbffd5e27a470cc/polaris/polforweb%20(3).glb');
            return;
        }
    }
});

async function displayObjectInfo(prediction, x, y) {
    const objectName = prediction.class;
    const objectInfo = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${objectName}`)
        .then(response => response.json())
        .then(data => data.extract);

    tooltip.style.display = 'block';
    tooltip.style.left = `${x + 5}px`;
    tooltip.style.top = `${y + 5}px`;
    tooltip.innerText = `${objectName}: ${objectInfo}`;
}

async function render3DModel(modelURL) {
    threeCanvas.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas });

    renderer.setSize(window.innerWidth, window.innerHeight);

    const loader = new THREE.GLTFLoader();
    loader.load(modelURL, (gltf) => {
        scene.add(gltf.scene);
    }, undefined, (error) => {
        console.error('Error rendering 3D model:', error);
    });

    camera.position.z = 5;

    const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}

async function detectObjects() {
    const model = await cocoSsd.load();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    currentPredictions = [];

    while (true) {
        const predictions = await model.detect(video);
        currentPredictions = predictions;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach(prediction => {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 4;
            ctx.strokeRect(...prediction.bbox);
        });

        await tf.nextFrame();
    }
}

(async function() {
    const videoElement = await setupCamera();
    videoElement.play();
    detectObjects();
})();
