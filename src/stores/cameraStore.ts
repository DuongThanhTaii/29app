import { create } from 'zustand';
import { FilmType, FrameRatio } from '@/types';

interface CameraState {
  filmType: FilmType;
  frameRatio: FrameRatio;
  capturedBlob: Blob | null;
  capturedDataUrl: string | null;
  isCapturing: boolean;
  setFilmType: (filmType: FilmType) => void;
  setFrameRatio: (frameRatio: FrameRatio) => void;
  setCapture: (blob: Blob, dataUrl: string) => void;
  clearCapture: () => void;
  setCapturing: (v: boolean) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  filmType: 'original',
  frameRatio: '3:4',
  capturedBlob: null,
  capturedDataUrl: null,
  isCapturing: false,
  setFilmType: (filmType) => set({ filmType }),
  setFrameRatio: (frameRatio) => set({ frameRatio }),
  setCapture: (capturedBlob, capturedDataUrl) => set({ capturedBlob, capturedDataUrl }),
  clearCapture: () => set({ capturedBlob: null, capturedDataUrl: null }),
  setCapturing: (isCapturing) => set({ isCapturing }),
}));
