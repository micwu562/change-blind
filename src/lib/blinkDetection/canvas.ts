// unused.
//

// import {
//   normalizePoints,
//   type NormVals,
//   type ProcessedFaceData,
// } from "./points";
// import { TRIANGULATION } from "./triangulation";

// function lerp(a: number, b: number, r: number): number {
//   return a + (b - a) * r;
// }

// function drawPath(ctx: CanvasRenderingContext2D, points: Keypoint[]) {
//   const dpr = window.devicePixelRatio;
//   const region = new Path2D();
//   region.moveTo(points[0].x * dpr, points[0].y * dpr);

//   for (let i = 1; i < points.length; i++) {
//     const point = points[i];
//     region.lineTo(point.x * dpr, point.y * dpr);
//   }

//   region.closePath();
//   ctx.stroke(region);
// }

// export function draw(
//   ctx: CanvasRenderingContext2D,
//   video: HTMLVideoElement,
//   data: ProcessedFaceData,
//   l: number,
// ) {
//   const normVals: NormVals = {
//     ox: lerp(0, data.normalizationVals.ox, 1 - l),
//     oy: lerp(0, data.normalizationVals.oy, 1 - l),
//     s: lerp(1.0, data.normalizationVals.s, 1 - l),
//   };

//   const canvas = ctx.canvas;
//   const dpr = window.devicePixelRatio;

//   // Reset
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Draw the camera feed.
//   ctx.globalAlpha = l;
//   ctx.drawImage(
//     video,
//     -normVals.ox * normVals.s * dpr,
//     -normVals.oy * normVals.s * dpr,
//     canvas.width * normVals.s,
//     canvas.height * normVals.s,
//   );

//   // Draw the face mesh.
//   ctx.globalAlpha = 1.0;
//   ctx.strokeStyle = "rgba(0,0,0,0.05)";
//   ctx.lineWidth = window.devicePixelRatio * 2;

//   const np = normalizePoints(data.raw, normVals);
//   for (let i = 0; i < TRIANGULATION.length; i += 3) {
//     drawPath(ctx, [
//       np[TRIANGULATION[i]],
//       np[TRIANGULATION[i + 1]],
//       np[TRIANGULATION[i + 2]],
//     ]);
//   }

//   // um.
// }
