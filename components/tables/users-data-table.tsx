// components/tables/users-data-table.tsx - CLIENT WRAPPER COMPONENT
"use client";

import { DataTable } from "@/components/common/data-table";
import { createUserColumns } from "@/components/table-configs/user-columns";
import { type UserListItem } from "@/types/users.types";
import { type PaginationData, type SortingData } from "@/types/component.types";

interface UsersDataTableProps {
  data: UserListItem[];
  pagination: PaginationData;
  sorting?: SortingData;
  emptyMessage?: string;
  selectable?: boolean;
  currentUser: {
    role: string;
    organizationSlug?: string;
  };
}

export function UsersDataTable({
  data,
  pagination,
  sorting,
  emptyMessage = "No users found.",
  selectable = false,
  currentUser,
}: UsersDataTableProps) {
  // Create columns with current user context on the client side
  const userColumns = createUserColumns({
    role: currentUser.role,
    organizationSlug: currentUser.organizationSlug,
  });

  return (
    <DataTable
      columns={userColumns}
      data={data}
      pagination={pagination}
      sorting={sorting}
      emptyMessage={emptyMessage}
      selectable={selectable}
    />
  );
}