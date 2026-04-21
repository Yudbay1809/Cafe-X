<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'api.token' => \App\Http\Middleware\ApiTokenAuth::class,
            'perm' => \App\Http\Middleware\CheckPermission::class,
            'feature' => \App\Http\Middleware\CheckFeature::class,
        ]);
        $middleware->appendToGroup('api', \App\Http\Middleware\CorsMiddleware::class);
        $middleware->appendToGroup('api', \App\Http\Middleware\ApiRequestContext::class);
        $middleware->appendToGroup('api', \App\Http\Middleware\ApiResponseMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                    'server_time' => now()->format('Y-m-d H:i:s'),
                ], 422);
            }
            return null;
        });
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                \Illuminate\Support\Facades\Log::error('api_error', [
                    'request_id' => $request->attributes->get('request_id'),
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'error_class' => get_class($e),
                    'message' => $e->getMessage(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Internal server error',
                    'errors' => [
                        'request_id' => $request->attributes->get('request_id'),
                    ],
                    'server_time' => now()->format('Y-m-d H:i:s'),
                ], 500);
            }
            return null;
        });
    })->create();


