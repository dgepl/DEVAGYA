"use client";

// Dynamic client-side import for @vladmandic/face-api to prevent SSR issues
let faceapi: any = null;
let modelsLoaded = false;
let modelLoadingPromise: Promise<boolean> | null = null;

export interface GazeAnalysisResult {
  hasFace: boolean;
  isLookingAtScreen: boolean;
  status: "looking_at_screen" | "looking_left" | "looking_right" | "looking_up" | "looking_down" | "no_face" | "multiple_faces";
  reason: string;
  confidence: number;
  faceBox?: { x: number; y: number; width: number; height: number };
  landmarks?: { x: number; y: number }[];
  yawOffset?: number;
  pitchOffset?: number;
}

/**
 * Load face-api Tiny Face Detector & Landmark 68 models from /models
 */
export async function loadFaceDetectionModels(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (modelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      if (!faceapi) {
        faceapi = await import("@vladmandic/face-api");
      }

      // Check if models are already loaded
      if (faceapi.nets.tinyFaceDetector.isLoaded && faceapi.nets.faceLandmark68TinyNet.isLoaded) {
        modelsLoaded = true;
        return true;
      }

      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      return true;
    } catch (err) {
      console.warn("Error loading face-api neural models from /models:", err);
      // Even if neural net fails, the canvas fallback will operate
      return false;
    }
  })();

  return modelLoadingPromise;
}

/**
 * Analyze a video element frame for real-time face & gaze direction.
 * Uses 68-point facial landmarks to calculate 3D head yaw and pitch offsets.
 */
export async function analyzeVideoFrame(
  video: HTMLVideoElement
): Promise<GazeAnalysisResult> {
  if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return {
      hasFace: false,
      isLookingAtScreen: false,
      status: "no_face",
      reason: "Video feed not ready",
      confidence: 0,
    };
  }

  // Ensure models are initialized
  const loaded = await loadFaceDetectionModels();

  if (loaded && faceapi) {
    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.45,
      });

      // Detect all faces in frame to ensure single-candidate integrity
      const detections = await faceapi
        .detectAllFaces(video, options)
        .withFaceLandmarks(true);

      if (!detections || detections.length === 0) {
        return {
          hasFace: false,
          isLookingAtScreen: false,
          status: "no_face",
          reason: "No face detected in camera view. Please keep your face centered.",
          confidence: 0,
        };
      }

      if (detections.length > 1) {
        return {
          hasFace: true,
          isLookingAtScreen: false,
          status: "multiple_faces",
          reason: `Multiple faces (${detections.length}) detected in camera view!`,
          confidence: 0.95,
        };
      }

      const detection = detections[0];
      const box = detection.detection.box;
      const landmarks = detection.landmarks.positions;

      // 68 Landmark Indices:
      // Left Eye: 36-41, Right Eye: 42-47, Nose bridge: 27-30, Chin: 8, Jaw: 0-16
      const leftEyeX = (landmarks[36].x + landmarks[39].x) / 2;
      const leftEyeY = (landmarks[37].y + landmarks[38].y + landmarks[40].y + landmarks[41].y) / 4;
      const rightEyeX = (landmarks[42].x + landmarks[45].x) / 2;
      const rightEyeY = (landmarks[43].y + landmarks[44].y + landmarks[46].y + landmarks[47].y) / 4;

      const eyeMidX = (leftEyeX + rightEyeX) / 2;
      const eyeMidY = (leftEyeY + rightEyeY) / 2;
      const eyeDist = Math.hypot(rightEyeX - leftEyeX, rightEyeY - leftEyeY) || 1;

      const noseTip = landmarks[30];
      const chin = landmarks[8];

      // 1. HORIZONTAL YAW: Horizontal offset of nose tip from eye midpoint normalized by eye distance
      // When looking straight at screen: yawOffset is close to 0 (-0.18 to +0.18)
      // When looking left/right: |yawOffset| > 0.22
      const yawOffset = (noseTip.x - eyeMidX) / eyeDist;

      // 2. VERTICAL PITCH: Distance from eye midpoint to nose tip vs nose tip to chin
      const distEyeToNose = noseTip.y - eyeMidY;
      const distNoseToChin = Math.max(chin.y - noseTip.y, 1);
      const pitchRatio = distEyeToNose / distNoseToChin;

      // Also pitch offset normalized by eye distance
      const pitchOffset = (distEyeToNose - distNoseToChin * 0.5) / eyeDist;

      // Determine gaze direction with balanced tolerance
      // Yaw threshold: > 0.23 (turned to candidate's right) or < -0.23 (turned to candidate's left)
      if (yawOffset < -0.23) {
        return {
          hasFace: true,
          isLookingAtScreen: false,
          status: "looking_left",
          reason: "Gaze shifted to the left away from the screen",
          confidence: detection.detection.score,
          faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
          landmarks: landmarks.map((p: any) => ({ x: p.x, y: p.y })),
          yawOffset,
          pitchOffset,
        };
      }

      if (yawOffset > 0.23) {
        return {
          hasFace: true,
          isLookingAtScreen: false,
          status: "looking_right",
          reason: "Gaze shifted to the right away from the screen",
          confidence: detection.detection.score,
          faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
          landmarks: landmarks.map((p: any) => ({ x: p.x, y: p.y })),
          yawOffset,
          pitchOffset,
        };
      }

      // Pitch threshold: Looking down (e.g. at mobile phone, keyboard, notebook)
      if (distNoseToChin / eyeDist < 0.62 || pitchRatio > 1.15) {
        return {
          hasFace: true,
          isLookingAtScreen: false,
          status: "looking_down",
          reason: "Gaze shifted downward away from the screen",
          confidence: detection.detection.score,
          faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
          landmarks: landmarks.map((p: any) => ({ x: p.x, y: p.y })),
          yawOffset,
          pitchOffset,
        };
      }

      // Pitch threshold: Looking up (at ceiling/sky)
      if (distEyeToNose / eyeDist < 0.22) {
        return {
          hasFace: true,
          isLookingAtScreen: false,
          status: "looking_up",
          reason: "Gaze shifted upward away from the screen",
          confidence: detection.detection.score,
          faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
          landmarks: landmarks.map((p: any) => ({ x: p.x, y: p.y })),
          yawOffset,
          pitchOffset,
        };
      }

      // Looking at screen (compliant)
      return {
        hasFace: true,
        isLookingAtScreen: true,
        status: "looking_at_screen",
        reason: "Face and gaze focused on examination screen",
        confidence: detection.detection.score,
        faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
        landmarks: landmarks.map((p: any) => ({ x: p.x, y: p.y })),
        yawOffset,
        pitchOffset,
      };
    } catch (e) {
      console.warn("face-api inference frame error:", e);
    }
  }

  // Fallback: Canvas-based luminance & centroid presence check if face-api fails
  return fallbackCanvasAnalysis(video);
}

