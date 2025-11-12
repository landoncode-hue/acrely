import React from "react";
import { clsx } from "clsx";

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full border-collapse", className)}>{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>;
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({
  children,
  onClick,
}) => {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-gray-50"
      )}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <th
      className={clsx(
        "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <td className={clsx("px-6 py-4 text-sm text-gray-900", className)}>{children}</td>;
};
