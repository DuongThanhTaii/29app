'use client';
import { useCallback } from 'react';
import { compressImage } from '@/lib/imageCompressor';
import { syncEngine } from '@/lib/syncEngine';
import { localDB } from '@/lib/db';
import { useAuthStore } from '@/stores/authStore';
import { FilmType, FrameRatio, PublishTarget } from '@/types';
import { parseFirebaseError } from '@/lib/errorMessages';

export function usePost() {
  const { user } = useAuthStore();

  const createPost = useCallback(async (params: {
    blob: Blob;
    caption: string;
    captionColor: string;
    filmType: FilmType;
    frameRatio: FrameRatio;
    target: PublishTarget;
    lat?: number;
    lng?: number;
    provinceCode?: string;
    location?: string;
  }) => {
    if (!user) throw new Error('Chưa đăng nhập');

    try {
      // Compress
      const compressed = await compressImage(params.blob, 1200);

      // Write to IndexedDB first (Local-First)
      const localId = await localDB.posts.add({
        userId: user.uid,
        imageUrl: '', // will be updated after sync
        imageBlob: compressed,
        caption: params.caption.slice(0, 30),
        filmType: params.filmType,
        frameRatio: params.frameRatio,
        location: params.location || params.provinceCode || '',
        provinceCode: params.provinceCode,
        lat: params.lat,
        lng: params.lng,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        isSynced: false,
      });

      // Background sync
      const post = await localDB.posts.get(localId);
      if (post) {
        await syncEngine.syncPost(post);
      }

      return localId;
    } catch (err) {
      throw new Error(parseFirebaseError(err));
    }
  }, [user]);

  const likePost = useCallback(async (postId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      await localDB.likes.add({ userId: user.uid, postId, createdAt: new Date() });
    } else {
      await localDB.likes.where('[userId+postId]').equals([user.uid, postId]).delete();
    }

    await syncEngine.syncLike(postId, user.uid, isLiked);
  }, [user]);

  const isLikedByMe = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) return false;
    const like = await localDB.likes
      .where('[userId+postId]')
      .equals([user.uid, postId])
      .first();
    return !!like;
  }, [user]);

  return { createPost, likePost, isLikedByMe };
}
}
