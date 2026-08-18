import { create } from 'zustand';

type ActiveSheet = 'comment' | 'share' | 'sticker' | 'notification' | 'location' | null;

interface UIState {
  editMode: boolean;
  drawMode: boolean;
  activeSheet: ActiveSheet;
  notifCount: number;
  activePostId: string | null;
  toggleEditMode: () => void;
  toggleDrawMode: () => void;
  openSheet: (sheet: ActiveSheet, postId?: string | null) => void;
  closeSheet: () => void;
  setNotifCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  editMode: false,
  drawMode: false,
  activeSheet: null,
  notifCount: 0,
  activePostId: null,
  toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
  toggleDrawMode: () => set((s) => ({ drawMode: !s.drawMode })),
  openSheet: (activeSheet, activePostId = null) => set({ activeSheet, activePostId }),
  closeSheet: () => set({ activeSheet: null, activePostId: null }),
  setNotifCount: (notifCount) => set({ notifCount }),
}));
