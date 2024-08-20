import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function setupModel() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      // modelAssetPath: "/model/face_landmarker.task",
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
  });

  return faceLandmarker;
}
