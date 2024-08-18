<script lang="ts">
  import {
    type FaceLandmarksDetector,
    SupportedModels,
    createDetector,
  } from "@tensorflow-models/face-landmarks-detection";

  import { Fullscreen } from "lucide-svelte";

  import "@tensorflow/tfjs-core";
  import "@tensorflow/tfjs-backend-webgl";
  import "@mediapipe/face_mesh";
  import { onMount } from "svelte";
  import { blinking, cameraInitialized, changeOnBlink } from "../state";
  import { spring } from "../ui/spring";
  import { get } from "svelte/store";
  import { dev, processFacePoints } from "./points";
  import { draw } from "./canvas";

  let containerDiv: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let canvasCtx: CanvasRenderingContext2D;
  let canvasHeight: number = 0;

  const hover = spring(0, { stiffness: 0.25, damping: 1.0 });

  function setupCanvas() {
    const canvasObserver = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      canvas.style.width = `${w / 3.5}px`;
      canvasHeight = (w * 480) / 3.5 / 640;
    });

    canvasObserver.observe(containerDiv);
  }
  onMount(setupCanvas);

  changeOnBlink.subscribe((val) => {
    if (val) {
      const camInitialized = get(cameraInitialized);
      if (!camInitialized) {
        setup();
        cameraInitialized.set(true);
      }
    }
  });

  let lDev: number;
  let rDev: number;
  let leftBlink: boolean = false;
  let rightBlink: boolean = false;

  // Canvas

  // Model

  let tfDetector: FaceLandmarksDetector;
  let tfModelLoaded: Promise<boolean>;
  let loadingText: string = "--";

  async function loadModel() {
    tfModelLoaded = new Promise(async (resolve) => {
      try {
        loadingText = "Loading model...";
        tfDetector = await createDetector(SupportedModels.MediaPipeFaceMesh, {
          runtime: "mediapipe",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
          refineLandmarks: true,
        });
        loadingText = "Loaded!";
        resolve(true);
      } catch {
        loadingText = "Failed to load TF model.";
        resolve(false);
      }
    });
  }

  onMount(loadModel);

  //

  async function setup() {
    // Is the model loaded? (should probably check if it did load)
    const didTfModelLoad = await tfModelLoaded;

    // Initialize the camera feed
    const video = await setupVideo();

    // Initialize the canvas
    canvas.width = video.width * window.devicePixelRatio;
    canvas.height = video.height * window.devicePixelRatio;
    canvasCtx = canvas.getContext("2d")!;

    async function detectAndDraw() {
      if (!$changeOnBlink) {
        requestAnimationFrame(detectAndDraw);
        return;
      }

      const predictions = await tfDetector.estimateFaces(video);

      if (predictions.length > 0) {
        const data = processFacePoints(predictions[0].keypoints);
        draw(canvasCtx, video, data, $hover);

        lDev = dev(data.leftEyePoints);
        if (lDev < 6.0) leftBlink = true;
        if (lDev > 8.0) leftBlink = false;

        rDev = dev(data.rightEyePoints);
        if (rDev < 6.0) rightBlink = true;
        if (rDev > 8.0) rightBlink = false;

        const isBlinking = leftBlink || rightBlink;
        blinking.set(isBlinking);
      }

      requestAnimationFrame(detectAndDraw);
    }

    detectAndDraw();
  }

  async function setupVideo() {
    const video = document.createElement("video");
    video.width = 640;
    video.height = 480;
    video.autoplay = true;
    video.playsInline = true;

    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    return new Promise<HTMLVideoElement>((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  function onmouseenter() {
    hover.set(1);
  }
  function onmouseleave() {
    hover.set(0);
  }
</script>

<div class="spacer" style:height="12px"></div>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
  class="contain"
  bind:this={containerDiv}
  class:enabled={$changeOnBlink}
  style:opacity={$changeOnBlink ? 1 : 0.2}
  style:height="{canvasHeight}px"
>
  <div class="border" on:mouseover={onmouseenter} on:mouseout={onmouseleave}>
    <canvas class="canvas" bind:this={canvas}></canvas>
    <div class="expand-icon" style:opacity={1 - $hover}>
      <Fullscreen strokeWidth={1} size={20} />
    </div>
  </div>
  <div>
    {loadingText} <br />
    {lDev?.toFixed(2)}
    {rDev?.toFixed(2)} <br />
    {leftBlink}
    {rightBlink} <br />
    blink detection needs work lol
  </div>
</div>

<style>
  .contain {
    display: flex;
    gap: 16px;

    transition: opacity 0.16s ease-in-out;
    position: relative;
  }

  .expand-icon {
    position: absolute;
    bottom: 4px;
    right: 4px;
    line-height: 0;
  }

  .border {
    border: 1px solid #444;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  }

  .canvas {
    width: 480px;
    line-height: 1;
    margin-bottom: 0;
  }
</style>
