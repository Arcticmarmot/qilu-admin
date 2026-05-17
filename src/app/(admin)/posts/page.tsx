"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { TableEmpty, TableError, TableLoading } from "@/components/table-state";
import {
  banAdminPost,
  getPostPage,
  type AdminPost,
  type PageResult,
  unbanAdminPost,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime, formatNumber } from "@/lib/format";

const PAGE_SIZE = 20;

type PostFilters = {
  postId: string;
  rootId: string;
  userUuid: string;
  title: string;
  status: string;
  visibility: string;
};

const emptyFilters: PostFilters = {
  postId: "",
  rootId: "",
  userUuid: "",
  title: "",
  status: "",
  visibility: "",
};

function getPostStatus(status?: number) {
  if (status === 1) {
    return { label: "正常", tone: "green" as const };
  }

  if (status === 2) {
    return { label: "已封禁", tone: "red" as const };
  }

  if (status === 0) {
    return { label: "已删除", tone: "slate" as const };
  }

  return { label: "未知", tone: "slate" as const };
}

function getVisibility(visibility?: number) {
  if (visibility === 1) {
    return { label: "公开", tone: "teal" as const };
  }

  if (visibility === 2) {
    return { label: "仅自己", tone: "amber" as const };
  }

  return { label: "未知", tone: "slate" as const };
}

function getPostType(parentId?: number | null) {
  return parentId === null || parentId === undefined ? "根帖子" : "分支帖子";
}

function getActionButtonClasses(active: boolean, tone: "red" | "green") {
  if (!active) {
    return "h-8 rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-400";
  }

  if (tone === "red") {
    return "h-8 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100";
  }

  return "h-8 rounded-md border border-green-200 bg-green-50 px-3 text-xs font-medium text-green-700 transition hover:border-green-300 hover:bg-green-100";
}

