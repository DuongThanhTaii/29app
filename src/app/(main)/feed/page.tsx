'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFeed } from '@/hooks/useFeed';
import { FILM_FILTERS } from '@/lib/filmFilters';
import { Post } from '@/types';

export default function FeedPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { posts, loading, hasMore, loadMore } = useFeed();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [burstPostId, setBurstPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace('/phone'); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore) loadMore();
    }, { threshold: 0.5 });
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleDoubleTap = (postId: string) => {
    setLikedPosts(prev => new Set(Array.from(prev).concat(postId)));
    setBurstPostId(postId);
    setTimeout(() => setBurstPostId(null), 700);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8">
        <span className="material-symbols-outlined text-6xl text-outline">photo_camera</span>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.1em', color: '#747878', textAlign: 'center' }}>
          CHƯĂ CÓ ẢNH NÀO<br />HÃY THEO DÕI NGUỜI KHÁC HOẶC ĐĂNG ẢNH ĐẦU TIÊN
        </p>
        <button
          onClick={() => router.push('/camera')}
          className="px-6 py-3 rounded-full bg-primary text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}
        >
          CHỤP ẢNH NGAY
        </button>
      </div>
    );
  }

  return (
    <div className="snap-feed">
      {posts.map((post, idx) => (
        <FeedCard
          key={post.firebaseId || post.id || idx}
          post={post}
          isLiked={likedPosts.has(post.firebaseId || '')}
          showBurst={burstPostId === (post.firebaseId || '')}
          onDoubleTap={() => handleDoubleTap(post.firebaseId || '')}
          onLike={() => toggleLike(post.firebaseId || '')}
          onComment={() => {}}
          onShare={() => {}}
          onProfile={() => router.push(`/profile/${post.userId}`)}
        />
      ))}
      <div ref={bottomRef} className="snap-feed-item flex items-center justify-center">
        {loading ? (
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#747878' }}>HẾT RỒI</p>
        )}
      </div>
    </div>
  );
}

function FeedCard({
  post,
  isLiked,
  showBurst,
  onDoubleTap,
  onLike,
  onComment,
  onShare,
  onProfile,
}: {
  post: Post;
  isLiked: boolean;
  showBurst: boolean;
  onDoubleTap: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfile: () => void;
}) {
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) onDoubleTap();
    lastTap.current = now;
  };

  return (
    <div className="snap-feed-item relative bg-black overflow-hidden" onClick={handleTap}>
      {/* Full background photo */}
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt={post.caption || 'Ảnh Polaroid'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: FILM_FILTERS[post.filmType || 'original'] }}
        />
      )}

      {/* Gradient overlay bottom */}
      <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />

      {/* Heart burst */}
      {showBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="material-symbols-outlined heart-burst text-secondary" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
      )}

      {/* Right action bar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
        {/* Profile */}
        <button onClick={e => { e.stopPropagation(); onProfile(); }} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-surface-container border-2 border-white overflow-hidden">
            {post.userId ? (
              <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-outline">person</span>
              </div>
            ) : null}
          </div>
        </button>
        {/* Like */}
        <button onClick={e => { e.stopPropagation(); onLike(); }} className="flex flex-col items-center gap-1" aria-label={isLiked ? 'Bỏ thích' : 'Thích'}>
          <span
            className="material-symbols-outlined text-[32px] transition-transform active:scale-125"
            style={{
              fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
              color: isLiked ? '#b71032' : '#ffffff',
            }}
          >
            favorite
          </span>
          <span className="text-white text-xs">{(post.likesCount || 0) + (isLiked ? 1 : 0)}</span>
        </button>
        {/* Comment */}
        <button onClick={e => { e.stopPropagation(); onComment(); }} className="flex flex-col items-center gap-1" aria-label="Bình luận">
          <span className="material-symbols-outlined text-[32px] text-white">chat_bubble</span>
          <span className="text-white text-xs">{post.commentsCount || 0}</span>
        </button>
        {/* Share */}
        <button onClick={e => { e.stopPropagation(); onShare(); }} aria-label="Chia sẻ">
          <span className="material-symbols-outlined text-[32px] text-white">share</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute left-4 right-20 bottom-6">
        <p className="text-white font-bold" style={{ fontSize: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          @{post.userId?.slice(0, 8)}
        </p>
        {post.caption && (
          <p className="text-white/90 mt-1" style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '15px', fontStyle: 'italic', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}
