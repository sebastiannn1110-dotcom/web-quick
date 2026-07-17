export function AdminTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: unknown[];
}) {
  const normalizedRows = rows as Array<Record<string, unknown>>;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {column.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {normalizedRows.map((row, index) => (
            <tr key={String(row.id || index)} className="align-top">
              {columns.map((column) => (
                <td key={column} className="max-w-[260px] truncate px-4 py-3 text-slate-700">
                  {row[column] === null || row[column] === undefined ? "-" : String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
