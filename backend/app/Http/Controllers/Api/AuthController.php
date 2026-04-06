<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AuthLoginRequest;
use App\Services\PosService;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly PosService $service)
    {
    }

    public function login(AuthLoginRequest $request)
    {
        $data = $request->validated();
        $lockKey = 'auth_lock:' . strtolower($data['username']);
        $failKey = 'auth_fail:' . strtolower($data['username']);
        if ((int) Cache::get($lockKey, 0) === 1) {
            return $this->fail('Akun terkunci sementara, coba lagi nanti', 429);
        }

        $user = DB::table('user')->where('username', $data['username'])->first();
        if (!$user) {
            $fails = (int) Cache::increment($failKey);
            Cache::put($failKey, $fails, now()->addMinutes(15));
            if ($fails >= 5) {
                Cache::put($lockKey, 1, now()->addMinutes(10));
            }
            return $this->fail('Username atau password salah', 401);
        }

        $stored = (string) $user->password;
        $valid = Hash::check($data['password'], $stored) || hash_equals($stored, $data['password']);
        if (!$valid) {
            $fails = (int) Cache::increment($failKey);
            Cache::put($failKey, $fails, now()->addMinutes(15));
            if ($fails >= 5) {
                Cache::put($lockKey, 1, now()->addMinutes(10));
            }
            return $this->fail('Username atau password salah', 401);
        }
        Cache::forget($failKey);
        Cache::forget($lockKey);

        if (!str_starts_with($stored, '$2y$')) {
            DB::table('user')
                ->where('username', $user->username)
                ->update(['password' => Hash::make($data['password'])]);
        }

        $token = $this->service->issueToken(
            username: $user->username,
            role: $user->status,
            tokenName: $data['device_name'] ?? 'device'
        );

        return $this->ok([
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in_days' => 30,
            'user' => [
                'username' => $user->username,
                'role' => $user->status,
            ],
        ], 'Login berhasil');
    }

    public function logout(Request $request)
    {
        $auth = $request->attributes->get('auth_user', []);
        $hash = (string) ($auth['token_hash'] ?? '');
        if ($hash !== '') {
            DB::table('api_tokens')
                ->where('token_hash', $hash)
                ->update(['revoked_at' => now(), 'updated_at' => now()]);
        }

        return $this->ok([], 'Logout berhasil');
    }

    public function me(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        if (empty($auth)) {
            return $this->fail('Unauthorized', 401);
        }
        return $this->ok([
            'user' => [
                'username' => $auth['username'] ?? null,
                'role' => $auth['role'] ?? null,
            ],
            'tenant_id' => $auth['tenant_id'] ?? null,
            'outlet_id' => $auth['outlet_id'] ?? null,
        ]);
    }
}
