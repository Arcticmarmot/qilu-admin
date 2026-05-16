export function Pagination({
  current,
  size,
  total,
  loading,
  onChange,
}: {
  current: number;
  size: number;
  total: number;
  loading?: boolean;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div>
        共 <span className="font-medium text-slate-900">{total}</span> 条记录
      </div>
      <div className="flex items-center gap-2">
        <button
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          disabled={loading || current <= 1}
          type="button"
          onClick={() => onChange(current - 1)}
        >
          上一页
        </button>
        <span className="min-w-20 text-center text-slate-500">
          {current} / {totalPages}
        </span>
        <button
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          disabled={loading || current >= totalPages}
          type="button"
          onClick={() => onChange(current + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
