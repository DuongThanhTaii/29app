export type FilmType = 'original' | 'kodak' | 'fuji' | 'polaroid' | 'ilford';
export type FrameType = 'instax-mini' | 'instax-square' | 'instax-wide' | 'polaroid-600';
export type NotifType = 'like' | 'follow' | 'comment';
export type PublishTarget = 'wall' | 'map' | 'both';

export interface User {
  uid: string;
  phone: string;
  email?: string;
  name: string;
  avatar?: string;
  bio?: string;
  followingCount: number;
  followersCount: number;
  createdAt: Date;
}

export interface Post {
  id?: number;
  firebaseId?: string;
  userId: string;
  imageUrl: string;
  imageBlob?: Blob;
  caption?: string;
  filmType: FilmType;
  frameType: FrameType;
  frameColor: string;
  location?: string;
  provinceCode?: string;
  lat?: number;
  lng?: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isSynced: boolean;
  syncError?: string;
}

export interface WallItem {
  postId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  stickers?: Sticker[];
}

export interface WallLayout {
  userId: string;
  items: WallItem[];
  doodles?: DoodleStroke[];
  updatedAt: Date;
}

export interface Sticker {
  id: string;
  type: 'flag' | 'star' | 'heart' | 'custom';
  emoji?: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface DoodleStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface Follow {
  id?: number;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Like {
  id?: number;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface Comment {
  id?: number;
  firebaseId?: string;
  postId: string;
  userId: string;
  text: string;
  parentId?: string;
  likesCount: number;
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string;
}

export interface Notification {
  id?: number;
  firebaseId?: string;
  userId: string;
  type: NotifType;
  fromUserId: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  postId?: string;
  read: boolean;
  createdAt: Date;
}

export interface MapPin {
  id: string;
  postId: string;
  lat: number;
  lng: number;
  provinceCode: string;
  imageUrl?: string;
  userId?: string;
}

export interface Province {
  code: string;
  name: string;
  lat: number;
  lng: number;
  region: 'north' | 'central' | 'south' | 'central-highlands';
}

export interface SyncQueueItem {
  id?: number;
  type: 'post' | 'like' | 'unlike' | 'comment' | 'follow' | 'unfollow' | 'wall';
  payload: Record<string, unknown>;
  retries: number;
  createdAt: Date;
}
