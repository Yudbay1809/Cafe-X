<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckFeature
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return response()->json([
                'ok' => false,
                'message' => 'Unauthorized',
                'meta' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        $plan = (string) (DB::table('tenant_subscriptions')
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->value('plan_code') ?? 'basic');

        $packages = config('feature_packages.plans', []);
        $allowed = in_array($feature, $packages[$plan] ?? [], true);

        if (!$allowed) {
            return response()->json([
                'ok' => false,
                'message' => 'Feature not available for current plan',
                'meta' => ['required_feature' => $feature, 'plan' => $plan],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 402);
        }

        return $next($request);
    }
}
