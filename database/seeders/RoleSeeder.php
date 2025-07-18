<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        activity()->disableLogging();
        Schema::disableForeignKeyConstraints();
        DB::table('roles')->truncate();
        DB::table('role_has_permissions')->truncate();

        // Create roles
        $admin = Role::create(['name' => 'admin']);
        $headPPIC = Role::create(['name' => 'head-ppic']);
        $staffPPIC = Role::create(['name' => 'staff-ppic']);

        // Assign permissions to roles
        $this->assignPermissionsToRoles($admin, $headPPIC, $staffPPIC);

        Schema::enableForeignKeyConstraints();
        activity()->enableLogging();
    }

    private function assignPermissionsToRoles($admin, $headPPIC, $staffPPIC)
    {
        // Admin gets all permissions
        $admin->givePermissionTo(Permission::all());

        // Head PPIC permissions - dashboard, users, planning, orders
        $headPPICPermissions = [
            // Dashboard permissions
            'dashboard overview stats',
            'dashboard overview grouped stats',

            // Users permissions
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Planning permissions
            'view planning',
            'create planning',
            'edit planning',
            'delete planning',

            // Orders permissions
            'view orders',
            'create orders',
            'edit orders',
            'delete orders',
        ];

        foreach ($headPPICPermissions as $permission) {
            $permissionModel = Permission::where('name', $permission)->first();
            if ($permissionModel) {
                $headPPIC->givePermissionTo($permissionModel);
            }
        }

        // Staff PPIC permissions - limited access
        $staffPPICPermissions = [
            'dashboard overview stats',
            'view planning',
            'create planning',
            'edit planning',
            'view orders',
            'create orders',
            'edit orders',
        ];

        foreach ($staffPPICPermissions as $permission) {
            $permissionModel = Permission::where('name', $permission)->first();
            if ($permissionModel) {
                $staffPPIC->givePermissionTo($permissionModel);
            }
        }
    }
}
