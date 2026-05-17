"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { TableEmpty, TableError, TableLoading } from "@/components/table-state";
import {
  banAdminComment,
  getCommentPage,
  type AdminComment,
  type PageResult,
  unbanAdminComment,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatDateTime, formatNumber } from "@/lib/format";

const PAGE_SIZE = 20;

type CommentFilters = {
  id: string;
  postId: string;
  userUuid: string;
  content: string;
  status: string;
};

const emptyFilters: CommentFilters = {
  id: "",
  postId: "",
  userUuid: "",
  content: "",
  status: "",
};

function getCommentStatus(status?: number) {
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

function getActionButtonClasses(active: boolean, tone: "red" | "green") {
  if (!active) {
    return "h-8 rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-400";
  }

  if (tone === "red") {
    return "h-8 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100";
  }

  return "h-8 rounded-md border border-green-200 bg-green-50 px-3 text-xs font-medium text-green-700 transition hover:border-green-300 hover:bg-green-100";
}

function getCommentLabel(comment: AdminComment) {
  if (!comment.content) {
    return `#${comment.id}`;
  }

  return `#${comment.id} ${comment.content.slice(0, 16)}`;
}

export default function CommentsPage() {
  const [draftFilters, setDraftFilters] =
    useState<CommentFilters>(emptyFilters);
  const [filters, setFilters] = useState<CommentFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [queryVersion, setQueryVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionCommentId, setActionCommentId] = useState<number | null>(null);
  const [data, setData] = useState<PageResult<AdminComment>>({
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

      getCommentPage({
        current: page,
        size: PAGE_SIZE,
        id: filters.id,
        postId: filters.postId,
        userUuid: filters.userUuid,
        content: filters.content,
        status: filters.status,
      })
        .then((result) => {
          if (!ignore) {
            setData(result);
          }
        })
        .catch((requestError) => {
          if (!ignore) {
            setError(getErrorMessage(requestError, "评论列表加载失败"));
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
      id: draftFilters.id.trim(),
      postId: draftFilters.postId.trim(),
      userUuid: draftFilters.userUuid.trim(),
      content: draftFilters.content.trim(),
      status: draftFilters.status,
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

  async function handleCommentStatusAction(
    comment: AdminComment,
    action: "ban" | "unban",
  ) {
    setActionMessage("");
    setActionError("");
    setActionCommentId(comment.id);

    try {
      if (action === "ban") {
        await banAdminComment(comment.id);
        setActionMessage(`已封禁评论：${getCommentLabel(comment)}`);
      } else {
        await unbanAdminComment(comment.id);
        setActionMessage(`已解封评论：${getCommentLabel(comment)}`);
      }

      setQueryVersion((current) => current + 1);
    } catch (requestError) {
      setActionError(
        getErrorMessage(
          requestError,
          action === "ban" ? "封禁评论失败" : "解封评论失败",
        ),
      );
    } finally {
      setActionCommentId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">评论管理</h2>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[0.75fr_0.75fr_1.25fr_1.2fr_0.85fr_auto]">
          <label className="flex flex-col gap-2">
            <span className="block h-5 text-sm font-medium leading-5 text-slate-700">
              评论 ID
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={draftFilters.id}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  id: event.target.value,
                }))
              }
            />
          </label>
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
              评论者 UUID
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
              评论内容
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="歧路"
              value={draftFilters.content}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  content: event.target.value,
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
                <th className="whitespace-nowrap px-6 py-3">ID</th>
                <th className="min-w-72 px-6 py-3">评论内容</th>
                <th className="w-40 px-6 py-3">评论者</th>
                <th className="whitespace-nowrap px-6 py-3">帖子 ID</th>
                <th className="w-40 px-6 py-3">帖子作者</th>
                <th className="whitespace-nowrap px-6 py-3">状态</th>
                <th className="min-w-24 px-6 py-3">互动</th>
                <th className="px-6 py-3">创建时间</th>
                <th className="px-6 py-3">更新时间</th>
                <th className="whitespace-nowrap px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <TableLoading colSpan={10} /> : null}
              {!loading && error ? (
                <TableError colSpan={10} message={error} />
              ) : null}
              {!loading && !error && data.records.length === 0 ? (
                <TableEmpty colSpan={10} />
              ) : null}
              {!loading && !error
                ? data.records.map((comment) => {
                    const statusInfo = getCommentStatus(comment.status);
                    const canBan = comment.status === 1;
                    const canUnban = comment.status === 2;
                    const actionLoading = actionCommentId === comment.id;

                    return (
                      <tr className="hover:bg-slate-50" key={comment.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-slate-500">
                          ID {comment.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xl truncate font-medium text-slate-950">
                            {comment.content || "-"}
                          </div>
                        </td>
                        <td className="w-40 px-6 py-4 text-slate-600">
                          <div className="max-w-36 truncate">
                            {comment.userUuid || "-"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {comment.postId ?? "-"}
                        </td>
                        <td className="w-40 px-6 py-4 text-slate-600">
                          <div className="max-w-36 truncate">
                            {comment.postAuthorUuid || "-"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge tone={statusInfo.tone}>
                            {statusInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="min-w-24 px-6 py-4 text-slate-600">
                          <div className="space-y-1 text-sm text-slate-600">
                            <div>点赞 {formatNumber(comment.likeCount)}</div>
                            <div>回复 {formatNumber(comment.replyCount)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(comment.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(comment.updatedAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-nowrap justify-end gap-2">
                            <button
                              className={getActionButtonClasses(canBan, "red")}
                              disabled={!canBan || actionLoading}
                              type="button"
                              onClick={() =>
                                handleCommentStatusAction(comment, "ban")
                              }
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
                                handleCommentStatusAction(comment, "unban")
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
