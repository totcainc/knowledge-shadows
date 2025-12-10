import { ReactNode } from "react";

export interface TableColumn<T> {
  /** Column key matching data object key */
  key: string;
  /** Column header */
  header: ReactNode;
  /** Custom cell renderer */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** Column width */
  width?: string | number;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Sortable column */
  sortable?: boolean;
}

export interface TableProps<T extends Record<string, unknown>> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Data rows */
  data: T[];
  /** Row key field */
  rowKey?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Bordered style */
  bordered?: boolean;
  /** Compact size */
  size?: "sm" | "md" | "lg";
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Table component for displaying tabular data
 */
export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  loading = false,
  emptyMessage = "No data available",
  striped = false,
  hoverable = true,
  bordered = false,
  size = "md",
  onRowClick,
  className = "",
}: TableProps<T>) {
  const sizes = {
    sm: { cell: "px-3 py-2 text-sm", header: "px-3 py-2 text-xs" },
    md: { cell: "px-4 py-3 text-sm", header: "px-4 py-3 text-xs" },
    lg: { cell: "px-6 py-4 text-base", header: "px-6 py-4 text-sm" },
  };

  const getAlignment = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`w-full ${bordered ? "border border-gray-200" : ""}`}
      >
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`
                  ${sizes[size].header}
                  font-semibold text-gray-700 uppercase tracking-wider
                  ${getAlignment(column.align)}
                  ${bordered ? "border-x border-gray-200 first:border-l-0 last:border-r-0" : ""}
                `}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={String(row[rowKey]) || rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={`
                  border-b border-gray-200 last:border-b-0
                  ${striped && rowIndex % 2 === 1 ? "bg-gray-50" : "bg-white"}
                  ${hoverable ? "hover:bg-edubites-background/50" : ""}
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      ${sizes[size].cell}
                      text-gray-900
                      ${getAlignment(column.align)}
                      ${bordered ? "border-x border-gray-200 first:border-l-0 last:border-r-0" : ""}
                    `}
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = "Table";
