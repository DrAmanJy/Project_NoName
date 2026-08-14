'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Shield,
  Search,
  Edit2,
  RefreshCw,
  Loader2,
  X,
  Check,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import type { User, Role } from '@repo/contracts';

interface ExtendedUser extends User {
  avatarUrl?: string;
}

export function EmployeeManagementConsole() {
  const [employees, setEmployees] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [editingEmployee, setEditingEmployee] = useState<ExtendedUser | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: Role;
    avatarUrl: string;
  }>({
    name: '',
    email: '',
    role: 'user',
    avatarUrl: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.employees.list(1, 50);
      if (res && res.users) {
        setEmployees(res.users);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (emp.name?.toLowerCase() || '').includes(searchQuery.toLowerCase().trim()) ||
        (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      return matchesSearch;
    });
  }, [employees, searchQuery]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = employees.length;
    const admins = employees.filter((e) => e.role === 'admin').length;
    const staff = employees.filter((e) => e.role === 'employee').length;

    return { total, admins, staff };
  }, [employees]);



  // Handlers for Edit
  const handleOpenEditModal = (employee: ExtendedUser) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      role: employee.role,
      avatarUrl: employee.avatarUrl || '',
    });
    setFormError(null);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const updatedRes = await adminApi.employees.update(editingEmployee.id, {
        role: formData.role,
      });

      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === editingEmployee.id) {
            return {
              ...emp,
              ...updatedRes,
              avatarUrl: formData.avatarUrl.trim() || emp.avatarUrl,
            };
          }
          return emp;
        })
      );

      setEditingEmployee(null);
    } catch (err: unknown) {
      console.error(err);
      setFormError('Failed to update employee details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Employee Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage team members, assign administrative roles, update profiles, and grant or revoke platform access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchEmployees()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Roster</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Roster
            </span>
            <div className="rounded-2xl bg-zinc-200 dark:bg-zinc-800 p-2 text-zinc-700 dark:text-zinc-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">{metrics.total}</p>
          <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Team members registered</span>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Administrators
            </span>
            <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-500">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">{metrics.admins}</p>
          <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Full system access</span>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-5 backdrop-blur-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Review Staff
            </span>
            <div className="rounded-2xl bg-purple-500/10 p-2 text-purple-500">
              <UserIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">{metrics.staff}</p>
          <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Moderation team members</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950 p-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search employee by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Employee Roster Table / Card Grid */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <span className="text-xs font-semibold text-zinc-500">Loading employee directory...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-zinc-400 mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No employees found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Try adjusting your search criteria or add a new team member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-medium">
                {filteredEmployees.map((emp) => {
                  const avatarSrc =
                    emp.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name || 'User')}`;
                  const formattedDate = new Date(emp.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                            <img
                              src={avatarSrc}
                              alt={emp.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name || 'User')}`;
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {emp.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                        {emp.email || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        {emp.role === 'admin' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Shield className="h-3 w-3" />
                            Administrator
                          </span>
                        )}

                        {emp.role === 'employee' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <UserIcon className="h-3 w-3" />
                            Employee
                          </span>
                        )}


                        {emp.role === 'user' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <UserIcon className="h-3 w-3" />
                            User
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formattedDate}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(emp)}
                            className="rounded-xl p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            title="Edit Details & Avatar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-purple-500/10 p-2 text-purple-500">
                  <Edit2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Edit Employee Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-600 border border-red-200 dark:border-red-900/50">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled
                  value={formData.name}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none opacity-75 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address <span className="text-[10px] font-normal text-zinc-400 font-sans">(Read-only)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none opacity-75 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Role Designation
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex w-full items-center justify-between gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FEFEFE] dark:bg-zinc-950 px-3.5 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-zinc-400" />
                      <span>
                        {formData.role === 'employee' ? 'Employee (Read, Update & Review Submissions)' : 
                         formData.role === 'admin' ? 'Admin (Administrator)' : 
                         'User (Standard Account)'}
                      </span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRoleDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsRoleDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                        {[
                          { id: 'employee', label: 'Employee (Read, Update & Review Submissions)' },
                          { id: 'admin', label: 'Admin (Administrator)' },
                          { id: 'user', label: 'User (Standard Account)' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, role: option.id as Role });
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                              formData.role === option.id
                                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>





              <div className="pt-2 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
