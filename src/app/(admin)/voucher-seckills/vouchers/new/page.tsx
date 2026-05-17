"use client";

import { FormEvent, useState } from "react";
import { createVoucher } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

export default function CreateVoucherPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const voucherId = await createVoucher({ title, description });
      setMessage(`优惠券创建成功，ID：${voucherId}`);
      setTitle("");
      setDescription("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "优惠券创建失败"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">创建优惠券</h2>
        <p className="mt-1 text-sm text-slate-500">兑换券标题与描述</p>
      </div>

      <form
        className="max-w-3xl space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            优惠券标题
          </span>
          <input
            className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            disabled={loading}
            maxLength={128}
            placeholder="登山杖兑换券"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            优惠券描述
          </span>
          <textarea
            className="min-h-28 w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            disabled={loading}
            maxLength={512}
            placeholder="凭兑换码可到线下门店兑换一次优惠资格"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        {message ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
            disabled={loading || !title.trim()}
            type="submit"
          >
            {loading ? "创建中..." : "创建优惠券"}
          </button>
        </div>
      </form>
    </div>
  );
}
