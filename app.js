const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loader = new THREE.GLTFLoader();

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

async function load3DModel(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });
}

canvas.addEventListener('click', async event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const prediction of currentPredictions) {
        if (isPointInRect(x, y, prediction.bbox)) {
            try {
                const gltf = await load3DModel('https://github.com/aARdeLife/SuperVision/blob/6e7ab011f51b2483b72237297fbffd5e27a470cc/polaris/polforweb%20(3).glb?raw=true');
                // Render the 3D model over the detected object
                render3DModel(gltf, prediction.bbox);
            } catch (error) {
                console.error('Error loading 3D model:', error);
            }
            return;
        }
    }
});

function render3DModel(gltf, bbox) {
    // Save the GLTF data and bounding box as JSON in sessionStorage
    sessionStorage.setItem('gltfData', JSON.stringify(gltf));
    sessionStorage.setItem('objectBbox', JSON.stringify(bbox));

    // Open the 3dmodel.html file in a new window
    window.open('file:///C:/Users/Shadow/Desktop/Super%20Vision%20XR/3dmodel.html');
}

async function detectObjects() {
    const model = await cocoSsd.load();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Initialize currentPredictions as an empty array
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
