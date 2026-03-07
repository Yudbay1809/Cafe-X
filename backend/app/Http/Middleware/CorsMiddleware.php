<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    private const DEFAULT_ALLOWED = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3002',
        'http://127.0.0.1:3002',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $origin = (string) $request->headers->get('Origin', '');
        $allowed = $this->allowedOrigins();
        $allowOrigin = in_array($origin, $allowed, true) ? $origin : '*';

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($this->corsHeaders($allowOrigin));
        }

        /** @var Response $response */
        $response = $next($request);
        foreach ($this->corsHeaders($allowOrigin) as $key => $value) {
            $response->headers->set($key, $value);
        }
        return $response;
    }

    private function allowedOrigins(): array
    {
        $raw = (string) env('CORS_ALLOWED_ORIGINS', '');
        if ($raw === '') {
            return self::DEFAULT_ALLOWED;
        }
        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }

    private function corsHeaders(string $origin): array
    {
        return [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Methods' => 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Request-Id, Idempotency-Key',
            'Access-Control-Expose-Headers' => 'X-Request-Id',
            'Access-Control-Max-Age' => '86400',
        ];
    }
}
