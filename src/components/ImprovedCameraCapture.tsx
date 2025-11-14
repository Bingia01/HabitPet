'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, RotateCcw, Check, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { CameraErrorDisplay } from './CameraErrorDisplay';
import { FoodSelectionModal } from './FoodSelectionModal';

interface FoodAnalysis {
  foodType: string;
  confidence: number;
  calories: number;
  weight: number; // in grams
  emoji?: string;
  macros?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
  };
  analyzerSource?: string;
  usedFallback?: boolean;
}

interface ImprovedCameraCaptureProps {
  onCapture: (foodData: FoodAnalysis) => Promise<void>;
  onClose: () => void;
}

const ANALYSIS_TIMEOUT = 30000; // 30 seconds
const MIN_IMAGE_SIZE = 1000; // 1KB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImprovedCameraCapture({ onCapture, onClose }: ImprovedCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedImageRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorCode, setErrorCode] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showFoodSelection, setShowFoodSelection] = useState(false);
  const [analyzerSource, setAnalyzerSource] = useState<string>('');

  // Start camera when component mounts
  useEffect(() => {
    console.log('ImprovedCameraCapture mounted');
    startCamera();

    return () => {
      console.log('ImprovedCameraCapture unmounting');
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (capturedImageRef.current) {
      URL.revokeObjectURL(capturedImageRef.current);
      capturedImageRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStream(null);
  };

  const startCamera = async () => {
    try {
      setError('');
      setErrorCode('');
      console.log('Starting camera...');

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in this browser. Please try Safari or Chrome.');
        setErrorCode('NOT_SUPPORTED');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      let mediaStream: MediaStream;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn('Advanced constraints failed, falling back to default camera request', constraintError);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      console.log('Stream obtained:', mediaStream);

      setStream(mediaStream);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        console.log('Video source set');

        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      let message = 'Camera error. Please check permissions and try again.';
      let code = 'CAMERA_ERROR';
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          message = 'Camera permission denied. Please allow camera access in your browser settings.';
          code = 'PERMISSION_DENIED';
        } else if (error.name === 'NotFoundError') {
          message = 'No camera device found. Try connecting a camera or using a different device.';
          code = 'NO_CAMERA';
        } else if (error.name === 'NotReadableError') {
          message = 'Camera is already in use by another application. Close other apps using the camera.';
          code = 'CAMERA_IN_USE';
        }
      }
      setError(message);
      setErrorCode(code);
    }
  };

  const validateCanvas = (canvas: HTMLCanvasElement): boolean => {
    if (!canvas.width || !canvas.height) {
      console.error('Canvas has invalid dimensions:', canvas.width, canvas.height);
      setError('Failed to capture image. Canvas has invalid dimensions.');
      setErrorCode('NO_IMAGE');
      return false;
    }
    if (canvas.width < 100 || canvas.height < 100) {
      console.error('Canvas too small:', canvas.width, canvas.height);
      setError('Image too small. Please get closer to your food.');
      setErrorCode('NO_IMAGE');
      return false;
    }
    return true;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please wait for camera to initialize.');
      setErrorCode('NO_IMAGE');
      return;
    }

    setIsCapturing(true);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState < 2) {
      console.warn('Video not ready, waiting...');
      video.onloadeddata = () => {
        capturePhoto();
      };
      setIsCapturing(false);
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      setIsCapturing(false);
      setError('Failed to get canvas context.');
      setErrorCode('NO_IMAGE');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (!validateCanvas(canvas)) {
      setIsCapturing(false);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsCapturing(false);
        setError('Failed to create image blob.');
        setErrorCode('NO_IMAGE');
        return;
      }

      // Validate blob size
      if (blob.size < MIN_IMAGE_SIZE) {
        setIsCapturing(false);
        setError('Image too small. Please try again.');
        setErrorCode('NO_IMAGE');
        return;
      }

      if (blob.size > MAX_IMAGE_SIZE) {
        setIsCapturing(false);
        setError('Image too large. Please try again.');
        setErrorCode('NO_IMAGE');
        return;
      }

      if (capturedImageRef.current) {
        URL.revokeObjectURL(capturedImageRef.current);
      }
      const imageUrl = URL.createObjectURL(blob);
      setShowPreview(true);
      setIsCapturing(false);
      capturedImageRef.current = imageUrl;
      setCapturedImage(imageUrl);
    }, 'image/jpeg', 0.8);
  };

  const analyzePhoto = async () => {
    if (!canvasRef.current) {
      setError('No image to analyze.');
      setErrorCode('NO_IMAGE');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    setErrorCode('');
    setAnalyzerSource('');
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setIsAnalyzing(false);
          setError('Failed to process image.');
          setErrorCode('NO_IMAGE');
          return;
        }

        try {
          // Create timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Analysis timeout')), ANALYSIS_TIMEOUT);
          });

          // Create form data
          const formData = new FormData();
          formData.append('image', blob, 'food.jpg');
          
          // Make API call with timeout
          const fetchPromise = fetch('/api/analyze-food', {
            method: 'POST',
            body: formData,
            signal,
          });

          const response = await Promise.race([fetchPromise, timeoutPromise]);

          if (signal.aborted) {
            setIsAnalyzing(false);
            setError('Request was cancelled.');
            setErrorCode('ABORTED');
            return;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Analysis failed: ${response.status}`);
          }
          
          const result = await response.json();
          
          // Extract analyzer source from response
          const source = result.meta?.used?.[0] || 'unknown';
          const usedFallback = result.meta?.used?.length > 1;
          setAnalyzerSource(source);
          
          const realAnalysis: FoodAnalysis = {
            foodType: result.foodType || 'Unknown Food',
            confidence: result.confidence || 0.5,
            calories: result.calories || 100,
            weight: result.weight || 100,
            emoji: result.emoji || '🍽️',
            macros: result.macros,
            analyzerSource: source,
            usedFallback,
          };
          
          setFoodAnalysis(realAnalysis);
          setShowAnalysis(true);
          setIsAnalyzing(false);
        } catch (error) {
          console.error('AI Analysis failed:', error);
          setIsAnalyzing(false);
          
          if (error instanceof Error) {
            if (error.message === 'Analysis timeout') {
              setError('Analysis took too long. Please try again.');
              setErrorCode('TIMEOUT');
            } else if (error.name === 'AbortError') {
              setError('Request was cancelled.');
              setErrorCode('ABORTED');
            } else {
              setError(`Analysis failed: ${error.message}`);
              setErrorCode('NETWORK_ERROR');
            }
          } else {
            setError('Analysis failed. Please try again.');
            setErrorCode('NETWORK_ERROR');
          }
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      setError('Failed to analyze image.');
      setErrorCode('NETWORK_ERROR');
    }
  };

  const submitFood = async () => {
    if (!foodAnalysis) return;
    
    try {
      await onCapture(foodAnalysis);
      cleanup();
    } catch (error) {
      console.error('Submission failed:', error);
      setError('Failed to submit food. Please try again.');
      setErrorCode('SUBMIT_ERROR');
    }
  };

  const retakePhoto = async () => {
    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (capturedImageRef.current) {
      URL.revokeObjectURL(capturedImageRef.current);
      capturedImageRef.current = null;
    }
    setCapturedImage(null);
    setShowPreview(false);
    setShowAnalysis(false);
    setFoodAnalysis(null);
    setIsCapturing(false);
    setIsAnalyzing(false);
    setError('');
    setErrorCode('');
    setAnalyzerSource('');
    
    // Restart camera if stream was stopped
    if (!stream) {
      setIsRestarting(true);
      try {
        await startCamera();
      } finally {
        setIsRestarting(false);
      }
    }
  };

  const backToPreview = () => {
    setShowAnalysis(false);
    
    // Ensure camera stream is still active
    if (!stream) {
      startCamera();
    }
  };

  const handleFoodSelection = (selectedFood: { name: string; calories: number; weight: number; emoji: string }) => {
    const updatedAnalysis: FoodAnalysis = {
      foodType: selectedFood.name,
      confidence: 1.0, // User confirmed, so 100% confidence
      calories: selectedFood.calories,
      weight: selectedFood.weight,
      emoji: selectedFood.emoji,
      analyzerSource: 'user',
    };
    
    setFoodAnalysis(updatedAnalysis);
    setShowFoodSelection(false);
    setShowAnalysis(true);
  };

  const openFoodSelection = () => {
    setShowFoodSelection(true);
  };

  const stopCamera = () => {
    console.log('stopCamera called');
    cleanup();
    onClose();
  };

  const handleRetry = () => {
    setError('');
    setErrorCode('');
    if (showPreview) {
      analyzePhoto();
    } else {
      startCamera();
    }
  };

  // Show error display if there's an error
  if (error && errorCode) {
    return (
      <CameraErrorDisplay
        error={error}
        errorCode={errorCode}
        onRetry={handleRetry}
        onClose={stopCamera}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-black/50 flex-shrink-0">
        <Button variant="ghost" onClick={stopCamera} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-white text-lg font-semibold">Capture Food</h2>
        <div className="w-6" />
      </div>

      {/* Camera View - Fixed height to leave room for buttons */}
      <div className="flex-1 relative min-h-0">
        {!showPreview ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Camera overlay */}
            <div className="absolute inset-2 border-2 border-white/50 rounded-lg pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-green-400 rounded pointer-events-none" />
            
            {/* Instructions */}
            <div className="absolute top-2 left-2 right-2 text-center">
              {isRestarting ? (
                <p className="text-white bg-blue-500/50 px-3 py-1 rounded-full text-sm">
                  Restarting camera...
                </p>
              ) : (
                <p className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                  Point camera at your food
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <img 
              src={capturedImage} 
              alt="Captured food" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls - Always visible at bottom with fixed height */}
      <div className="p-3 bg-black/50 flex-shrink-0">
        {!showPreview ? (
          // Camera View Controls
          <div className="space-y-3">
            {stream && (
              <div className="text-center text-green-400 mb-2">
                <p className="text-sm">✅ Camera active</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={capturePhoto} 
                disabled={isCapturing || !stream}
                className="flex-1 bg-green-600 hover:bg-green-700 h-10"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={stopCamera} 
                className="flex-1 text-white border-white hover:bg-white/10 bg-transparent h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : !showAnalysis ? (
          // Preview Controls
          <div className="space-y-3">
            <div className="text-center text-white mb-2">
              <p className="text-sm">Review your photo. Is it clear?</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={analyzePhoto}
                disabled={isAnalyzing}
                className="flex-1 bg-green-600 hover:bg-green-700 h-10"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Analyze Food
                  </>
                )}
              </Button>
              <Button 
                onClick={retakePhoto}
                variant="outline" 
                className="flex-1 text-white border-white hover:bg-white/10 bg-transparent h-10"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
            </div>
            <Button 
              onClick={stopCamera}
              variant="ghost" 
              className="w-full text-white hover:bg-white/10 h-8"
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
          </div>
        ) : (
          // Analysis Summary Controls - Just show retake option
          <div className="space-y-3">
            <div className="text-center text-white mb-2">
              <p className="text-sm">Review the analysis above</p>
            </div>
            <Button 
              onClick={retakePhoto}
              variant="ghost" 
              className="w-full text-white hover:bg-white/10 h-8"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take New Photo
            </Button>
          </div>
        )}
      </div>

      {/* Food Analysis Summary - Overlay */}
      {showAnalysis && foodAnalysis && (
        <div className="absolute inset-2 bg-black/80 rounded-lg p-3 flex flex-col justify-center">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">🍎 Food Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-600">{foodAnalysis.foodType}</h3>
                <p className="text-xs text-gray-500">Confidence: {Math.round(foodAnalysis.confidence * 100)}%</p>
                
                {/* Analyzer Source Indicator */}
                {analyzerSource && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">Analyzed by:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      analyzerSource === 'supabase' ? 'bg-blue-100 text-blue-700' :
                      analyzerSource === 'openai' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {analyzerSource === 'supabase' ? 'Supabase AI' :
                       analyzerSource === 'openai' ? 'OpenAI Vision' :
                       analyzerSource === 'user' ? 'Manual Selection' :
                       'AI Analysis'}
                    </span>
                    {foodAnalysis.usedFallback && (
                      <span className="text-xs text-orange-600">(Fallback)</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Calories</p>
                  <p className="text-lg font-bold text-orange-600">{foodAnalysis.calories}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="text-lg font-bold text-blue-600">{foodAnalysis.weight}g</p>
                </div>
              </div>

              {/* Macros Display */}
              {foodAnalysis.macros && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Protein</p>
                    <p className="text-sm font-bold text-blue-600">{foodAnalysis.macros.proteinG}g</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Carbs</p>
                    <p className="text-sm font-bold text-green-600">{foodAnalysis.macros.carbsG}g</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <p className="text-xs text-gray-600">Fat</p>
                    <p className="text-sm font-bold text-yellow-600">{foodAnalysis.macros.fatG}g</p>
                  </div>
                </div>
              )}
              
              <div className="text-center text-xs text-gray-600 mb-3">
                <p>Is this correct?</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={submitFood}
                  className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-sm"
                >
                  Yes, Submit
                </Button>
                <Button 
                  onClick={openFoodSelection}
                  variant="outline" 
                  className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 h-8 text-sm"
                >
                  Wrong? Select Different
                </Button>
              </div>
              
              <Button 
                onClick={backToPreview}
                variant="ghost" 
                className="w-full text-gray-500 hover:bg-gray-50 h-6 text-xs"
              >
                Back to Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Food Selection Modal */}
      {showFoodSelection && foodAnalysis && (
        <FoodSelectionModal
          isOpen={showFoodSelection}
          onClose={() => setShowFoodSelection(false)}
          onSelect={handleFoodSelection}
          currentGuess={{
            name: foodAnalysis.foodType,
            calories: foodAnalysis.calories,
            weight: foodAnalysis.weight,
            emoji: foodAnalysis.emoji || '🍽️'
          }}
        />
      )}
    </div>
  );
}

