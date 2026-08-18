import { doc, addDoc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestore } from './firebase';
import { localDB } from './db';
import { uploadImageToCloudinary } from './cloudinaryUpload';
import { Post } from '@/types';

export class SyncEngine {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async syncPost(post: Post): Promise<void> {
    if (!this.isOnline) {
      await localDB.syncQueue.add({
        type: 'post',
        payload: { localId: post.id },
        retries: 0,
        createdAt: new Date(),
      });
      return;
    }
    await this.uploadPost(post);
  }

  private async uploadPost(post: Post): Promise<void> {
    try {
      if (!post.imageBlob) throw new Error('No image blob');

      // Upload image to Cloudinary (Firebase Storage requires Blaze plan)
      const imageUrl = await uploadImageToCloudinary(
        post.imageBlob,
        `polaroid/posts/${post.userId}`
      );

      // Write to Firestore
      const batch = writeBatch(firestore);

      const postRef = doc(collection(firestore, 'posts'));
      batch.set(postRef, {
        userId: post.userId,
        imageUrl,
        caption: post.caption || '',
        filmType: post.filmType,
        frameType: post.frameType,
        frameColor: post.frameColor,
        location: post.location || '',
        provinceCode: post.provinceCode || '',
        lat: post.lat || null,
        lng: post.lng || null,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      // If has location, also write to mapPosts
      if (post.lat && post.lng) {
        await addDoc(collection(firestore, 'mapPosts'), {
          postId: postRef.id,
          lat: post.lat,
          lng: post.lng,
          provinceCode: post.provinceCode || '',
          imageUrl,
          userId: post.userId,
          createdAt: serverTimestamp(),
        });
      }

      // Update IndexedDB with Firebase ID and synced status
      if (post.id) {
        await localDB.posts.update(post.id, {
          firebaseId: postRef.id,
          imageUrl,
          isSynced: true,
          imageBlob: undefined, // Free memory
        });
      }
    } catch (err) {
      console.error('Upload post failed:', err);
      if (post.id) {
        await localDB.posts.update(post.id, {
          syncError: (err as Error).message,
        });
      }
      // Re-queue
      await localDB.syncQueue.add({
        type: 'post',
        payload: { localId: post.id },
        retries: 1,
        createdAt: new Date(),
      });
    }
  }

  async syncLike(postId: string, userId: string, liked: boolean): Promise<void> {
    if (!this.isOnline) {
      await localDB.syncQueue.add({
        type: liked ? 'like' : 'unlike',
        payload: { postId, userId },
        retries: 0,
        createdAt: new Date(),
      });
      return;
    }

    try {
      const batch = writeBatch(firestore);
      if (liked) {
        const likeRef = doc(collection(firestore, 'likes'));
        batch.set(likeRef, { userId, postId, createdAt: serverTimestamp() });
        batch.update(doc(firestore, 'posts', postId), { likesCount: (await import('firebase/firestore')).increment(1) });
      } else {
        // Find and delete like doc - simplified
        const { getDocs, query, where } = await import('firebase/firestore');
        const q = query(collection(firestore, 'likes'), where('userId', '==', userId), where('postId', '==', postId));
        const snap = await getDocs(q);
        snap.forEach(d => batch.delete(d.ref));
        batch.update(doc(firestore, 'posts', postId), { likesCount: (await import('firebase/firestore')).increment(-1) });
      }
      await batch.commit();
    } catch (err) {
      console.error('Sync like failed:', err);
    }
  }

  async syncFollow(followerId: string, followingId: string, follow: boolean): Promise<void> {
    if (!this.isOnline) {
      await localDB.syncQueue.add({
        type: follow ? 'follow' : 'unfollow',
        payload: { followerId, followingId },
        retries: 0,
        createdAt: new Date(),
      });
      return;
    }

    try {
      const { increment } = await import('firebase/firestore');
      const batch = writeBatch(firestore);

      if (follow) {
        const followRef = doc(collection(firestore, 'follows'));
        batch.set(followRef, { followerId, followingId, createdAt: serverTimestamp() });
        batch.update(doc(firestore, 'users', followerId), { followingCount: increment(1) });
        batch.update(doc(firestore, 'users', followingId), { followersCount: increment(1) });

        // Notification
        batch.set(doc(collection(firestore, 'notifications')), {
          userId: followingId,
          type: 'follow',
          fromUserId: followerId,
          read: false,
          createdAt: serverTimestamp(),
        });
      } else {
        const { getDocs, query, where } = await import('firebase/firestore');
        const q = query(collection(firestore, 'follows'),
          where('followerId', '==', followerId),
          where('followingId', '==', followingId));
        const snap = await getDocs(q);
        snap.forEach(d => batch.delete(d.ref));
        batch.update(doc(firestore, 'users', followerId), { followingCount: increment(-1) });
        batch.update(doc(firestore, 'users', followingId), { followersCount: increment(-1) });
      }

      await batch.commit();
    } catch (err) {
      console.error('Sync follow failed:', err);
    }
  }

  private async processQueue(): Promise<void> {
    const items = await localDB.syncQueue.toArray();
    for (const item of items) {
      if (item.retries >= 3) {
        await localDB.syncQueue.delete(item.id!);
        continue;
      }
      try {
        if (item.type === 'post') {
          const post = await localDB.posts.get(item.payload.localId as number);
          if (post && !post.isSynced) await this.uploadPost(post);
        }
        await localDB.syncQueue.delete(item.id!);
      } catch {
        await localDB.syncQueue.update(item.id!, { retries: item.retries + 1 });
      }
    }
  }
}

export const syncEngine = new SyncEngine();
