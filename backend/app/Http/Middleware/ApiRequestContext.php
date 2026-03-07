<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiRequestContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->headers->get('X-Request-Id') ?: (string) \Illuminate\Support\Str::uuid();
        $request->attributes->set('request_id', $requestId);
        $started = microtime(true);

        /** @var Response $response */
        $response = $next($request);

        $auth = (array) $request->attributes->get('auth_user', []);
        $durationMs = (int) round((microtime(true) - $started) * 1000);
        $response->headers->set('X-Request-Id', $requestId);

        Log::info('api_request', [
            'request_id' => $requestId,
            'tenant_id' => $auth['tenant_id'] ?? null,
            'outlet_id' => $auth['outlet_id'] ?? null,
            'username' => $auth['username'] ?? null,
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $response->getStatusCode(),
            'duration_ms' => $durationMs,
        ]);

        return $response;
    }
}

