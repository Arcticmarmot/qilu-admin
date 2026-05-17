"use client";

import { FormEvent, useState } from "react";
import { preheatVoucherSeckill } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

export default function PreheatVoucherSeckillPage() {
  const [seckillId, setSeckillId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await preheatVoucherSeckill(Number(seckillId));
      setMessage(`秒杀活动 #${seckillId} 库存预热成功`);
      setSeckillId("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "库存预热失败"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">库存预热</h2>
        <p className="mt-1 text-sm text-slate-500">按秒杀活动 ID 预热库存</p>
      </div>

      <form
        className="max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            秒杀活动 ID
          </span>
          <input
            className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            disabled={loading}
            min={1}
            type="number"
            value={seckillId}
            onChange={(event) => setSeckillId(event.target.value)}
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
            disabled={loading || !seckillId}
            type="submit"
          >
            {loading ? "预热中..." : "预热库存"}
          </button>
        </div>
      </form>
    </div>
  );
}
