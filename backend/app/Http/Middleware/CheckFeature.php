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
                'success' => false,
                'message' => 'Unauthorized',
                'errors' => [],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        $tenantSub = DB::table('tenant_subscriptions')
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->orderByDesc('id')
            ->first();

        $plan = (string) ($tenantSub->plan_code ?? 'basic');
        $subscriptionStatus = null;
        if (!empty($tenantSub?->subscription_id)) {
            $subscriptionStatus = DB::table('subscriptions')
                ->where('id', (int) $tenantSub->subscription_id)
                ->value('status');
        }
        $subscriptionStatus = (string) ($subscriptionStatus ?? 'active');

        $packages = config('feature_packages.plans', []);
        $allowed = in_array($feature, $packages[$plan] ?? [], true);

        if (!$allowed) {
            return response()->json([
                'success' => false,
                'message' => 'Feature not available for current plan',
                'meta' => ['required_feature' => $feature, 'plan' => $plan, 'subscription_status' => $subscriptionStatus],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 402);
        }

        if ($plan !== 'basic' && !in_array($subscriptionStatus, ['trial', 'active'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription inactive. Pro/Premium feature blocked.',
                'meta' => ['required_feature' => $feature, 'plan' => $plan, 'subscription_status' => $subscriptionStatus],
                'server_time' => now()->format('Y-m-d H:i:s'),
            ], 402);
        }

        return $next($request);
    }
}
