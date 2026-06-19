import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Move, Check } from 'lucide-react';

interface ImageAdjusterModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (adjustedBase64: string) => void;
}

export const ImageAdjusterModal: React.FC<ImageAdjusterModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartDistance = useRef<number | null>(null);
  const touchStartZoom = useRef<number>(1);
  const touchStartMidpoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      // Reset adjustments when modal is opened with a new image
      setZoom(1);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
      currentOffset.current = { x: 0, y: 0 };
    }
  }, [isOpen, imageSrc]);

  // Non-passive wheel event listener to support high-performance scroll-to-zoom on desktop
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDir = e.deltaY < 0 ? 1 : -1;
      const zoomStep = 0.08;
      setZoom((prev) => {
        const nextZoom = Math.min(Math.max(prev + zoomDir * zoomStep, 1.0), 4.0);
        return nextZoom;
      });
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheelNative);
    };
  }, [isOpen]);

  if (!isOpen || !imageSrc) return null;

  // Mouse Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Boundary check / soft limit of offsets based on size
    setOffsetX(newX);
    setOffsetY(newY);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch Drag Event Handlers (highly optimized with dual finger pinch & swipe control)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - offsetX, y: touch.clientY - offsetY };
      touchStartDistance.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(true);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      
      touchStartDistance.current = dist;
      touchStartZoom.current = zoom;
      touchStartMidpoint.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      touchStartOffset.current = { x: offsetX, y: offsetY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.cancelable) e.preventDefault();
    if (!isDragging) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.current.x;
      const newY = touch.clientY - dragStart.current.y;
      setOffsetX(newX);
      setOffsetY(newY);
    } else if (e.touches.length === 2 && touchStartDistance.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      
      // Pinch to Zoom
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = currentDist / touchStartDistance.current;
      const nextZoom = Math.min(Math.max(touchStartZoom.current * scale, 1.0), 4.0);
      setZoom(nextZoom);

      // Two-finger Translation (Drag/Pan)
      const currentMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      const dx = currentMid.x - touchStartMidpoint.current.x;
      const dy = currentMid.y - touchStartMidpoint.current.y;
      
      setOffsetX(touchStartOffset.current.x + dx);
      setOffsetY(touchStartOffset.current.y + dy);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistance.current = null;
  };

  // Process and crop the image onto a standard 300x300 container
  const handleApply = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw beautiful, clean high-resolution canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      // 1. Move origin to center
      ctx.translate(150, 150);
      
      // 2. Apply Custom Rotation
      ctx.rotate((rotation * Math.PI) / 180);
      
      // 3. Apply custom zoom
      ctx.scale(zoom, zoom);

      // Standard aspect ratio covering (same as object-cover)
      const imgRatio = img.width / img.height;
      let drawWidth = 300;
      let drawHeight = 300;

      if (imgRatio > 1) {
        // Landscape input
        drawHeight = 300;
        drawWidth = 300 * imgRatio;
      } else {
        // Portrait or Square input
        drawWidth = 300;
        drawHeight = 300 / imgRatio;
      }

      // Map offset X & Y from the 256px container preview to the 300px export canvas space
      const previewSize = 256; 
      const scaleToCanvas = 300 / previewSize;
      
      // Solve translation inside scaled and rotated context perfectly:
      const rad = (rotation * Math.PI) / 180;
      const tx = offsetX * scaleToCanvas;
      const ty = offsetY * scaleToCanvas;

      // Rotated vector coordinate correction project back onto image axes
      const dx = (tx * Math.cos(rad) + ty * Math.sin(rad)) / zoom;
      const dy = (-tx * Math.sin(rad) + ty * Math.cos(rad)) / zoom;

      // Render image centered
      ctx.drawImage(img, -drawWidth / 2 + dx, -drawHeight / 2 + dy, drawWidth, drawHeight);

      // Export as premium JPG data-url
      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onConfirm(finalDataUrl);
    };
    img.src = imageSrc;
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0e1320] w-full max-w-md flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-950/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-sky-300">
              <Move className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">Ajustar e Cortar Imagem</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Display Area */}
        <div className="p-6 flex flex-col items-center justify-center gap-6">
          
          {/* Circular Frame Container */}
          <div className="relative select-none">
            <div 
              ref={containerRef}
              className="w-64 h-64 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 relative cursor-move flex items-center justify-center shadow-inner"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Inner Circle Overlay indicating active crop boundary */}
              <div className="absolute inset-0 border-2 border-blue-500 rounded-full pointer-events-none z-10 opacity-70" />
              
              <img
                src={imageSrc}
                alt="Ajuste do perfil"
                className="pointer-events-none select-none max-w-none transform"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
              />
            </div>
            <div className="absolute -bottom-1 right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-md border border-white dark:border-gray-800 z-20 pointer-events-none">
              <Move className="h-3 w-3 animate-pulse" />
            </div>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center font-medium max-w-xs">
            Arraste a foto para centralizar. Use os controles abaixo para dar zoom e rotacionar perfeitamente, garantindo visualização ideal no celular e computador.
          </p>

          {/* Interactive Sliders UI panel */}
          <div className="w-full space-y-4 bg-gray-50 dark:bg-gray-950/40 p-4 rounded-xl border border-gray-150 dark:border-gray-800 text-xs">
            
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-blue-500" />
                  Zoom ({Math.round(zoom * 100)}%)
                </span>
                <span className="font-mono text-[10px] text-gray-400">1.0x - 4.0x</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-emerald-500" />
                  Rotação ({rotation}°)
                </span>
                <span className="font-mono text-[10px] text-gray-400">0° - 360°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Manual Quick Adjustment Buttons */}
            <div className="flex items-center justify-between pt-1 font-sans">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Ajustes Rápidos</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev - 90 + 360) % 360)}
                  className="p-1 px-2 hover:bg-white dark:hover:bg-gray-900 rounded border border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-300 text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="Girar 90 graus anti-horário"
                >
                  <RotateCcw className="h-3 w-3" />
                  -90°
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1 px-2 hover:bg-white dark:hover:bg-gray-900 rounded border border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-300 text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="Girar 90 graus horários"
                >
                  <RotateCw className="h-3 w-3" />
                  +90°
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-305 rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Resetar
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-950/20 border-t border-gray-150 dark:border-gray-800 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 text-xs font-semibold cursor-pointer transition-all"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            Aplicar Ajuste
          </button>
        </div>

      </div>
    </div>
  );
};
