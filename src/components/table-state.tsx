export function TableLoading({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={colSpan}>
        加载中...
      </td>
    </tr>
  );
}

export function TableEmpty({
  colSpan,
  message = "暂无数据",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
}

export function TableError({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) {
  return (
    <tr>
      <td className="px-6 py-10 text-center text-sm text-red-600" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
}