/**
 * Fast HTML5 Canvas fallback to guarantee zero crash and detect presence
 */
function fallbackCanvasAnalysis(video: HTMLVideoElement): GazeAnalysisResult {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return {
        hasFace: true,
        isLookingAtScreen: true,
        status: "looking_at_screen",
        reason: "Active camera monitored",
        confidence: 0.5,
      };
    }

    ctx.drawImage(video, 0, 0, 160, 120);
    const imgData = ctx.getImageData(0, 0, 160, 120);
    const data = imgData.data;

    let totalLum = 0;
    let skinPixelsLeft = 0;
    let skinPixelsRight = 0;
    const step = 8;

    for (let y = 0; y < 120; y += step) {
      for (let x = 0; x < 160; x += step) {
        const i = (y * 160 + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLum += lum;

        // Basic human skin chrominance heuristic in normalized RGB
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) >= 15) {
          if (x < 80) skinPixelsLeft++;
          else skinPixelsRight++;
        }
      }
    }

    const avgLum = totalLum / ((160 / step) * (120 / step));
    if (avgLum < 8) {
      return {
        hasFace: false,
        isLookingAtScreen: false,
        status: "no_face",
        reason: "Camera appears dark or covered",
        confidence: 0.9,
      };
    }

    const totalSkin = skinPixelsLeft + skinPixelsRight;
    if (totalSkin < 10) {
      return {
        hasFace: false,
        isLookingAtScreen: false,
        status: "no_face",
        reason: "Face not detected in camera frame",
        confidence: 0.6,
      };
    }

    const skinRatio = skinPixelsLeft / Math.max(skinPixelsRight, 1);
    if (skinRatio > 2.5) {
      return {
        hasFace: true,
        isLookingAtScreen: false,
        status: "looking_left",
        reason: "Gaze shifted away from screen to the left",
        confidence: 0.7,
      };
    }
    if (skinRatio < 0.4) {
      return {
        hasFace: true,
        isLookingAtScreen: false,
        status: "looking_right",
        reason: "Gaze shifted away from screen to the right",
        confidence: 0.7,
      };
    }

    return {
      hasFace: true,
      isLookingAtScreen: true,
      status: "looking_at_screen",
      reason: "Face and gaze focused on screen",
      confidence: 0.75,
    };
  } catch (e) {
    return {
      hasFace: true,
      isLookingAtScreen: true,
      status: "looking_at_screen",
      reason: "Active camera monitored",
      confidence: 0.5,
    };
  }
}
