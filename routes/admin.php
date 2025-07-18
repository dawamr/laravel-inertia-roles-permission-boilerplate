<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\CommentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\NoteController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PlanningController;
use App\Http\Controllers\Admin\PostCategoryController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\Role\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\Users\UserController;
use App\Http\Controllers\Admin\PermissionController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['web', 'auth'])->group(function () {
    Route::prefix('users')->name('users.')->controller(UserController::class)->group(function () {
        Route::post('update/{id}', 'update')->name('update')->middleware(['can:edit users']);
        Route::post('store', 'store')->name('store')->middleware(['can:create users']);
        Route::get('create', 'create')->name('create')->middleware(['can:create users']);
        Route::get('{id}', 'edit')->name('edit')->middleware(['can:edit users']);
        Route::get('', 'index')->name('index')->middleware(['can:view users']);
    });

    Route::prefix('menus')->name('menus.')->controller(MenuController::class)->group(function () {
        Route::get('create', 'create')->name('create')->middleware(['can:create menus']);
        Route::post('{menu}', 'update')->name('update')->middleware(['can:edit menus']);
        Route::get('{menu}', 'edit')->name('edit')->middleware(['can:edit menus']);
        Route::post('', 'store')->name('store')->middleware(['can:create menus']);
        Route::get('', 'index')->name('index')->middleware(['can:view menus']);
    });

    Route::prefix('roles')->name('roles.')->controller(RoleController::class)->group(function () {
        Route::post('permission-matrix', 'updatePermissionMatrix')->name('update-permissions-matrix')->middleware(['can:edit roles']);
        Route::get('permission-matrix', 'permissionMatrix')->name('permission-matrix')->middleware(['can:view roles']);
        Route::get('menu-configuration', 'menuConfiguration')->name('menu-configuration')->middleware(['can:view roles']);
        Route::post('update/{id}', 'update')->name('update')->middleware(['can:edit roles']);
        Route::post('store', 'store')->name('store')->middleware(['can:create roles']);
        Route::get('create', 'create')->name('create')->middleware(['can:create roles']);
        Route::get('{id}', 'edit')->name('edit')->middleware(['can:edit roles']);
        Route::get('', 'index')->name('index')->middleware(['can:view roles']);
        Route::post('save-navigation', 'saveNavigation')->name('save-navigation')->middleware(['can:edit roles']);
    });

    Route::prefix('permissions')->name('permissions.')->controller(PermissionController::class)->group(function () {
        Route::delete('bulk-delete', 'bulkDelete')->name('bulk-delete')->middleware(['can:delete permissions']);
        Route::post('generate-from-template', 'generateFromTemplate')->name('generate-from-template')->middleware(['can:create permissions']);
        Route::post('export', 'exportPermissions')->name('export')->middleware(['can:view permissions']);
        Route::get('available-groups', 'getAvailableGroups')->name('available-groups')->middleware(['can:view permissions']);
        Route::get('stats', 'getPermissionStats')->name('stats')->middleware(['can:view permissions']);
        Route::delete('{permission}', 'destroy')->name('destroy')->middleware(['can:delete permissions']);
        Route::post('update/{id}', 'update')->name('update')->middleware(['can:edit permissions']);
        Route::post('store', 'store')->name('store')->middleware(['can:create permissions']);
        Route::get('create', 'create')->name('create')->middleware(['can:create permissions']);
        Route::get('{id}', 'edit')->name('edit')->middleware(['can:edit permissions']);
        Route::get('', 'index')->name('index')->middleware(['can:view permissions']);
    });

    Route::prefix('activity-logs')->name('activityLogs.')->controller(ActivityController::class)->group(function () {
        Route::get('', 'index')->name('index')->middleware(['can:view activity logs']);
    });

    Route::prefix('settings')->name('settings.')->controller(SettingController::class)->group(function () {
        Route::post('{groupKey?}', 'update')->name('update');
        Route::get('{groupKey?}', 'view')->name('view');
    });

    Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

    Route::redirect('/', '/dashboard');
});
