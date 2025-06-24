// app/admin/organizations/page.tsx
import { listOrganizations } from "@/actions/organization-actions";
import { OrganizationsListContent } from "@/components/admin/organization/organizations-list-content";

interface OrganizationsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    type?: string;
    status?: string;
  }>;
}

export default async function OrganizationsPage({
  searchParams,
}: OrganizationsPageProps) {
  const params = await searchParams;
  
  // Parse search parameters with defaults
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '10', 10);
  const searchQuery = params.search || '';
  const sortBy = params.sortBy || 'name';
  const sortDirection = (params.sortDirection || 'asc') as 'asc' | 'desc';
  
  // Build filters object
  const filters: Record<string, string> = {};
  if (params.type) filters.type = params.type;
  if (params.status) filters.status = params.status;

  // Fetch organizations data server-side
  const organizationsData = await listOrganizations({
    page,
    pageSize,
    searchQuery,
    sortBy,
    sortDirection,
    filters,
  });

  return (
    <div className="flex-1 space-y-4 p-4">
      <OrganizationsListContent 
        initialData={organizationsData}
        initialParams={{
          page,
          pageSize,
          searchQuery,
          sortBy,
          sortDirection,
          filters,
        }}
      />
    </div>
  );
}