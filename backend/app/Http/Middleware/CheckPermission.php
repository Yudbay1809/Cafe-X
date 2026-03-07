<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $username = (string) ($auth['username'] ?? '');
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($username === '' || $tenantId < 1) {
            return response()->json([
                'ok' => false,
                'message' => 'Unauthorized',
                'meta' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        $cached = $auth['permissions'] ?? null;
        if (is_array($cached) && in_array($permission, $cached, true)) {
            return $next($request);
        }

        $allowed = DB::table('user_roles')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'user_roles.role_id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('user_roles.username', $username)
            ->where('user_roles.tenant_id', $tenantId)
            ->where('permissions.name', $permission)
            ->exists();

        if (!$allowed) {
            return response()->json([
                'ok' => false,
                'message' => 'Forbidden',
                'meta' => ['required_permission' => $permission],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 403);
        }

        return $next($request);
    }
}
