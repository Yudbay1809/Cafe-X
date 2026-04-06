<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TableUpsertRequest;
use App\Services\AuditService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterController extends Controller
{
    use ApiResponse;

    public function products()
    {
        $tenantId = request()->attributes->get('auth_user')['tenant_id'] ?? null;
        $query = DB::table('produk')
            ->select(['id_menu', 'nama_menu', 'jenis_menu', 'stok', 'harga', 'gambar'])
            ->orderByDesc('id_menu');
        if ($tenantId !== null) {
            $query->where('tenant_id', (int) $tenantId);
        }
        $items = $query->get();

        return $this->ok(['items' => $items->all()]);
    }

    public function tables()
    {
        $auth = request()->attributes->get('auth_user', []);
        $query = DB::table('pos_tables')
            ->leftJoin('outlets', 'outlets.id', '=', 'pos_tables.outlet_id')
            ->leftJoin('table_qr_tokens', function ($join): void {
                $join->on('table_qr_tokens.table_id', '=', 'pos_tables.id')
                    ->where('table_qr_tokens.is_active', 1);
            })
            ->select([
                'pos_tables.id',
                'pos_tables.table_code',
                'pos_tables.table_name',
                DB::raw('COALESCE(pos_tables.qr_token, table_qr_tokens.token) as qr_token'),
                'pos_tables.is_active',
                'outlets.brand_color',
                'outlets.brand_name',
                'outlets.contact_phone',
            ])
            ->orderBy('table_code');
        if (!empty($auth['tenant_id'])) {
            $query->where('pos_tables.tenant_id', (int) $auth['tenant_id']);
        }
        if (!empty($auth['outlet_id'])) {
            $query->where('pos_tables.outlet_id', (int) $auth['outlet_id']);
        }
        $items = $query->get();

        return $this->ok(['items' => $items->all()]);
    }

    public function upsertTable(TableUpsertRequest $request)
    {
        $auth = $request->attributes->get('auth_user', []);
        if (($auth['role'] ?? '') !== 'admin') {
            return $this->fail('Forbidden', 403);
        }
        $data = $request->validated();

        $tableCode = strtoupper($data['table_code']);
        $tableName = $data['table_name'];
        $isActive = array_key_exists('is_active', $data) ? (int) ((bool) $data['is_active']) : 1;
        $rotateQr = (bool) ($data['rotate_qr'] ?? false);
        $qrToken = $data['qr_token'] ?? bin2hex(random_bytes(20));
        $tenantId = isset($auth['tenant_id']) ? (int) $auth['tenant_id'] : null;
        $outletId = isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null;

        $existing = DB::table('pos_tables')
            ->where('table_code', $tableCode)
            ->when($tenantId !== null, fn ($q) => $q->where('tenant_id', $tenantId))
            ->first();
        if ($existing && !$rotateQr && !array_key_exists('qr_token', $data)) {
            $qrToken = (string) $existing->qr_token;
        }

        DB::table('pos_tables')->updateOrInsert(
            ['table_code' => $tableCode],
            [
                'tenant_id' => $tenantId,
                'outlet_id' => $outletId,
                'table_name' => $tableName,
                'qr_token' => $qrToken,
                'is_active' => $isActive,
                'updated_at' => now(),
                'created_at' => $existing ? $existing->created_at : now(),
            ]
        );

        $table = DB::table('pos_tables')->where('table_code', $tableCode)->first();
        if ($table && ($rotateQr || array_key_exists('qr_token', $data) || !$existing)) {
            DB::table('table_qr_tokens')
                ->where('table_id', (int) $table->id)
                ->where('is_active', 1)
                ->update(['is_active' => 0, 'updated_at' => now()]);
            DB::table('table_qr_tokens')->insert([
                'table_id' => (int) $table->id,
                'token' => $qrToken,
                'is_active' => $isActive,
                'expired_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        app(AuditService::class)->log(
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'table.upsert',
            entityType: 'table',
            entityId: $tableCode,
            payload: [
                'table_code' => $tableCode,
                'table_name' => $tableName,
                'is_active' => $isActive,
            ]
        );

        return $this->ok([
            'table_code' => $tableCode,
            'table_name' => $tableName,
            'is_active' => $isActive,
            'qr_token' => $qrToken,
        ], 'Table saved');
    }

    public function config(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $settings = DB::table('pos_settings')->pluck('setting_value', 'setting_key');
        $outlet = $outletId > 0 ? DB::table('outlets')->where('id', $outletId)->first() : null;

        return $this->ok([
            'settings' => $settings,
            'outlet' => $outlet,
            'tenant_id' => $tenantId ?: null,
            'outlet_id' => $outletId ?: null,
        ]);
    }
}



