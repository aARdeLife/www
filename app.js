const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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

canvas.addEventListener('click', async event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const prediction of currentPredictions) {
        if (isPointInRect(x, y, prediction.bbox)) {
            // Render the 3D model over the detected object
            render3DModel(prediction.bbox);
            return;
        }
    }
});

function render3DModel(bbox) {
    // Save the bounding box as JSON in sessionStorage
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

