/**
 * CameraCapture - Framework-agnostic camera management
 * Handles camera stream, photo capture, and validation
 */

export interface CameraConstraints {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

export interface CameraError {
  message: string;
  code: 'NOT_SUPPORTED' | 'PERMISSION_DENIED' | 'NO_CAMERA' | 'CAMERA_IN_USE' | 'CAMERA_ERROR' | 'NO_IMAGE' | 'INVALID_IMAGE';
}

export interface ValidationResult {
  valid: boolean;
  error?: CameraError;
}

export class CameraCapture {
  private readonly MIN_IMAGE_SIZE = 1000; // 1KB
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Starts camera stream
   * @param constraints - Optional camera constraints
   * @returns MediaStream (caller is responsible for managing the stream)
   * @throws CameraError if camera cannot be accessed
   */
  async startCamera(constraints?: CameraConstraints): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw {
        message: 'Camera access is not supported in this browser. Please try Safari or Chrome.',
        code: 'NOT_SUPPORTED' as const,
      };
    }

    const videoConstraints: MediaStreamConstraints = {
      video: constraints
        ? {
            facingMode: constraints.facingMode ? { ideal: constraints.facingMode } : undefined,
            width: constraints.width ? { ideal: constraints.width } : undefined,
            height: constraints.height ? { ideal: constraints.height } : undefined,
          }
        : {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
      audio: false,
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      return mediaStream;
      } catch (constraintError) {
        // Fallback to basic constraints
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          return mediaStream;
      } catch (error) {
        const cameraError = this.mapErrorToCameraError(error);
        throw cameraError;
      }
    }
  }

  /**
   * Captures a photo from a video element
   * @param videoElement - HTMLVideoElement with active stream
   * @param canvasElement - HTMLCanvasElement to draw the image
   * @returns Blob of the captured image
   * @throws CameraError if capture fails
   */
  async capturePhoto(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<Blob> {
    if (!videoElement || !canvasElement) {
      throw {
        message: 'Camera not ready. Please wait for camera to initialize.',
        code: 'NO_IMAGE' as const,
      };
    }

    // Check if video is ready
    if (videoElement.readyState < 2) {
      throw {
        message: 'Video not ready. Please wait for camera to load.',
        code: 'NO_IMAGE' as const,
      };
    }

    const context = canvasElement.getContext('2d');
    if (!context) {
      throw {
        message: 'Failed to get canvas context.',
        code: 'NO_IMAGE' as const,
      };
    }

    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Validate canvas
    const validation = this.validateCanvas(canvasElement);
    if (!validation.valid) {
      throw validation.error!;
    }

    // Draw video frame to canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvasElement.toBlob(
        (blob) => {
          if (!blob) {
            reject({
              message: 'Failed to create image blob.',
              code: 'NO_IMAGE' as const,
            });
            return;
          }

          // Validate blob size
          const sizeValidation = this.validateBlobSize(blob);
          if (!sizeValidation.valid) {
            reject(sizeValidation.error!);
            return;
          }

          resolve(blob);
        },
        'image/jpeg',
        0.8
      );
    });
  }

  /**
   * Stops a camera stream
   * @param stream - The MediaStream to stop (caller provides the stream)
   */
  stopCamera(stream: MediaStream): void {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  /**
   * Validates canvas dimensions
   */
  validateCanvas(canvas: HTMLCanvasElement): ValidationResult {
    if (!canvas.width || !canvas.height) {
      return {
        valid: false,
        error: {
          message: 'Failed to capture image. Canvas has invalid dimensions.',
          code: 'NO_IMAGE',
        },
      };
    }

    if (canvas.width < 100 || canvas.height < 100) {
      return {
        valid: false,
        error: {
          message: 'Image too small. Please get closer to your food.',
          code: 'NO_IMAGE',
        },
      };
    }

    return { valid: true };
  }

  /**
   * Validates blob size
   */
  validateBlobSize(blob: Blob): ValidationResult {
    if (blob.size < this.MIN_IMAGE_SIZE) {
      return {
        valid: false,
        error: {
          message: 'Image too small. Please try again.',
          code: 'INVALID_IMAGE',
        },
      };
    }

    if (blob.size > this.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: {
          message: 'Image too large. Please try again.',
          code: 'INVALID_IMAGE',
        },
      };
    }

    return { valid: true };
  }

  /**
   * Maps DOMException/Error to CameraError
   */
  private mapErrorToCameraError(error: unknown): CameraError {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return {
          message: 'Camera permission denied. Please allow camera access in your browser settings.',
          code: 'PERMISSION_DENIED',
        };
      } else if (error.name === 'NotFoundError') {
        return {
          message: 'No camera device found. Try connecting a camera or using a different device.',
          code: 'NO_CAMERA',
        };
      } else if (error.name === 'NotReadableError') {
        return {
          message: 'Camera is already in use by another application. Close other apps using the camera.',
          code: 'CAMERA_IN_USE',
        };
      }
    }

    return {
      message: 'Camera error. Please check permissions and try again.',
      code: 'CAMERA_ERROR',
    };
  }
}

