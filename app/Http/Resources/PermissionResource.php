<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'group_name' => $this->group_name,
            'guard_name' => $this->guard_name,
            'is_system' => $this->is_system ?? false,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

            // Additional computed fields
            'roles_count' => $this->whenLoaded('roles', fn () => $this->roles->count()),
            'users_count' => $this->whenLoaded('users', fn () => $this->users->count()),

            // For frontend display
            'display_group' => $this->group_name ? ucwords(str_replace('_', ' ', $this->group_name)) : 'Lainnya',
            'formatted_name' => ucwords(str_replace(['_', '-'], ' ', $this->name)),

            // Usage info when needed
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ];
            })),

            'users' => $this->whenLoaded('users', fn () => $this->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            })),
        ];
    }
}
