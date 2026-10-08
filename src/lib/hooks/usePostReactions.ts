'use client';

import { useCallback, useEffect, useState } from 'react';

const LIKES_KEY = 'gy-writing-likes';
const COMMENTS_KEY = 'gy-writing-comments';
export const COMMENT_MAX = 500;

/** 访客自己写的评论：评论服务上线前只存在本机 */
export interface LocalComment {
  text: string;
  at: number;
}

type CommentMap = Record<string, LocalComment[]>;

function read<T>(key: string, valid: (v: unknown) => v is T, fallback: T): T {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? 'null');
    return valid(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 隐私模式或存储已满：本次会话内仍然有效，只是不持久化
  }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isCommentMap = (v: unknown): v is CommentMap =>
  !!v &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  Object.values(v).every(
    (list) =>
      Array.isArray(list) &&
      list.every((c) => c && typeof c.text === 'string' && typeof c.at === 'number')
  );

/**
 * 点赞与本地评论，持久化到 localStorage。
 * 首屏按"未点赞、无本地评论"渲染（与服务端一致），挂载后再读取存储，避免水合不一致。
 */
export function usePostReactions() {
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [comments, setComments] = useState<CommentMap>({});

  useEffect(() => {
    setLiked(new Set(read(LIKES_KEY, isStringArray, [])));
    setComments(read(COMMENTS_KEY, isCommentMap, {}));

    // 其他标签页改动时同步
    const onStorage = (e: StorageEvent) => {
      if (e.key === LIKES_KEY) setLiked(new Set(read(LIKES_KEY, isStringArray, [])));
      if (e.key === COMMENTS_KEY) setComments(read(COMMENTS_KEY, isCommentMap, {}));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      write(LIKES_KEY, [...next]);
      return next;
    });
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    const clean = text.trim().slice(0, COMMENT_MAX);
    if (!clean) return;
    setComments((prev) => {
      const next = { ...prev, [id]: [...(prev[id] ?? []), { text: clean, at: Date.now() }] };
      write(COMMENTS_KEY, next);
      return next;
    });
  }, []);

  return { liked, comments, toggleLike, addComment };
}
