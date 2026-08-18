import { create } from 'zustand';
import { FilmType, FrameType } from '@/types';

interface CameraState {
  filmType: FilmType;
  frameType: FrameType;
  frameColor: string;
  capturedImage: { url: string; blob: Blob } | null;
  setFilmType: (type: FilmType) => void;
  setFrameType: (type: FrameType) => void;
  setFrameColor: (color: string) => void;
  setCapture: (data: { url: string; blob: Blob } | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  filmType: 'original',
  frameType: 'instax-mini',
  frameColor: '#FBFBF8',
  capturedImage: null,
  setFilmType: (type) => set({ filmType: type }),
  setFrameType: (type) => set({ frameType: type }),
  setFrameColor: (color) => set({ frameColor: color }),
  setCapture: (data) => set({ capturedImage: data }),
}));
