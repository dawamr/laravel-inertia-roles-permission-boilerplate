<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        activity()->disableLogging();
        Schema::disableForeignKeyConstraints();
        DB::table('users')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();

        // Create Super Admin
        $superAdmin = User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'admin@trisip.co',
            'password' => bcrypt('@secret'),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
        ]);

        $superAdmin->assignRole('admin');

        // Create Head PPIC User
        $headPPIC = User::create([
            'first_name' => 'Head',
            'last_name' => 'PPIC',
            'email' => 'head-ppic@trisip.co',
            'password' => bcrypt('@secret'),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
        ]);

        $headPPIC->assignRole('head-ppic');

        // Create Staff PPIC User
        $staffPPIC = User::create([
            'first_name' => 'Staff',
            'last_name' => 'PPIC',
            'email' => 'staff-ppic@trisip.co',
            'password' => bcrypt('@secret'),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
        ]);

        $staffPPIC->assignRole('staff-ppic');

        Schema::enableForeignKeyConstraints();
        activity()->enableLogging();
    }
}
