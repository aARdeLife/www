const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

let model;

async function loadModel() {
    model = await cocoSsd.load();
}

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.addEventListener('loadeddata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                detectObjects();
            });
        });
}

async function detectObjects() {
    if (model) {
        const predictions = await model.detect(video);
        renderPredictions(predictions);
    }
    requestAnimationFrame(detectObjects);
}

function renderPredictions(predictions) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    predictions.forEach((prediction) => {
        const bbox = prediction.bbox;
        context.strokeStyle = 'green';
        context.lineWidth = 2;
        context.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);

        context.fillStyle = 'green';
        context.font = '12px Arial';
        context.fillText(prediction.class, bbox[0], bbox[1] - 5);
    });

    canvas.addEventListener('mousemove', (event) => {
        predictions.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            if (
                event.offsetX > x &&
                event.offsetX < x + width &&
                event.offsetY > y &&
                event.offsetY < y + height
            ) {
                tooltip.innerHTML = `<strong>${prediction.class}</strong><br>Confidence: ${(prediction.score * 100).toFixed(2)}%`;
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY}px`;
                tooltip.style.display = 'block';
            } else {
                tooltip.style.display = 'none';
            }
        });
    });

    canvas.addEventListener('click', (event) => {
        predictions.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            if (
                event.offsetX > x &&
                event.offsetX < x + width &&
                event.offsetY > y &&
                event.offsetY < y + height
            ) {
                render3DModel();
            }
        });
    });
}

async function render3DModel() {
    const modelURL = 'https://raw.githubusercontent.com/aARdeLife/www/24c418c270c508983064244597f661b3791889a8/polforweb%20(3).glb';

    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');
    scene.setAttribute('vr-mode-ui', 'enabled: false');

    const camera = document.createElement('a-entity');
    camera.setAttribute('gps-camera', '');
    camera.setAttribute('rotation-reader', '');
    scene.appendChild(camera);

    // Replace the latitude and longitude values with the coordinates where you want the 3D model to appear.
    const latitude = 0; // Your latitude here
    const longitude = 0; // Your longitude here

    const model = document.createElement('a-entity');
    model.setAttribute('gltf-model', `url(${modelURL})`);
    model.setAttribute('scale', '0.05 0.05 0.05');
    model.setAttribute('position', `gps-projected-entity-place_${latitude}_${longitude}`);
    model.setAttribute('gps-projected-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
    scene.appendChild(model);

    document.body.appendChild(scene);
}

loadModel().then(() => {
    startVideo();
});

