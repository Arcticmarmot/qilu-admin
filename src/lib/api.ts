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
  nickname: string;
  email: string;
  status?: number;
  createdAt?: string;
  createAt?: string;
};

export type AdminUser = CurrentUser;

export type AdminPost = {
  id: number;
  userUuid?: string;
  nickname?: string;
  title?: string;
  content?: string;
  contentSnippet?: string;
  contentPreview?: string;
  visibility?: 1 | 2 | number;
  status?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  createAt?: string;
};

export type VoucherSeckill = {
  seckillId: number;
  voucherId: number;
  title: string;
  description?: string;
  totalStock: number;
  remainingStock: number;
  startTime?: string;
  endTime?: string;
  redeemDeadline?: string;
  status?: number;
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
  return request<CurrentUser>("/users/me");
}

export function getAdminUserPage(input: {
  current?: number;
  size?: number;
  keyword?: string;
  status?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminUser>>(
    `/admin/users${buildQuery({
      current: input.current ?? 1,
      size,
      keyword: input.keyword?.trim(),
      status: input.status,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function getPostPage(input: {
  current?: number;
  size?: number;
  keyword?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<AdminPost>>(
    `/posts${buildQuery({
      current: input.current ?? 1,
      size,
      keyword: input.keyword?.trim(),
    })}`,
  ).then((page) => normalizePageResult(page, size));
}

export function getVoucherSeckillPage(input: {
  current?: number;
  size?: number;
  status?: string;
}) {
  const size = input.size ?? 20;

  return request<MaybePageResult<VoucherSeckill>>(
    `/voucher-seckills${buildQuery({
      current: input.current ?? 1,
      size,
      status: input.status,
    })}`,
  ).then((page) => normalizePageResult(page, size));
}
