<script lang="ts">
  import { Fullscreen } from "lucide-svelte";

  import { onMount } from "svelte";
  import { blinking, cameraInitialized, changeOnBlink } from "../state";
  import { spring } from "../ui/spring";
  import { get } from "svelte/store";
  import { setupModel } from "./loadmodel";
  import { DrawingUtils, FaceLandmarker } from "@mediapipe/tasks-vision";

  const LEFT_BLENDSHAPE_IDX = 9;
  const RIGHT_BLENDSHAPE_IDX = 10;
  const BLINK_THRESHOLD = 0.45;

  let containerDiv: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let canvasCtx: CanvasRenderingContext2D;
  let canvasHeight: number = 0;
  let drawingUtils: DrawingUtils;

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

  let lScore: number = 0;
  let rScore: number = 0;
  let leftBlink: boolean = false;
  let rightBlink: boolean = false;

  // Model

  let tfDetector: FaceLandmarker;
  let tfModelLoaded: Promise<boolean>;
  let loadingText: string = "--";

  async function loadModel() {
    tfModelLoaded = new Promise(async (resolve) => {
      try {
        loadingText = "Loading model...";
        tfDetector = await setupModel();
        loadingText = "Model loaded!";
        resolve(true);
      } catch {
        loadingText = "Failed to load model.";
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
    drawingUtils = new DrawingUtils(canvasCtx);

    async function detectAndDraw() {
      if (!$changeOnBlink) {
        requestAnimationFrame(detectAndDraw);
        return;
      }

      if (!tfDetector) return;

      const predictions = await tfDetector.detectForVideo(
        video,
        performance.now(),
      );

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      for (const landmark of predictions.faceLandmarks) {
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#ccc", lineWidth: 1 },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#000", lineWidth: 2 },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#000", lineWidth: 2 },
        );
      }

      let bs = predictions.faceBlendshapes[0];
      lScore = bs?.categories[LEFT_BLENDSHAPE_IDX].score ?? 0;
      rScore = bs?.categories[RIGHT_BLENDSHAPE_IDX].score ?? 0;
      leftBlink = lScore > BLINK_THRESHOLD;
      rightBlink = rScore > BLINK_THRESHOLD;
      blinking.set(leftBlink || rightBlink);

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
    <span style:color={leftBlink ? "green" : ""}>{lScore?.toFixed(2)}</span>
    <span style:color={rightBlink ? "green" : ""}>{rScore?.toFixed(2)}</span>
    <br />
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
