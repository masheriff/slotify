// scripts/generate-list-page.ts - Template generator for new list pages
import fs from 'fs';
import path from 'path';

interface ListPageGeneratorConfig {
  moduleName: string; // e.g., 'patients', 'appointments'
  displayName: string; // e.g., 'Patients', 'Appointments'
  description: string;
  createRoute: string;
  defaultSort: string;
  defaultSortDirection: 'asc' | 'desc';
  filters: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'boolean';
    options?: Array<{ value: string; label: string }>;
  }>;
  columns: Array<{
    key: string;
    label: string;
    type: 'text' | 'date' | 'badge' | 'actions';
    sortable?: boolean;
  }>;
}

/**
 * Generate a complete list page implementation
 */
export function generateListPage(config: ListPageGeneratorConfig): {
  pageComponent: string;
  filterConfig: string;
  columnConfig: string;
  types: string;
  actions: string;
} {
  const {
    moduleName,
    displayName,
    description,
    createRoute,
    defaultSort,
    defaultSortDirection,
    filters,
    columns
  } = config;

  // Generate page component
  const pageComponent = `// app/admin/${moduleName}/page.tsx - Generated list page
import { Metadata } from "next";
import { 
  parseListParams, 
  fetchListData, 
  handleListPageRedirect,
  buildCanonicalListURL,
  logListPageMetrics,
  validateListPageAccess 
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { ${moduleName}Columns } from "@/components/table-configs/${moduleName}-columns";
import { ${moduleName}FilterConfig } from "@/components/admin/forms/${moduleName}-filters-config";
import { list${displayName} } from "@/actions/${moduleName}-actions";
import { ${displayName.slice(0, -1)}ListItem } from "@/lib/types/list-page";
import { getCurrentUser } from "@/lib/auth-server";

interface ${displayName}PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    ${filters.map(f => `${f.key}?: string;`).join('\n    ')}
  }>;
}

// Configuration for this list page
const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: '${defaultSort}',
  defaultSortDirection: '${defaultSortDirection}' as const,
  maxPageSize: 100,
  allowedSortColumns: [${columns.filter(c => c.sortable).map(c => `'${c.key}'`).join(', ')}],
  searchable: true,
  exportable: true,
};

// Generate metadata for SEO
export async function generateMetadata({ 
  searchParams 
}: ${displayName}PageProps): Promise<Metadata> {
  const params = await parseListParams(searchParams, LIST_CONFIG);
  
  let title = "${displayName}";
  let description = "${description}";
  
  if (params.searchQuery) {
    title = \`${displayName} - Search: "\${params.searchQuery}"\`;
    description = \`Search results for "\${params.searchQuery}" in ${moduleName}\`;
  }
  
  if (params.page > 1) {
    title += \` - Page \${params.page}\`;
  }

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ${displayName}Page({
  searchParams,
}: ${displayName}PageProps) {
  const startTime = Date.now();
  
  try {
    // Parse and validate parameters
    const params = await parseListParams(searchParams, LIST_CONFIG);
    
    // Check user permissions
    const user = await getCurrentUser();
    const accessCheck = await validateListPageAccess('${moduleName}', 'read', user);
    
    if (!accessCheck.success) {
      return (
        <ListPageWrapper 
          error={accessCheck.error || 'Access denied'}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: '${displayName}', current: true },
          ]}
        />
      );
    }

    // Fetch data
    const result = await fetchListData<${displayName.slice(0, -1)}ListItem>(
      list${displayName},
      params,
      { module: '${moduleName}', user }
    );

    // Handle fetch errors
    if (!result.success || !result.data) {
      return (
        <ListPageWrapper 
          error={result.error || 'Failed to load ${moduleName}'}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: '${displayName}', current: true },
          ]}
        />
      );
    }

    // Handle page redirects for invalid states
    handleListPageRedirect('/admin/${moduleName}', params, result.data.totalPages);

    // Transform data for table
    const tableData: ${displayName.slice(0, -1)}ListItem[] = result.data.data.map(item => ({
      // Transform your data here based on your schema
      ...item,
    }));

    // Log performance metrics
    const renderTime = Date.now() - startTime;
    logListPageMetrics('${moduleName}', params, result, renderTime);

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: '${displayName}', current: true },
        ]}
      >
        <div className="space-y-6">
          <FilterablePageHeader
            title="${displayName}"
            description="${description}"
            createButtonText="Add ${displayName.slice(0, -1)}"
            createHref="${createRoute}"
            filterConfig={${moduleName}FilterConfig}
            showExport={LIST_CONFIG.exportable}
          />

          <DataTable
            columns={${moduleName}Columns}
            data={tableData}
            pagination={{
              currentPage: result.data.page,
              pageSize: result.data.pageSize,
              totalPages: result.data.totalPages,
              hasNextPage: result.data.hasNextPage,
              hasPreviousPage: result.data.hasPreviousPage,
              totalCount: result.data.totalCount,
            }}
            sorting={{
              sortBy: params.sortBy,
              sortDirection: params.sortDirection,
            }}
            emptyMessage="No ${moduleName} found. Create your first ${moduleName.slice(0, -1)} to get started."
          />
        </div>
      </ListPageWrapper>
    );

  } catch (error) {
    console.error('❌ [${moduleName}] Page render error:', error);
    
    return (
      <ListPageWrapper 
        error={error instanceof Error ? error.message : 'An unexpected error occurred'}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: '${displayName}', current: true },
        ]}
      />
    );
  }
}`;

  // Generate filter configuration
  const filterConfig = `// components/admin/forms/${moduleName}-filters-config.ts
import { FilterConfig } from "@/lib/types/list-page"

export const ${moduleName}FilterConfig: FilterConfig[] = [
${filters.map(filter => `  {
    label: "${filter.label}",
    key: "${filter.key}",
    type: "${filter.type}",${filter.options ? `
    options: [
${filter.options.map(opt => `      { value: "${opt.value}", label: "${opt.label}" },`).join('\n')}
    ],` : ''}
  },`).join('\n')}
];`;

  // Generate column configuration
  const columnConfig = `// components/table-configs/${moduleName}-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Trash } from "lucide-react";
import { ${displayName.slice(0, -1)}ListItem } from "@/lib/types/list-page";
import { formatDate } from "@/lib/utils";

export const ${moduleName}Columns: ColumnDef<${displayName.slice(0, -1)}ListItem>[] = [
${columns.map(column => {
  switch (column.type) {
    case 'text':
      return `  {
    accessorKey: "${column.key}",
    header: "${column.label}",${column.sortable ? `
    enableSorting: true,` : ''}
  },`;
    case 'date':
      return `  {
    accessorKey: "${column.key}",
    header: "${column.label}",${column.sortable ? `
    enableSorting: true,` : ''}
    cell: ({ row }) => {
      const date = row.getValue("${column.key}") as Date | string;
      return date ? formatDate(date) : "-";
    },
  },`;
    case 'badge':
      return `  {
    accessorKey: "${column.key}",
    header: "${column.label}",${column.sortable ? `
    enableSorting: true,` : ''}
    cell: ({ row }) => {
      const value = row.getValue("${column.key}") as string;
      return (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      );
    },
  },`;
    case 'actions':
      return `  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = \`/admin/${moduleName}/\${item.id}\`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = \`/admin/${moduleName}/\${item.id}/edit\`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                if (confirm("Are you sure you want to delete this item?")) {
                  // Implement delete logic
                  console.log("Delete item:", item.id);
                }
              }}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },`;
    default:
      return `  {
    accessorKey: "${column.key}",
    header: "${column.label}",
  },`;
  }
}).join('\n')}
];`;

  // Generate TypeScript types
  const types = `// lib/types/${moduleName}.ts - Generated types
