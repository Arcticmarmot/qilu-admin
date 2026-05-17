import { request } from "@/lib/http";

export type PageResult<T> = {
  current: number;
  size: number;
  total: number;
  records: T[];
};

type MaybePageResult<T> = PageResult<T> | T[];

export type LoginResponse = {
  token: string;
  uuid: string;
  username: string;
  role: string;
};

export type CurrentUser = {
  uuid: string;
  nickname?: string;
  username?: string;
  email?: string;
  role?: string;
  status?: number;
  createdAt?: string;
  createAt?: string;
};

export type AdminUser = CurrentUser;

export type AdminUserPageItem = {
  id?: number;
  uuid: string;
  nickname?: string;
  email?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPost = {
  id: number;
  parentId?: number;
  rootId?: number;
  branchPrompt?: string;
  userUuid?: string;
  title?: string;
  contentSnippet?: string;
  visibility?: 1 | 2 | number;
  status?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type AdminComment = {
  id: number;
  postId?: number;
  postAuthorUuid?: string;
  userUuid?: string;
  content?: string;
  likeCount?: number;
  replyCount?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminReply = {
  id: number;
  postId?: number;
  rootCommentId?: number;
  parentReplyId?: number;
  userUuid?: string;
  targetUserUuid?: string;
  content?: string;
  likeCount?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminLike = {
  id: number;
  creationType?: "POST" | "COMMENT" | "REPLY" | string;
  creationId?: number;
  userUuid?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type VoucherCreateInput = {
  title: string;
  description?: string;
};

export type VoucherSeckillCreateInput = {
  voucherId: number;
  totalStock: number;
  startTime: string;
  endTime: string;
  redeemDeadline: string;
};

type QueryValue = string | number | undefined | null;

function buildQuery(input: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
}

function normalizePageResult<T>(value: MaybePageResult<T>, size: number) {
  if (Array.isArray(value)) {
    return {
      current: 1,
      size: value.length,
      total: value.length,
      records: value,
    } satisfies PageResult<T>;
  }

  return {
    current: Number(value.current ?? 1),
    size: Number(value.size ?? size),
    total: Number(value.total ?? value.records.length),
    records: value.records,
  } satisfies PageResult<T>;
}

export function login(input: { username: string; password: string }) {
  return request<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function getCurrentUser() {
  return request<CurrentUser>("/admin/operators/me");
}

export function getAdminUserPage(input: {
  current?: number;
  size?: number;
  uuid?: string;
  nickname?: string;
  email?: string;
  status?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminUserPageItem>>(
    `/admin/users${buildQuery({
      current: input.current ?? 1,
      size,
      uuid: input.uuid?.trim(),
      nickname: input.nickname?.trim(),
      email: input.email?.trim(),
      status: input.status,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function banAdminUser(userUuid: string) {
  return request<void>(`/admin/users/${userUuid}/ban`, {
    method: "PATCH",
  });
}

export function unbanAdminUser(userUuid: string) {
  return request<void>(`/admin/users/${userUuid}/unban`, {
    method: "PATCH",
  });
}

export function getPostPage(input: {
  current?: number;
  size?: number;
  postId?: string;
  rootId?: string;
  userUuid?: string;
  title?: string;
  status?: string;
  visibility?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminPost>>(
    `/admin/posts${buildQuery({
      current: input.current ?? 1,
      size,
      postId: input.postId?.trim(),
      rootId: input.rootId?.trim(),
      userUuid: input.userUuid?.trim(),
      title: input.title?.trim(),
      status: input.status,
      visibility: input.visibility,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function banAdminPost(postId: number) {
  return request<void>(`/admin/posts/${postId}/ban`, {
    method: "PATCH",
  });
}

export function unbanAdminPost(postId: number) {
  return request<void>(`/admin/posts/${postId}/unban`, {
    method: "PATCH",
  });
}

export function getCommentPage(input: {
  current?: number;
  size?: number;
  id?: string;
  postId?: string;
  userUuid?: string;
  content?: string;
  status?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminComment>>(
    `/admin/comments${buildQuery({
      current: input.current ?? 1,
      size,
      id: input.id?.trim(),
      postId: input.postId?.trim(),
      userUuid: input.userUuid?.trim(),
      content: input.content?.trim(),
      status: input.status,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function banAdminComment(commentId: number) {
  return request<void>(`/admin/comments/${commentId}/ban`, {
    method: "PATCH",
  });
}

export function unbanAdminComment(commentId: number) {
  return request<void>(`/admin/comments/${commentId}/unban`, {
    method: "PATCH",
  });
}

export function getReplyPage(input: {
  current?: number;
  size?: number;
  id?: string;
  postId?: string;
  rootCommentId?: string;
  parentReplyId?: string;
  userUuid?: string;
  targetUserUuid?: string;
  content?: string;
  status?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminReply>>(
    `/admin/replies${buildQuery({
      current: input.current ?? 1,
      size,
      id: input.id?.trim(),
      postId: input.postId?.trim(),
      rootCommentId: input.rootCommentId?.trim(),
      parentReplyId: input.parentReplyId?.trim(),
      userUuid: input.userUuid?.trim(),
      targetUserUuid: input.targetUserUuid?.trim(),
      content: input.content?.trim(),
      status: input.status,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function banAdminReply(replyId: number) {
  return request<void>(`/admin/replies/${replyId}/ban`, {
    method: "PATCH",
  });
}

export function unbanAdminReply(replyId: number) {
  return request<void>(`/admin/replies/${replyId}/unban`, {
    method: "PATCH",
  });
}

export function getLikePage(input: {
  current?: number;
  size?: number;
  likeId?: string;
  creationType?: string;
  creationId?: string;
  userUuid?: string;
  status?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminLike>>(
    `/admin/likes${buildQuery({
      current: input.current ?? 1,
      size,
      likeId: input.likeId?.trim(),
      creationType: input.creationType,
      creationId: input.creationId?.trim(),
      userUuid: input.userUuid?.trim(),
      status: input.status,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function createVoucher(input: VoucherCreateInput) {
  return request<number>("/admin/vouchers", {
    method: "POST",
    body: {
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
    },
  });
}

export function createVoucherSeckill(input: VoucherSeckillCreateInput) {
  return request<number>("/admin/voucher-seckills", {
    method: "POST",
    body: input,
  });
}

export function preheatVoucherSeckill(seckillId: number) {
  return request<void>(`/admin/voucher-seckills/${seckillId}/preheat`, {
    method: "POST",
  });
}

export function redeemVoucherOrder(redeemCode: string) {
  return request<void>("/admin/voucher-orders/redeem", {
    method: "PATCH",
    body: {
      redeemCode: redeemCode.trim(),
    },
  });
}
