<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('group_name', 'like', "%{$search}%");
            });
        }

        // Filter by group
        if ($request->filled('group')) {
            $query->where('group_name', $request->get('group'));
        }

        // Filter by system permissions
        if ($request->filled('show_system') && !$request->boolean('show_system')) {
            $query->where('is_system', false);
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');

        if (in_array($sortField, ['name', 'display_name', 'group_name', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        $permissions = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_permissions' => Permission::count(),
            'total_groups' => Permission::distinct('group_name')->count('group_name'),
            'roles_using' => Role::whereHas('permissions')->count(),
            'direct_users' => DB::table('model_has_permissions')
                ->where('model_type', 'App\\Models\\User')
                ->distinct('model_id')
                ->count(),
        ];

        // Get available groups
        $groups = Permission::distinct('group_name')
            ->whereNotNull('group_name')
            ->orderBy('group_name')
            ->pluck('group_name');

        return Inertia::render('Admin/Permissions/Permissions', [
            'permissions' => PermissionResource::collection($permissions),
            'stats' => $stats,
            'groups' => $groups,
            'filters' => $request->only(['search', 'group', 'show_system', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $groups = Permission::distinct('group_name')
            ->whereNotNull('group_name')
            ->orderBy('group_name')
            ->pluck('group_name');

        $guards = config('auth.guards', []);

        return Inertia::render('Admin/Permissions/Permission', [
            'permission' => null,
            'groups' => $groups,
            'guards' => array_keys($guards),
            'stats' => [
                'total_permissions' => Permission::count(),
                'total_groups' => Permission::distinct('group_name')->count('group_name'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'group_name' => 'nullable|string|max:255',
            'guard_name' => 'nullable|string|max:255',
            'is_system' => 'boolean',
        ]);

        // Normalize permission name
        $validated['name'] = Str::lower(trim($validated['name']));
        $validated['guard_name'] = $validated['guard_name'] ?? 'web';

        // Auto-generate display name if not provided
        if (empty($validated['display_name'])) {
            $validated['display_name'] = Str::title(str_replace(['_', '-'], ' ', $validated['name']));
        }

        $permission = Permission::create($validated);

        return redirect()->route('admin.permissions.index')
            ->with('success', "Permission '{$permission->display_name}' berhasil dibuat.");
    }

    public function edit($id)
    {
        $permission = Permission::findOrFail($id);

        $groups = Permission::distinct('group_name')
            ->whereNotNull('group_name')
            ->orderBy('group_name')
            ->pluck('group_name');

        $guards = config('auth.guards', []);

        // Get related roles
        $relatedRoles = $permission->roles()
            ->select('id', 'name', 'display_name')
            ->get();

        // Get direct users
        $directUsers = $permission->users()
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('Admin/Permissions/Permission', [
            'permission' => new PermissionResource($permission),
            'groups' => $groups,
            'guards' => array_keys($guards),
            'relatedRoles' => $relatedRoles,
            'directUsers' => $directUsers,
            'stats' => [
                'total_permissions' => Permission::count(),
                'total_groups' => Permission::distinct('group_name')->count('group_name'),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);

        // Prevent editing system permissions
        if ($permission->is_system) {
            return redirect()->back()
                ->with('error', 'Permission sistem tidak dapat diubah.');
        }

        $validated = $request->validate([
            'name' => "required|string|max:255|unique:permissions,name,{$permission->id}",
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'group_name' => 'nullable|string|max:255',
            'guard_name' => 'nullable|string|max:255',
        ]);

        // Normalize permission name
        $validated['name'] = Str::lower(trim($validated['name']));
        $validated['guard_name'] = $validated['guard_name'] ?? 'web';

        // Auto-generate display name if not provided
        if (empty($validated['display_name'])) {
            $validated['display_name'] = Str::title(str_replace(['_', '-'], ' ', $validated['name']));
        }

        $permission->update($validated);

        return redirect()->route('admin.permissions.index')
            ->with('success', "Permission '{$permission->display_name}' berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $permission = Permission::findOrFail($id);

        // Prevent deleting system permissions
        if ($permission->is_system) {
            return redirect()->back()
                ->with('error', 'Permission sistem tidak dapat dihapus.');
        }

        // Check if permission is being used
        $rolesCount = $permission->roles()->count();
        $usersCount = $permission->users()->count();

        if ($rolesCount > 0 || $usersCount > 0) {
            return redirect()->back()
                ->with('error', "Permission '{$permission->display_name}' tidak dapat dihapus karena masih digunakan oleh {$rolesCount} role dan {$usersCount} user.");
        }

        $permission->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', "Permission '{$permission->display_name}' berhasil dihapus.");
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $permissions = Permission::whereIn('id', $validated['permission_ids'])
            ->where('is_system', false)
            ->get();

        $deletedCount = 0;
        $errors = [];

        foreach ($permissions as $permission) {
            $rolesCount = $permission->roles()->count();
            $usersCount = $permission->users()->count();

            if ($rolesCount > 0 || $usersCount > 0) {
                $errors[] = "Permission '{$permission->display_name}' masih digunakan oleh {$rolesCount} role dan {$usersCount} user.";
                continue;
            }

            $permission->delete();
            $deletedCount++;
        }

        $message = "{$deletedCount} permission berhasil dihapus.";
        if (!empty($errors)) {
            $message .= " Beberapa permission tidak dapat dihapus: " . implode(' ', $errors);
        }

        return redirect()->route('admin.permissions.index')
            ->with($deletedCount > 0 ? 'success' : 'warning', $message);
    }

    public function generateFromTemplate(Request $request)
    {
        $validated = $request->validate([
            'template_type' => 'required|string|in:crud,user_management,role_management,content_management,system_settings,reports',
            'base_name' => 'required|string|max:255',
            'group_name' => 'required|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'required|string',
            'prefix' => 'nullable|string|max:50',
            'suffix' => 'nullable|string|max:50',
        ]);

        $createdPermissions = [];
        $errors = [];

        foreach ($validated['permissions'] as $permissionName) {
            // Build final permission name
            $finalName = '';
            if ($validated['prefix']) {
                $finalName .= $validated['prefix'] . ' ';
            }
            $finalName .= $permissionName;
            if ($validated['suffix']) {
                $finalName .= ' ' . $validated['suffix'];
            }
            $finalName = Str::lower(trim($finalName));

            // Check if permission already exists
            if (Permission::where('name', $finalName)->exists()) {
                $errors[] = "Permission '{$finalName}' sudah ada.";
                continue;
            }

            // Create permission
            $permission = Permission::create([
                'name' => $finalName,
                'display_name' => Str::title(str_replace(['_', '-'], ' ', $finalName)),
                'description' => "Auto-generated permission dari template {$validated['template_type']}",
                'group_name' => $validated['group_name'],
                'guard_name' => 'web',
                'is_system' => false,
            ]);

            $createdPermissions[] = $permission->display_name;
        }

        $message = count($createdPermissions) . " permission berhasil dibuat: " . implode(', ', $createdPermissions);
        if (!empty($errors)) {
            $message .= ". Beberapa permission tidak dibuat: " . implode(' ', $errors);
        }

        return redirect()->route('admin.permissions.index')
            ->with(count($createdPermissions) > 0 ? 'success' : 'warning', $message);
    }

    public function exportPermissions(Request $request)
    {
        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
            'format' => 'required|string|in:json,csv',
        ]);

        $permissions = Permission::whereIn('id', $validated['permission_ids'])
            ->select('name', 'display_name', 'description', 'group_name', 'guard_name')
            ->get();

        if ($validated['format'] === 'json') {
            return response()->json($permissions->toArray())
                ->header('Content-Disposition', 'attachment; filename="permissions.json"');
        } else {
            // CSV export
            $filename = 'permissions_' . date('Y-m-d_H-i-s') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($permissions) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['Name', 'Display Name', 'Description', 'Group', 'Guard']);

                foreach ($permissions as $permission) {
                    fputcsv($file, [
                        $permission->name,
                        $permission->display_name,
                        $permission->description,
                        $permission->group_name,
                        $permission->guard_name,
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }
    }

    public function getAvailableGroups()
    {
        $groups = Permission::distinct('group_name')
            ->whereNotNull('group_name')
            ->orderBy('group_name')
            ->pluck('group_name');

        return response()->json($groups);
    }

    public function getPermissionStats()
    {
        $stats = [
            'total_permissions' => Permission::count(),
            'system_permissions' => Permission::where('is_system', true)->count(),
            'custom_permissions' => Permission::where('is_system', false)->count(),
            'total_groups' => Permission::distinct('group_name')->count('group_name'),
            'roles_using' => Role::whereHas('permissions')->count(),
            'direct_users' => DB::table('model_has_permissions')
                ->where('model_type', 'App\\Models\\User')
                ->distinct('model_id')
                ->count(),
            'groups_breakdown' => Permission::select('group_name')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('group_name')
                ->orderBy('group_name')
                ->get()
                ->pluck('count', 'group_name'),
        ];

        return response()->json($stats);
    }
}
