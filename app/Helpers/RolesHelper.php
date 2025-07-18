<?php

namespace App\Helpers;

class RolesHelper
{
    /**
     * Parse JavaScript navigation array to PHP array
     */
    public static function parseJsNavigation($jsString)
    {
        try {
            // Remove comments and clean up the string
            $cleaned = preg_replace('/\/\*.*?\*\//s', '', $jsString);
            $cleaned = preg_replace('/\/\/.*$/m', '', $cleaned);

            // Convert route() calls to unique placeholders first
            $cleaned = preg_replace_callback('/route\([\'"](.*?)[\'"]\)/', function ($matches) {
                return '___ROUTE_PLACEHOLDER___' . $matches[1] . '___END___';
            }, $cleaned);

            // Convert JavaScript object syntax to JSON
            // Handle property names without quotes
            $cleaned = preg_replace('/(\w+):\s*/', '"$1": ', $cleaned);

            // Convert placeholders back to proper route format
            $cleaned = preg_replace('/___ROUTE_PLACEHOLDER___(.*?)___END___/', '"ROUTE:$1"', $cleaned);

            // Convert single quotes to double quotes for JSON compatibility
            $cleaned = str_replace("'", '"', $cleaned);

            // Remove trailing commas that break JSON
            $cleaned = preg_replace('/,\s*([}\]])/', '$1', $cleaned);

            $menuItems = json_decode($cleaned, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('JSON decode failed: ' . json_last_error_msg());
            }

            // Convert route placeholders back and handle items -> children conversion
            return self::processRouteReferences($menuItems);

        } catch (\Exception $e) {
            // Fallback to basic parsing if JSON decode fails
            return self::getDefaultNavigation();
        }
    }

    /**
     * Process route references in menu items
     */
    public static function processRouteReferences($items)
    {
        if (!is_array($items)) {
            return $items;
        }

        foreach ($items as &$item) {
            if (isset($item['href']) && strpos($item['href'], 'ROUTE:') === 0) {
                $routeName = substr($item['href'], 6);
                $item['href'] = "route('{$routeName}')";
            }

            // Handle both 'items' and 'children' for backward compatibility
            if (isset($item['items']) && is_array($item['items'])) {
                $item['children'] = self::processRouteReferences($item['items']);
                unset($item['items']); // Remove original 'items' key
            } elseif (isset($item['children']) && is_array($item['children'])) {
                $item['children'] = self::processRouteReferences($item['children']);
            }
        }

        return $items;
    }

