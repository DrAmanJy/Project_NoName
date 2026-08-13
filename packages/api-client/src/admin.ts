import type { ApiClient } from './client.js';
import type {
  EmployeeListResponse,
  UpdateEmployeeRequest,
  User,
} from '@repo/contracts';

export function createAdminApi(client: ApiClient) {
  return {
    employees: {
      list: (page = 1, limit = 10, isActive?: boolean, role?: string) => {
        const query = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (isActive !== undefined) query.append('isActive', String(isActive));
        if (role) query.append('role', role);
        return client.get<EmployeeListResponse>(`/admin/employees?${query}`);
      },
      update: (id: string, data: UpdateEmployeeRequest) => client.patch<User>(`/admin/employees/${id}`, data),
    }
  };
}

export type AdminApi = ReturnType<typeof createAdminApi>;
