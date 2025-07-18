<?php

namespace App\Http\Controllers\Admin\Role;

use App\Helpers\RolesHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::withCount(['permissions', 'users'])->paginate($request->get('limit', config('app.pagination_limit')))->withQueryString();
        return Inertia::render('Admin/Roles/Roles', ['roles' => RoleResource::collection($roles)]);
    }

    public function create()
    {
        return Inertia::render('Admin/Roles/Role', [
            'groupedPermissions' => RolesHelper::getGroupedPermissions(),
        ]);
    }

    public function edit($id)
    {
        $role = Role::with(['permissions', 'users'])->findOrFail($id);

        $roleResource = new RoleResource($role);
        $roleResource->wrap(null);

        return Inertia::render('Admin/Roles/Role', [
            'role' => $roleResource,
            'groupedPermissions' => RolesHelper::getGroupedPermissions(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles',
            'permission_ids.*' => 'required|exists:permissions,id',
        ]);

        $role = Role::create($request->all());
        RolesHelper::syncRolePermissions($role, $request->permission_ids);

        return redirect()->route('admin.roles.edit', $role->id)->with([
            'flash_type' => 'success',
            'flash_message' => 'Role created successfully',
            'flash_description' => $role->title
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'permission_ids.*' => 'required|exists:permissions,id',
        ]);

        $role = Role::with('permissions')->findOrFail($id);
        RolesHelper::syncRolePermissions($role, $request->permission_ids);

        return redirect()->route('admin.roles.edit', $id)->with([
            'flash_type' => 'success',
            'flash_message' => 'Role updated successfully',
            'flash_description' => $role->title
        ]);
    }

    public function permissionMatrix()
    {
        $roles = Role::all();
        $permissions = Permission::orderBy('group_name', 'asc')->orderBy('name', 'asc')->get();

        // Get current role-permission relationships
        $rolePermissions = DB::table('role_has_permissions')
            ->select('role_id', 'permission_id')
            ->get();

        return Inertia::render('Admin/Roles/PermissionMatrix', [
            'roles' => $roles,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    public function updatePermissionMatrix(Request $request)
    {
        $request->validate([
            'matrix' => 'required|array',
            'matrix.*' => 'array',
            'matrix.*.*' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Clear all existing role-permission relationships
            DB::table('role_has_permissions')->truncate();

            // Insert new relationships based on matrix
            foreach ($request->matrix as $roleId => $permissions) {
                $role = Role::findOrFail($roleId);
                $permissionIds = array_keys(array_filter($permissions, fn ($has) => $has === true));

                if (!empty($permissionIds)) {
                    $permissionModels = Permission::whereIn('id', $permissionIds)->get();
                    $role->syncPermissions($permissionModels);
                }
            }

            DB::commit();

            return back()->with([
                'flash_type' => 'success',
                'flash_message' => 'Permission matrix updated successfully',
                'flash_description' => 'All role permissions have been updated'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with([
                'flash_type' => 'error',
                'flash_message' => 'Failed to update permission matrix',
                'flash_description' => $e->getMessage()
            ]);
        }
    }

    /**
     * Show menu configuration interface
     */
    public function menuConfiguration()
    {
        try {
            $menuItems = RolesHelper::readNavigationFile();

            if (empty($menuItems)) {
                $menuItems = RolesHelper::getDefaultNavigation();
            }

            $permissions = Permission::orderBy('group_name')
                ->orderBy('display_name')
                ->get(['id', 'name', 'display_name', 'group_name']);

            return Inertia::render('Admin/Roles/MenuConfiguration', [
                'menuItems' => $menuItems,
                'permissions' => $permissions,
            ]);

        } catch (\Exception $e) {
            return Inertia::render('Admin/Roles/MenuConfiguration', [
                'menuItems' => RolesHelper::getDefaultNavigation(),
                'permissions' => Permission::orderBy('group_name')->orderBy('display_name')->get(['id', 'name', 'display_name', 'group_name']),
            ]);
        }
    }

    /**
     * Save navigation changes to nav-data.js file
     */
    public function saveNavigation(Request $request)
    {
        $request->validate([
            'menuItems' => 'required|array',
        ]);

        try {
            $menuItems = $request->input('menuItems');
            $result = RolesHelper::writeNavigationFile($menuItems);

            if ($result === false) {
                throw new \Exception('Failed to write navigation file');
            }

            return back()->with([
                'flash_type' => 'success',
                'flash_message' => 'Navigation berhasil disimpan!',
                'flash_description' => 'Menu configuration telah berhasil diupdate dan disimpan ke file nav-data.js'
            ]);

        } catch (\Exception $e) {
            return back()->with([
                'flash_type' => 'error',
                'flash_message' => 'Gagal menyimpan navigation',
                'flash_description' => $e->getMessage()
            ]);
        }
    }




}
