import Dexie, { Table } from 'dexie';
import { User, Post, WallLayout, Follow, Like, Comment, Notification, SyncQueueItem } from '@/types';

export class PolaroidDB extends Dexie {
  users!: Table<User>;
  posts!: Table<Post>;
  wallLayouts!: Table<WallLayout & { id?: number }>;
  follows!: Table<Follow>;
  likes!: Table<Like>;
  comments!: Table<Comment>;
  notifications!: Table<Notification>;
  feedCursor!: Table<{ id: string; lastFetch: Date; lastDocId: string }>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('PolaroidSocial');
    this.version(1).stores({
      users: 'uid, phone',
      posts: '++id, firebaseId, userId, createdAt, isSynced',
      wallLayouts: '++id, userId',
      follows: '++id, followerId, followingId, [followerId+followingId]',
      likes: '++id, userId, postId, [userId+postId]',
      comments: '++id, firebaseId, postId, createdAt',
      notifications: '++id, userId, read, createdAt',
      feedCursor: 'id',
      syncQueue: '++id, type, createdAt',
    });
  }
}

export const localDB = new PolaroidDB();
