const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d');
const tooltip = document.getElementById('tooltip');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    videoElement.srcObject = stream;
    videoElement.width = window.innerWidth;
    videoElement.height = window.innerHeight;
    canvasElement.width = videoElement.width;
    canvasElement.height = videoElement.height;
    return new Promise(resolve => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

async function detectObjects() {
    const net = await cocoSsd.load();
    while (true) {
        const predictions = await net.detect(videoElement);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.drawImage(videoElement, 0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach(prediction => {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 4;
            ctx.strokeRect(...prediction.bbox);
        });

        canvasElement.onmousemove = (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const prediction = predictions.find(p => {
                const [x, y, width, height] = p.bbox;
                return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
            });

            if (prediction) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.clientX}px`;
                tooltip.style.top = `${e.clientY}px`;
                tooltip.textContent = `${prediction.class}`;
            } else {
                tooltip.style.display = 'none';
            }
        };

        canvasElement.onclick = async (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const prediction = predictions.find(p => {
                const [x, y, width, height] = p.bbox;
                return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
            });

            if (prediction) {
                await render3DModel();
            }
        };

        await tf.nextFrame();
    }
}

async function render3DModel() {
    const modelURL = 'https://raw.githubusercontent.com/aARdeLife/www/24c418c270c508983064244597f661b3791889a8/polforweb%20(3).glb';

    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');
    scene.setAttribute('vr-mode-ui', 'enabled: false');

    const plane = document.createElement('a-plane');
    plane.setAttribute('position', '0 0 -4');
    plane.setAttribute('rotation', '-90 0 0');
    plane.setAttribute('width', '2');
    plane.setAttribute('height', '2');
    plane.setAttribute('color', '#7BC8A4');
    scene.appendChild(plane);

    const model = document.createElement('a-entity');
    model.setAttribute('gltf-model', `url(${modelURL})`);
    model.setAttribute('scale', '0.05 0.05 0.05');
    model.setAttribute('position', '0 0.05 0');
    plane.appendChild(model);

    document.body.appendChild(scene);
}
}

(async function () {
    const videoElement = await setupCamera();
    videoElement.play();
    detectObjects();
})();

