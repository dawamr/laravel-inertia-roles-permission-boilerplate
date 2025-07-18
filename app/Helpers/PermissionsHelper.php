<?php

namespace App\Helpers;

class PermissionsHelper {
    /**
     * Generate CRUD permissions for a specific resource
     * 
     * @param string $name The resource name (e.g., 'users', 'posts', 'categories')
     * @param array $morePermissions Additional permissions to include beyond CRUD operations
     * @param array $except CRUD permissions to exclude from the generated list
     * @return array Array of permission strings
     * 
     * Example usage:
     * - genCrudPermissions('users') returns: ['view users', 'create users', 'edit users', 'delete users', 'export users', 'screenshot & copy users']
     * - genCrudPermissions('posts', ['publish posts'], ['export']) returns: ['view posts', 'create posts', 'edit posts', 'delete posts', 'screenshot & copy posts', 'publish posts']
     */
    public static function genCrudPermissions($name, $morePermissions = [], $except = []) {
        // Default CRUD permissions template
        $ps = [
            'view',           // Permission to view/read records
            'create',         // Permission to create new records
            'edit',           // Permission to update existing records
            'delete',         // Permission to delete records
            'export',         // Permission to export data
            'screenshot & copy' // Permission to take screenshots and copy data
        ];

        // Remove any permissions that should be excluded
        $ps = array_diff($ps, $except);

        // Build the permission strings by combining action with resource name
        $permissions = [];
        foreach ($ps as $p) {
            $permissions[] = $p . ' ' . $name; // e.g., 'view users', 'create users', etc.
        }

        // Merge with any additional custom permissions and return the complete list
        return array_merge($permissions, $morePermissions);
    }
}
