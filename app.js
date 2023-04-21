const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let model;
let tooltip = document.getElementById("tooltip");

canvas.addEventListener("mousemove", (event) => {
  handleTooltip(event);
});

canvas.addEventListener("mouseout", () => {
  hideTooltip();
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

