'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { localDB } from '@/lib/db';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { syncEngine } from '@/lib/syncEngine';
import { User, WallItem } from '@/types';
import Avatar from '@/components/ui/Avatar';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuthStore();
  const { editMode, toggleEditMode } = useUIStore();

  const userId = params.userId as string;
  const isOwn = currentUser?.uid === userId;

  const [profile, setProfile] = useState<User | null>(null);
  const [wallItems, setWallItems] = useState<WallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) { router.replace('/phone'); return; }

    const fetchProfile = async () => {
      // Try IndexedDB first
      const cached = await localDB.users.get(userId);
      if (cached) setProfile(cached);

      // Fetch from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), uid: userId } as User;
        setProfile(userData);
        await localDB.users.put(userData);
      }

      // Fetch wall layout
      const layoutDoc = await getDoc(doc(firestore, 'wallLayouts', userId));
      if (layoutDoc.exists()) {
        const data = layoutDoc.data();
        setWallItems(data.items || []);
        await localDB.wallLayouts.put({ userId, items: data.items || [], updatedAt: new Date(), id: undefined });
      } else {
        const localLayout = await localDB.wallLayouts.where('userId').equals(userId).first();
        if (localLayout) setWallItems(localLayout.items);
      }

      setLoading(false);
    };

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFollow = async () => {
    if (!currentUser) return;
    const newState = !isFollowing;
    setIsFollowing(newState);
    await syncEngine.syncFollow(currentUser.uid, userId, newState);
    if (profile) {
      setProfile(p => p ? { ...p, followersCount: p.followersCount + (newState ? 1 : -1) } : p);
    }
  };

  const saveLayout = async () => {
    if (!currentUser || !isOwn) return;
    await localDB.wallLayouts.put({ userId, items: wallItems, updatedAt: new Date(), id: undefined });
    await setDoc(doc(firestore, 'wallLayouts', userId), {
      items: wallItems.map(item => ({ ...item, stickers: item.stickers || [] })),
      updatedAt: new Date(),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#747878' }}>
          KHÔNG TÌM THẤY HỒ SƠ
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <header className="relative z-20 pt-12 pb-8 px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 bg-surface/80 backdrop-blur-sm">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface"
            style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}
          >
            <Avatar src={profile.avatar} name={profile.name} size={128} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center flex flex-col items-center gap-4 w-full">
          <div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '24px', fontWeight: 700 }}>
              {profile.name}
            </h1>
            {profile.bio && (
              <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '16px', fontStyle: 'italic', color: '#444748', marginTop: '4px' }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats */}
          <div
            className="flex gap-6 w-full justify-center py-3"
            style={{ borderTop: '1px solid #c4c7c7', borderBottom: '1px solid #c4c7c7' }}
          >
            {[
              { label: 'ẢNH', value: wallItems.length },
              { label: 'NGƯỜI THEO DÕI', value: profile.followersCount },
              { label: 'ĐANG THEO DÕI', value: profile.followingCount },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', color: '#444748', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action button */}
          {isOwn ? (
            <button
              onClick={() => { if (editMode) saveLayout(); toggleEditMode(); }}
              className="px-6 py-2 rounded-full"
              style={{
                background: editMode ? '#b71032' : '#1d1c17',
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {editMode ? 'LƯU TƯỜNG' : 'CHỈNH SỬA TƯỜNG'}
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className="px-6 py-2 rounded-full"
              style={{
                background: isFollowing ? 'transparent' : '#1d1c17',
                color: isFollowing ? '#1d1c17' : '#ffffff',
                border: isFollowing ? '2px solid #1d1c17' : 'none',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {isFollowing ? 'ĐANG THEO DÕI' : 'THEO DÕI'}
            </button>
          )}
        </div>
      </header>

      {/* Cork Wall */}
      <main
        ref={wallRef}
        className="relative min-h-screen cork-bg"
        style={{ minHeight: '80vh' }}
      >
        {wallItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="material-symbols-outlined text-6xl text-white/60">photo_camera</span>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              {isOwn ? 'TƯỜNG CỦA BẠN TRỐNG\nHÃY ĐĂNG ẢNH ĐẦU TIÊN!' : 'CHƯA CÓ ẢNH NÀO'}
            </p>
            {isOwn && (
              <button
                onClick={() => router.push('/camera')}
                className="px-5 py-2 rounded-full mt-2"
                style={{
                  background: '#1d1c17',
                  color: '#fff',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                }}
              >
                CHỤP ẢNH
              </button>
            )}
          </div>
        ) : (
          wallItems.map((item, idx) => (
            <PolaroidOnWall
              key={`${item.postId}-${idx}`}
              item={item}
              editMode={editMode && isOwn}
              onMove={(x, y) => {
                setWallItems(prev => prev.map((w, i) => i === idx ? { ...w, x, y } : w));
              }}
              onRemove={() => {
                setWallItems(prev => prev.filter((_, i) => i !== idx));
              }}
            />
          ))
        )}

        {/* Edit mode: FAB sticker/draw */}
        {editMode && isOwn && (
          <div className="fixed bottom-28 right-6 z-40 flex flex-col gap-3">
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: '#1d1c17', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}
              aria-label="Thêm sticker"
            >
              <span className="material-symbols-outlined text-white text-[22px]">emoji_emotions</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// Draggable Polaroid on wall
function PolaroidOnWall({
  item,
  editMode,
  onMove,
  onRemove,
}: {
  item: WallItem;
  editMode: boolean;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: item.x, y: item.y });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const nx = e.clientX - dragOffset.x;
    const ny = e.clientY - dragOffset.y;
    setPos({ x: nx, y: ny });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onMove(pos.x, pos.y);
      setIsDragging(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        zIndex: isDragging ? 999 : item.zIndex,
        cursor: editMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        userSelect: 'none',
        width: '160px',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => !editMode && setFlipped(f => !f)}
    >
      {/* Thumbtack */}
      <div className="thumbtack" />

      {/* Polaroid frame */}
      <div
        className="bg-white"
        style={{
          padding: '8px 8px 28px 8px',
          border: '1px solid #e0d5c5',
          borderRadius: '2px',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.12)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="aspect-square bg-surface-container-high overflow-hidden" style={{ width: '144px', height: '144px' }}>
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-outline text-3xl">image</span>
          </div>
        </div>
      </div>

      {/* Edit mode: remove button */}
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: '#b71032', zIndex: 10 }}
          aria-label="Xóa khỏi tường"
        >
          <span className="material-symbols-outlined text-white text-[14px]">close</span>
        </button>
      )}
    </div>
  );
}
