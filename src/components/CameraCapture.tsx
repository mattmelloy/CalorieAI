import React, { useRef, useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Prefer back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Could not access camera. Please ensure you have granted camera permissions.');
      }
    }

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop the camera before calling onCapture
        stopCamera();
        
        // Send the captured image data
        onCapture(imageData);
      }
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600">Camera Error</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Camera Preview Container */}
      <div className="relative flex-1">
        {/* Video Preview with Safe Area Padding */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute w-full h-full object-cover"
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Close Button - Positioned for Easy Access */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-safe right-4 m-4 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          style={{ marginTop: 'env(safe-area-inset-top, 1rem)' }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Capture Button Container - Fixed at Bottom */}
      <div 
        className="relative bg-black py-8"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 2rem)' }}
      >
        <div className="flex justify-center items-center">
          <button
            onClick={handleCapture}
            className="bg-white rounded-full p-6 shadow-lg hover:bg-gray-100 transition-colors transform active:scale-95"
            aria-label="Take photo"
          >
            <Camera size={36} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}