import { BaseListItem } from "@/lib/types/list-page";

export interface ${displayName.slice(0, -1)}ListItem extends BaseListItem {
${columns.map(column => {
  switch (column.type) {
    case 'date':
      return `  ${column.key}: Date | string;`;
    case 'badge':
      return `  ${column.key}: string;`;
    default:
      return `  ${column.key}: string;`;
  }
}).join('\n')}
}

export interface ${displayName.slice(0, -1)}FormData {
${columns.filter(c => c.type !== 'actions').map(column => `  ${column.key}: string;`).join('\n')}
}

export interface ${displayName.slice(0, -1)}Filters {
${filters.map(filter => `  ${filter.key}?: string;`).join('\n')}
}`;

  // Generate actions file
  const actions = `// actions/${moduleName}-actions.ts - Generated server actions
"use server";

import { requireOrgAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { ${moduleName} } from "@/db/schema";
import { eq, count, ilike, or, gte, sql, and } from "drizzle-orm";
import { ListParams } from "@/lib/list-page-server";

export type ${displayName}Response = {
  data: any[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;
};

export async function list${displayName}(
  params: ListParams
): Promise<${displayName}Response> {
  try {
    console.log("📋 Listing ${moduleName} with params:", params);

    // Add your permission check here
    // await requireOrgAdmin();

    const { page, pageSize, searchQuery, sortBy, sortDirection, filters } = params;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    if (searchQuery && searchQuery.trim()) {
      conditions.push(
        or(
          // Add your searchable columns here
          ilike(${moduleName}.name, \`%\${searchQuery.trim()}%\`),
          // ilike(${moduleName}.email, \`%\${searchQuery.trim()}%\`),
        )
      );
    }

    // Add filter conditions
    ${filters.map(filter => {
      switch (filter.type) {
        case 'select':
          return `if (filters?.${filter.key} && filters.${filter.key}.trim()) {
      conditions.push(eq(${moduleName}.${filter.key}, filters.${filter.key}.trim()));
    }`;
        case 'date':
          return `if (filters?.${filter.key} && filters.${filter.key}.trim()) {
      try {
        const filterDate = new Date(filters.${filter.key}.trim());
        if (!isNaN(filterDate.getTime())) {
          conditions.push(gte(${moduleName}.${filter.key}, filterDate));
        }
      } catch (error) {
        console.warn("Invalid ${filter.key} filter:", filters.${filter.key});
      }
    }`;
        default:
          return `if (filters?.${filter.key} && filters.${filter.key}.trim()) {
      conditions.push(ilike(${moduleName}.${filter.key}, \`%\${filters.${filter.key}.trim()}%\`));
    }`;
      }
    }).join('\n\n    ')}

    // Build final where condition
    let whereCondition;
    if (conditions.length > 0) {
      whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
    }

    // Get total count
    const totalCountResult = whereCondition
      ? await db
          .select({ count: count() })
          .from(${moduleName})
          .where(whereCondition)
      : await db.select({ count: count() }).from(${moduleName});

    const totalCount = totalCountResult[0]?.count || 0;

    // Determine sort order
    let orderByClause;
    if (sortBy === "${defaultSort}") {
      orderByClause = sortDirection === "desc"
        ? sql\`\${${moduleName}.${defaultSort}} DESC\`
        : ${moduleName}.${defaultSort};
    } else if (sortBy === "createdAt") {
      orderByClause = sortDirection === "desc"
        ? sql\`\${${moduleName}.createdAt} DESC\`
        : ${moduleName}.createdAt;
    } else {
      // Default sort
      orderByClause = sql\`\${${moduleName}.createdAt} DESC\`;
    }

    // Execute main query
    const data = whereCondition
      ? await db
          .select()
          .from(${moduleName})
          .where(whereCondition)
          .orderBy(orderByClause)
          .limit(pageSize)
          .offset(offset)
      : await db
          .select()
          .from(${moduleName})
          .orderBy(orderByClause)
          .limit(pageSize)
          .offset(offset);

    const totalPages = Math.ceil(totalCount / pageSize);

    console.log("✅ ${displayName} retrieved successfully, count:", data.length);

    return {
      data,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalCount,
    };
  } catch (error) {
    console.error("❌ Error listing ${moduleName}:", error);
    return {
      data: [],
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      totalCount: 0,
    };
  }
}

export async function get${displayName.slice(0, -1)}ById(id: string) {
  try {
    console.log("🔍 Getting ${moduleName.slice(0, -1)} by ID:", id);

    // Add your permission check here
    // await requireOrgAdmin();

    const item = await db
      .select()
      .from(${moduleName})
      .where(eq(${moduleName}.id, id))
      .limit(1);

    if (!item || item.length === 0) {
      return {
        success: false,
        error: "${displayName.slice(0, -1)} not found",
        data: null,
      };
    }

    console.log("✅ ${displayName.slice(0, -1)} found:", item[0].id);

    return {
      success: true,
      data: item[0],
    };
  } catch (error) {
    console.error("❌ Error getting ${moduleName.slice(0, -1)}:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get ${moduleName.slice(0, -1)}",
      data: null,
    };
  }
}

// Add more CRUD operations as needed
export async function create${displayName.slice(0, -1)}(data: any) {
  // Implementation for create
}

export async function update${displayName.slice(0, -1)}(id: string, data: any) {
  // Implementation for update
}

export async function delete${displayName.slice(0, -1)}(id: string) {
  // Implementation for delete
}`;

  return {
    pageComponent,
    filterConfig,
    columnConfig,
    types,
    actions,
  };
}

/**
 * Write generated files to disk
 */
export function writeListPageFiles(
  config: ListPageGeneratorConfig,
  outputDir: string = process.cwd()
) {
  const generated = generateListPage(config);
  const { moduleName } = config;

  // Ensure directories exist
  const dirs = [
    `${outputDir}/app/admin/${moduleName}`,
    `${outputDir}/components/admin/forms`,
    `${outputDir}/components/table-configs`,
    `${outputDir}/lib/types`,
    `${outputDir}/actions`,
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Write files
  const files = [
    {
      path: `${outputDir}/app/admin/${moduleName}/page.tsx`,
      content: generated.pageComponent,
    },
    {
      path: `${outputDir}/components/admin/forms/${moduleName}-filters-config.ts`,
      content: generated.filterConfig,
    },
    {
      path: `${outputDir}/components/table-configs/${moduleName}-columns.tsx`,
      content: generated.columnConfig,
    },
    {
      path: `${outputDir}/lib/types/${moduleName}.ts`,
      content: generated.types,
    },
    {
      path: `${outputDir}/actions/${moduleName}-actions.ts`,
      content: generated.actions,
    },
  ];

  files.forEach(file => {
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ Generated: ${file.path}`);
  });

  console.log(`🎉 Successfully generated ${config.displayName} list page!`);
}

// Example usage configurations
export const exampleConfigs: Record<string, ListPageGeneratorConfig> = {
  patients: {
    moduleName: 'patients',
    displayName: 'Patients',
    description: 'Manage patient records and information',
    createRoute: '/admin/patients/create',
    defaultSort: 'lastName',
    defaultSortDirection: 'asc',
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'select',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ],
      },
      {
        key: 'createdAfter',
        label: 'Created After',
        type: 'date',
      },
    ],
    columns: [
      { key: 'firstName', label: 'First Name', type: 'text', sortable: true },
      { key: 'lastName', label: 'Last Name', type: 'text', sortable: true },
      { key: 'email', label: 'Email', type: 'text', sortable: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', sortable: true },
      { key: 'status', label: 'Status', type: 'badge', sortable: true },
      { key: 'actions', label: 'Actions', type: 'actions' },
    ],
  },
  appointments: {
    moduleName: 'appointments',
    displayName: 'Appointments',
    description: 'Manage patient appointments and scheduling',
    createRoute: '/admin/appointments/create',
    defaultSort: 'scheduledAt',
    defaultSortDirection: 'desc',
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
      },
      {
        key: 'procedureType',
        label: 'Procedure Type',
        type: 'select',
        options: [
          { value: 'holter', label: 'Holter Monitor' },
          { value: 'stress', label: 'Stress Test' },
          { value: 'echo', label: 'Echocardiogram' },
        ],
      },
      {
        key: 'scheduledAfter',
        label: 'Scheduled After',
        type: 'date',
      },
    ],
    columns: [
      { key: 'patientName', label: 'Patient', type: 'text', sortable: true },
      { key: 'procedureType', label: 'Procedure', type: 'text', sortable: true },
      { key: 'scheduledAt', label: 'Scheduled', type: 'date', sortable: true },
      { key: 'status', label: 'Status', type: 'badge', sortable: true },
      { key: 'technicianName', label: 'Technician', type: 'text' },
      { key: 'actions', label: 'Actions', type: 'actions' },
    ],
  },
};

// CLI usage example
if (require.main === module) {
  const configName = process.argv[2];
  
  if (!configName || !exampleConfigs[configName]) {
    console.log('Usage: npm run generate-list-page <config-name>');
    console.log('Available configs:', Object.keys(exampleConfigs).join(', '));
    process.exit(1);
  }
  
  writeListPageFiles(exampleConfigs[configName]);
}