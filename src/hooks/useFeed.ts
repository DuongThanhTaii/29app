'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot,
  getDocs, where, startAfter, DocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { localDB } from '@/lib/db';
import { Post } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const PAGE_SIZE = 10;

export function useFeed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Show cached data immediately
    localDB.posts
      .orderBy('createdAt')
      .reverse()
      .limit(20)
      .toArray()
      .then(cached => {
        if (cached.length > 0) setPosts(cached);
        setLoading(false);
      });

    // 2. Get following list first
    const fetchFollowing = async () => {
      const followsSnap = await getDocs(
        query(collection(firestore, 'follows'), where('followerId', '==', user.uid))
      );
      const followingIds = followsSnap.docs.map(d => d.data().followingId as string);
      // Always include self
      const ids = [user.uid, ...followingIds].slice(0, 10); // Firestore in[] limit

      // 3. Real-time subscription
      const q = query(
        collection(firestore, 'posts'),
        where('userId', 'in', ids),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        const fresh = snapshot.docs.map(d => ({
          ...d.data(),
          firebaseId: d.id,
          id: undefined,
          createdAt: d.data().createdAt?.toDate() || new Date(),
          isSynced: true,
        } as Post));

        setPosts(fresh);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setLoading(false);

        // Cache
        localDB.posts.bulkPut(fresh).catch(() => {});
      });

      return unsubscribe;
    };

    let unsubscribeFn: (() => void) | undefined;
    fetchFollowing().then(unsub => { unsubscribeFn = unsub; });
    return () => unsubscribeFn?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadMore = useCallback(async () => {
    if (!user || !lastDoc || !hasMore) return;

    const followsSnap = await getDocs(
      query(collection(firestore, 'follows'), where('followerId', '==', user.uid))
    );
    const ids = [user.uid, ...followsSnap.docs.map(d => d.data().followingId as string)].slice(0, 10);

    const q = query(
      collection(firestore, 'posts'),
      where('userId', 'in', ids),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);
    const more = snap.docs.map(d => ({
      ...d.data(),
      firebaseId: d.id,
      createdAt: d.data().createdAt?.toDate() || new Date(),
      isSynced: true,
    } as Post));

    setPosts(prev => [...prev, ...more]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.docs.length === PAGE_SIZE);
  }, [user, lastDoc, hasMore]);

  return { posts, loading, hasMore, loadMore };
}