    /**
     * Get default navigation structure when parsing fails
     */
    public static function getDefaultNavigation()
    {
        return [
            [
                'title' => 'Dashboard',
                'href' => "route('admin.dashboard')",
                'icon' => 'dashboard',
                'label' => 'Dashboard',
                'permit' => 'view dashboard',
                'children' => []
            ],
            [
                'title' => 'Users',
                'href' => '#',
                'icon' => 'users',
                'label' => 'Users',
                'permit' => 'view users|manage users',
                'children' => [
                    [
                        'title' => 'Add Users',
                        'href' => "route('admin.users.create')",
                        'icon' => 'menu',
                        'label' => 'Add Users',
                        'permit' => 'create users'
                    ],
                    [
                        'title' => 'All Users',
                        'href' => "route('admin.users.index')",
                        'icon' => 'list',
                        'label' => 'All Users',
                        'permit' => 'view users'
                    ]
                ]
            ],
            [
                'title' => 'Roles & Permissions',
                'href' => '#',
                'icon' => 'shield',
                'label' => 'Roles & Permissions',
                'permit' => 'view roles|manage roles|view permissions|manage permissions',
                'children' => [
                    [
                        'title' => 'Roles',
                        'href' => "route('admin.roles.index')",
                        'icon' => 'shield',
                        'label' => 'Roles',
                        'permit' => 'view roles'
                    ],
                    [
                        'title' => 'Permissions',
                        'href' => "route('admin.permissions.index')",
                        'icon' => 'lock',
                        'label' => 'Permissions',
                        'permit' => 'view permissions'
                    ],
                    [
                        'title' => 'Permission Matrix',
                        'href' => "route('admin.roles.permission-matrix')",
                        'icon' => 'grid',
                        'label' => 'Permission Matrix',
                        'permit' => 'manage roles'
                    ],
                    [
                        'title' => 'Menu Configuration',
                        'href' => "route('admin.roles.menu-configuration')",
                        'icon' => 'settings',
                        'label' => 'Menu Configuration',
                        'permit' => 'manage roles'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate navigation file content from menu items array
     */
    public static function generateNavigationFileContent($menuItems)
    {
        $jsArray = self::convertToJsArray($menuItems, 0);

        return "// Auto-generated navigation configuration
// Last updated: " . now()->format('Y-m-d H:i:s') . "

export const navItems = {$jsArray};
";
    }

    /**
     * Convert PHP array to JavaScript array string
     */
    public static function convertToJsArray($items, $depth = 0)
    {
        if (!is_array($items)) {
            return 'null';
        }

        $indent = str_repeat('    ', $depth);
        $childIndent = str_repeat('    ', $depth + 1);

        $jsItems = [];

        foreach ($items as $item) {
            $jsItem = "{\n";

            // Basic properties
            $jsItem .= "{$childIndent}title: " . json_encode($item['title'] ?? '') . ",\n";

            // Handle href (preserve route() calls)
            $href = $item['href'] ?? '#';
            if (strpos($href, 'route(') === 0) {
                $jsItem .= "{$childIndent}href: {$href},\n";
            } else {
                $jsItem .= "{$childIndent}href: " . json_encode($href) . ",\n";
            }

            $jsItem .= "{$childIndent}icon: " . json_encode($item['icon'] ?? 'menu') . ",\n";
            $jsItem .= "{$childIndent}label: " . json_encode($item['label'] ?? $item['title'] ?? '') . ",\n";

            // Handle permit
            if (!empty($item['permit'])) {
                $jsItem .= "{$childIndent}permit: " . json_encode($item['permit']) . ",\n";
            }

            // Handle children - output as 'items' to match nav-data.js structure
            if (!empty($item['children']) && is_array($item['children'])) {
                $childrenJs = self::convertToJsArray($item['children'], $depth + 2);
                $jsItem .= "{$childIndent}items: {$childrenJs},\n";
            }

            $jsItem .= "{$indent}}";
            $jsItems[] = $jsItem;
        }

        return "[\n{$childIndent}" . implode(",\n{$childIndent}", $jsItems) . "\n{$indent}]";
    }

    /**
     * Read navigation data from nav-data.js file
     */
    public static function readNavigationFile()
    {
        $navDataPath = resource_path('js/data/admin/nav-data.js');

        if (!file_exists($navDataPath)) {
            return [];
        }

        $navContent = file_get_contents($navDataPath);

        // Extract the navItems array from the JS file using improved regex
        if (preg_match('/export const navItems = (\[[\s\S]*?\]);$/m', $navContent, $matches)) {
            $navigationJson = $matches[1];
        } else {
            // Fallback: try to extract everything between the first [ and last ];
            if (preg_match('/export const navItems = (\[.*\]);/s', $navContent, $matches)) {
                $navigationJson = $matches[1];
            } else {
                $navigationJson = '[]';
            }
        }

        return self::parseJsNavigation($navigationJson);
    }

    /**
     * Write navigation data to nav-data.js file
     */
    public static function writeNavigationFile($menuItems)
    {
        $jsContent = self::generateNavigationFileContent($menuItems);
        $navDataPath = resource_path('js/data/admin/nav-data.js');

        return file_put_contents($navDataPath, $jsContent);
    }

    /**
     * Get grouped permissions for role management
     */
    public static function getGroupedPermissions()
    {
        return \Spatie\Permission\Models\Permission::all()->groupBy('group_name');
    }

    /**
     * Sync permissions to role
     */
    public static function syncRolePermissions($role, array $permissionIds)
    {
        $permissions = \Spatie\Permission\Models\Permission::whereIn('id', $permissionIds)->get();
        return $role->syncPermissions($permissions);
    }
}
