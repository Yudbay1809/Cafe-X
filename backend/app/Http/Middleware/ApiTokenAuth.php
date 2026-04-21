<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $auth = (string) $request->header('Authorization', '');
        $token = '';
        
        if (str_starts_with($auth, 'Bearer ')) {
            $token = trim(substr($auth, 7));
        } else if ($request->has('token')) {
            $token = (string) $request->query('token');
        }

        if ($token === '') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'errors' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        DB::table('api_tokens')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->delete();

        $hash = hash('sha256', $token);
        $row = DB::table('api_tokens')->where('token_hash', $hash)->first();
        if (!$row) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'errors' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }
        if (!empty($row->revoked_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'errors' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }
        if (!empty($row->expires_at) && strtotime((string) $row->expires_at) <= time()) {
            DB::table('api_tokens')->where('id', $row->id)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'errors' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        if (!empty($roles) && !in_array($row->role_name, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
                'errors' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 403);
        }

        DB::table('api_tokens')->where('id', $row->id)->update(['last_used_at' => now(), 'updated_at' => now()]);
        $assignment = DB::table('user_roles')
            ->where('username', $row->username)
            ->orderByDesc('tenant_id')
            ->orderByDesc('outlet_id')
            ->first();

        $permissions = DB::table('user_roles')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'user_roles.role_id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('user_roles.username', $row->username)
            ->pluck('permissions.name')
            ->unique()
            ->values()
            ->all();

        $request->attributes->set('auth_user', [
            'username' => $row->username,
            'role' => $row->role_name,
            'token_hash' => $hash,
            'tenant_id' => $assignment?->tenant_id,
            'outlet_id' => $assignment?->outlet_id,
            'permissions' => $permissions,
        ]);

        return $next($request);
    }
}

