<?php

namespace Database\Seeders;

use App\Helpers\PermissionsHelper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        activity()->disableLogging();
        Schema::disableForeignKeyConstraints();
        DB::table('permissions')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_permissions')->truncate();

        $now = now();
        $permissionGroups = [
            [
                'name' => 'dashboard',
                'permissions' => [
                    'dashboard overview stats',
                    'dashboard overview grouped stats'
                ]
            ],
            [
                'name' => 'planning',
                'permissions' => PermissionsHelper::genCrudPermissions('planning'),
            ],
            [
                'name' => 'orders',
                'permissions' => PermissionsHelper::genCrudPermissions('orders'),
            ],
            [
                'name' => 'roles',
                'permissions' => PermissionsHelper::genCrudPermissions('roles', ['update role permissions']),
            ],
            [
                'name' => 'permissions',
                'permissions' => PermissionsHelper::genCrudPermissions('permissions', ['export permissions', 'generate permissions from template']),
            ],
            [
                'name' => 'users',
                'permissions' => PermissionsHelper::genCrudPermissions('users'),
            ],
            [
                'name' => 'activity logs',
                'permissions' => PermissionsHelper::genCrudPermissions('activity logs', [], ['create', 'edit', 'delete'])
            ]
        ];

        foreach ($permissionGroups as $group) {
            foreach ($group['permissions'] as $permission) {
                $displayName = ucwords(str_replace(['_', '-'], ' ', $permission));

                // Use upsert to handle duplicates
                DB::table('permissions')->updateOrInsert(
                    [
                        'name' => $permission,
                        'guard_name' => 'web'
                    ],
                    [
                        'display_name' => $displayName,
                        'description' => "Permission untuk {$displayName}",
                        'group_name' => $group['name'],
                        'is_system' => true, // Mark as system permission
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

        Schema::disableForeignKeyConstraints();
        activity()->enableLogging();
    }
}
