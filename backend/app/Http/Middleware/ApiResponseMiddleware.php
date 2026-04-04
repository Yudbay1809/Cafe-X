<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiResponseMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$request->is('api/*')) {
            return $response;
        }

        if (method_exists($response, 'getData')) {
            $data = $response->getData(true);
            if (is_array($data) && array_key_exists('success', $data)) {
                return $response;
            }

            $status = $response->getStatusCode();
            if ($status >= 200 && $status < 300) {
                return response()->json([
                    'success' => true,
                    'message' => $data['message'] ?? null,
                    'data' => $data,
                ], $status);
            }

            $message = $data['message'] ?? ($status === 404 ? 'not found' : 'error');
            $errors = $data['errors'] ?? null;
            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => $errors,
            ], $status);
        }

        return $response;
    }
}
