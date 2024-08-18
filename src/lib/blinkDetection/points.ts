import type { Keypoint } from "@tensorflow-models/face-landmarks-detection";

export type NormVals = {
  ox: number;
  oy: number;
  s: number;
};

export type ProcessedFaceData = {
  raw: Keypoint[];
  normalizationVals: NormVals;
  allPoints: Keypoint[];
  leftEyePoints: Keypoint[];
  rightEyePoints: Keypoint[];
};

/**
 * Computes the standard deviation from the line of best fit for a set of points.
 * @param points The points in question.
 * @returns
 */
export function dev(points: Keypoint[]): number {
  // Calculate the mean of x and y values
  const n = points.length;
  const sumX = points.reduce((acc: any, point: any) => acc + point.x, 0);
  const sumY = points.reduce((acc: any, point: any) => acc + point.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate the slope (m) and y-intercept (b) of the regression line
  const numerator = points.reduce(
    (acc: any, point: any) => acc + (point.x - meanX) * (point.y - meanY),
    0
  );
  const denominator = points.reduce(
    (acc: any, point: any) => acc + Math.pow(point.x - meanX, 2),
    0
  );
  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate the deviation of each point from the regression line
  const deviations = points.map((point: any) => {
    const predictedY = slope * point.x + intercept;
    return Math.abs(predictedY - point.y);
  });

  // Compute the average deviation
  const averageDeviation =
    deviations.reduce((acc: any, deviation: any) => acc + deviation, 0) / n;

  return averageDeviation;
}

/**
 * Generates normvals from points.
 * @param points
 * @returns
 */
function getNormalizationVals(points: Keypoint[]): NormVals {
  let minx = 9999;
  let miny = 9999;
  let maxx = 0;
  let maxy = 0;

  points.forEach((p: any) => {
    if (p.x < minx) minx = p.x;
    if (p.x > maxx) maxx = p.x;
    if (p.y < miny) miny = p.y;
    if (p.y > maxy) maxy = p.y;
  });

  const FRAME_SCALE = 1.5;
  const fw = (maxx - minx) * FRAME_SCALE;
  const fh = (fw * 480) / 640;
  const ox = (maxx + minx) / 2 - fw / 2;
  const oy = (maxy + miny) / 2 - fh / 2;
  const s = 640 / fw;

  return { ox, oy, s } as NormVals;
}

/**
 * Normalizes points according to normVals.
 * @param points
 * @param n
 * @returns
 */
export function normalizePoints(points: Keypoint[], n: NormVals): Keypoint[] {
  return points.map((p: any) => {
    const x = (p.x - n.ox) * n.s;
    const y = (p.y - n.oy) * n.s;
    return { name: p.name, x: x, y: y } as Keypoint;
  });
}

/**
 * Process a bunch of face points
 * @param points The points in quesiton
 * @returns object containing points but normalized, left eye points, and right eye points.
 */
export function processFacePoints(points: Keypoint[]): ProcessedFaceData {
  const leftPoints = points.filter((p) => p.name == "leftEye");
  const rightPoints = points.filter((p) => p.name == "rightEye");
  const normVals = getNormalizationVals([...leftPoints, ...rightPoints]);

  return {
    raw: points,
    normalizationVals: normVals,
    allPoints: normalizePoints(points, normVals),
    leftEyePoints: normalizePoints(leftPoints, normVals),
    rightEyePoints: normalizePoints(rightPoints, normVals),
  };
}
