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
  return request<CurrentUser>("/admin/auth/me");
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
    `/admin/posts${buildQuery({
      current: input.current ?? 1,
      size,
      keyword: input.keyword?.trim(),
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
