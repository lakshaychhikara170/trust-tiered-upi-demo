import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flashlight, Image as ImageIcon } from 'lucide-react';

export default function Scan() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSimulateScan = () => {
    // Navigate to pay with a mock scanned merchant (e.g. Cafe Cupido)
    navigate('/pay', { state: { scannedRecipient: 'Cafe Cupido' } });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative">
      <style>{`
        @keyframes scanline {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scanline 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 relative z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Scan QR Code</h1>
        <div className="w-10"></div>
      </div>

      {/* Camera Feed */}
      {hasPermission === false ? (
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-0 flex items-center justify-center">
          <div className="text-white/50 text-sm text-center px-6 mt-20">
            Camera feed unavailable.<br/>
            (Please tap 'Demo: Tap to Scan' below)
          </div>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Overlay / Reticle */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-64 h-64 relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
          
          {/* Scanning line animation */}
          <div className="w-full h-1 bg-indigo-500 absolute top-0 animate-scan shadow-[0_0_15px_#6366f1]"></div>
        </div>
        <p className="mt-8 text-white/80 font-medium">Point at any QR code to scan</p>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 pb-12 pt-6 px-8 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
        <button className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
            <ImageIcon className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Gallery</span>
        </button>
        
        <button 
          onClick={handleSimulateScan}
          className="px-6 py-3 bg-indigo-600 rounded-full font-bold shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 transition-all cursor-pointer pointer-events-auto animate-pulse border-2 border-indigo-400"
        >
          Demo: Tap to Scan
        </button>

        <button className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
            <Flashlight className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Flash</span>
        </button>
      </div>
    </div>
  );
}