export default function PostsPage() {
  const [draftFilters, setDraftFilters] = useState<PostFilters>(emptyFilters);
  const [filters, setFilters] = useState<PostFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [queryVersion, setQueryVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionPostId, setActionPostId] = useState<number | null>(null);
  const [data, setData] = useState<PageResult<AdminPost>>({
    current: 1,
    size: PAGE_SIZE,
    total: 0,
    records: [],
  });

  useEffect(() => {
    let ignore = false;

    const timeoutId = window.setTimeout(() => {
      if (ignore) {
        return;
      }

      setLoading(true);
      setError("");

      getPostPage({
        current: page,
        size: PAGE_SIZE,
        postId: filters.postId,
        rootId: filters.rootId,
        userUuid: filters.userUuid,
        title: filters.title,
        status: filters.status,
        visibility: filters.visibility,
      })
        .then((result) => {
          if (!ignore) {
            setData(result);
          }
        })
        .catch((requestError) => {
          if (!ignore) {
            setError(getErrorMessage(requestError, "帖子列表加载失败"));
            setData({
              current: page,
              size: PAGE_SIZE,
              total: 0,
              records: [],
            });
          }
        })
        .finally(() => {
          if (!ignore) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [filters, page, queryVersion]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");
    setActionError("");
    setPage(1);
    setFilters({
      postId: draftFilters.postId.trim(),
      rootId: draftFilters.rootId.trim(),
      userUuid: draftFilters.userUuid.trim(),
      title: draftFilters.title.trim(),
      status: draftFilters.status,
      visibility: draftFilters.visibility,
    });
    setQueryVersion((current) => current + 1);
  }

  function handleReset() {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
    setActionMessage("");
    setActionError("");
    setQueryVersion((current) => current + 1);
  }

  async function handlePostStatusAction(post: AdminPost, action: "ban" | "unban") {
    setActionMessage("");
    setActionError("");
    setActionPostId(post.id);

    try {
      if (action === "ban") {
        await banAdminPost(post.id);
        setActionMessage(`已封禁帖子：${post.title || `#${post.id}`}`);
      } else {
        await unbanAdminPost(post.id);
        setActionMessage(`已解封帖子：${post.title || `#${post.id}`}`);
      }

      setQueryVersion((current) => current + 1);
    } catch (requestError) {
      setActionError(
        getErrorMessage(
          requestError,
          action === "ban" ? "封禁帖子失败" : "解封帖子失败",
        ),
      );
    } finally {
      setActionPostId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">帖子管理</h2>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[0.8fr_0.8fr_1.25fr_1fr_0.8fr_0.8fr_auto]">
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              帖子 ID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.postId}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  postId: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              根帖子 ID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.rootId}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  rootId: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              作者 UUID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="5ee308..."
              value={draftFilters.userUuid}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  userUuid: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              标题
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="歧路"
              value={draftFilters.title}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              状态
            </span>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="">全部</option>
              <option value="1">正常</option>
              <option value="2">封禁</option>
              <option value="0">删除</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              可见性
            </span>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.visibility}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  visibility: event.target.value,
                }))
              }
            >
              <option value="">全部</option>
              <option value="1">公开</option>
              <option value="2">仅自己</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              className="h-10 w-20 rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:bg-teal-200 disabled:text-teal-600"
              disabled={loading}
              type="submit"
            >
              查询
            </button>
            <button
              className="h-10 w-20 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              disabled={loading}
              type="button"
              onClick={handleReset}
            >
              重置
            </button>
          </div>
        </div>
      </form>

      {actionMessage ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700">
          {actionMessage}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="min-w-32 px-6 py-3">ID</th>
                <th className="px-6 py-3">帖子</th>
                <th className="min-w-24 px-6 py-3">类型</th>
                <th className="w-32 px-6 py-3">作者</th>
                <th className="w-40 px-6 py-3">分支对话</th>
                <th className="whitespace-nowrap px-6 py-3">状态</th>
                <th className="whitespace-nowrap px-6 py-3">可见性</th>
                <th className="min-w-24 px-6 py-3">互动</th>
                <th className="px-6 py-3">创建时间</th>
                <th className="px-6 py-3">更新时间</th>
                <th className="whitespace-nowrap px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <TableLoading colSpan={11} /> : null}
              {!loading && error ? (
                <TableError colSpan={11} message={error} />
              ) : null}
              {!loading && !error && data.records.length === 0 ? (
                <TableEmpty colSpan={11} />
              ) : null}
              {!loading && !error
                ? data.records.map((post) => {
                    const statusInfo = getPostStatus(post.status);
                    const visibilityInfo = getVisibility(post.visibility);
                    const canBan = post.status === 1;
                    const canUnban = post.status === 2;
                    const actionLoading = actionPostId === post.id;

                    return (
                      <tr className="hover:bg-slate-50" key={post.id}>
                        <td className="min-w-32 px-6 py-4 text-xs font-medium leading-5 text-slate-500">
                          <div>ID {post.id}</div>
                          <div>PARENT {post.parentId ?? "-"}</div>
                          <div>ROOT {post.rootId ?? "-"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-950">
                            {post.title || `帖子 #${post.id}`}
                          </div>
                          <div className="mt-1 max-w-xl truncate text-xs text-slate-500">
                            {post.contentSnippet || "-"}
                          </div>
                        </td>
                        <td className="min-w-24 px-6 py-4 text-slate-600">
                          {getPostType(post.parentId)}
                        </td>
                        <td className="w-32 px-6 py-4 text-slate-600">
                          <div className="max-w-28 truncate">
                            {post.userUuid || "-"}
                          </div>
                        </td>
                        <td className="w-40 px-6 py-4 text-slate-600">
                          <div className="max-w-36 truncate">
                            {post.branchPrompt || "-"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge tone={statusInfo.tone}>
                            {statusInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge tone={visibilityInfo.tone}>
                            {visibilityInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="min-w-24 px-6 py-4 text-slate-600">
                          <div className="space-y-1 text-sm text-slate-600">
                            <div>点赞 {formatNumber(post.likeCount)}</div>
                            <div>评论 {formatNumber(post.commentCount)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(post.updatedAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-nowrap justify-end gap-2">
                            <button
                              className={getActionButtonClasses(canBan, "red")}
                              disabled={!canBan || actionLoading}
                              type="button"
                              onClick={() => handlePostStatusAction(post, "ban")}
                            >
                              封禁
                            </button>
                            <button
                              className={getActionButtonClasses(
                                canUnban,
                                "green",
                              )}
                              disabled={!canUnban || actionLoading}
                              type="button"
                              onClick={() =>
                                handlePostStatusAction(post, "unban")
                              }
                            >
                              解封
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
        <Pagination
          current={page}
          loading={loading}
          size={PAGE_SIZE}
          total={data.total}
          onChange={setPage}
        />
      </section>
    </div>
  );
}
