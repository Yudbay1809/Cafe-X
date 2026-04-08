<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    use ApiResponse;

    public function subscription(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return $this->fail('Unauthorized', 401);
        }

        $sub = DB::table('subscriptions as s')
            ->join('plans as p', 'p.id', '=', 's.plan_id')
            ->where('s.tenant_id', $tenantId)
            ->orderByDesc('s.id')
            ->select([
                's.id',
                's.status',
                's.period_start',
                's.period_end',
                'p.code as plan_code',
                'p.name as plan_name',
                'p.price_monthly',
                'p.feature_flags_json',
            ])
            ->first();

        return $this->ok([
            'subscription' => $sub,
            'plans' => DB::table('plans')->where('is_active', 1)->orderBy('price_monthly')->get()->all(),
        ]);
    }

    public function upsertSubscription(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return $this->fail('Unauthorized', 401);
        }

        $data = $request->validate([
            'plan_code' => 'required|string|in:basic,pro,premium',
            'status' => 'nullable|string|in:trial,active,past_due,canceled',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date',
        ]);

        $plan = DB::table('plans')->where('code', $data['plan_code'])->first();
        if (!$plan) {
            return $this->fail('Plan not found', 404);
        }

        $before = DB::table('subscriptions')->where('tenant_id', $tenantId)->orderByDesc('id')->first();

        $subId = DB::table('subscriptions')->insertGetId([
            'tenant_id' => $tenantId,
            'plan_id' => (int) $plan->id,
            'status' => $data['status'] ?? 'active',
            'period_start' => $data['period_start'] ?? now(),
            'period_end' => $data['period_end'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tenant_subscriptions')
            ->where('tenant_id', $tenantId)
            ->update(['is_active' => 0, 'updated_at' => now()]);

        DB::table('tenant_subscriptions')->insert([
            'tenant_id' => $tenantId,
            'subscription_id' => $subId,
            'plan_code' => $plan->code,
            'is_active' => 1,
            'starts_at' => $data['period_start'] ?? now(),
            'ends_at' => $data['period_end'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $after = DB::table('subscriptions')->where('id', $subId)->first();

        $this->logBillingAudit($request, $tenantId, (string) ($auth['username'] ?? 'system'), 'subscription.upsert', $before, $after);

        app(AuditService::class)->log(
            tenantId: $tenantId,
            outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'billing.subscription.upsert',
            entityType: 'subscription',
            entityId: (string) $subId,
            payload: ['plan_code' => $plan->code, 'status' => $after->status ?? 'active']
        );

        return $this->ok(['subscription_id' => $subId], 'Subscription updated');
    }

    public function invoices(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return $this->fail('Unauthorized', 401);
        }

        $items = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return $this->ok(['items' => $items->all()]);
    }

    public function createInvoice(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return $this->fail('Unauthorized', 401);
        }

        $data = $request->validate([
            'invoice_no' => 'nullable|string|max:60',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:draft,sent,paid,void,overdue',
            'notes' => 'nullable|string|max:2000',
            'items' => 'nullable|array',
            'items.*.description' => 'required_with:items|string|max:160',
            'items.*.qty' => 'required_with:items|integer|min:1|max:9999',
            'items.*.price' => 'required_with:items|numeric|min:0',
        ]);

        $invoiceNo = $data['invoice_no'] ?? ('INV-' . now()->format('Ymd') . '-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT));
        $rows = (array) ($data['items'] ?? []);
        $amount = collect($rows)->sum(fn ($row) => ((int) ($row['qty'] ?? 0)) * ((float) ($row['price'] ?? 0)));

        $invoiceId = DB::table('invoices')->insertGetId([
            'tenant_id' => $tenantId,
            'invoice_no' => $invoiceNo,
            'amount' => $amount,
            'due_date' => $data['due_date'] ?? now()->toDateString(),
            'status' => $data['status'] ?? 'draft',
            'notes' => $data['notes'] ?? null,
            'paid_at' => ($data['status'] ?? 'draft') === 'paid' ? now() : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($rows as $row) {
            $qty = (int) ($row['qty'] ?? 0);
            $price = (float) ($row['price'] ?? 0);
            DB::table('invoice_items')->insert([
                'invoice_id' => $invoiceId,
                'description' => (string) ($row['description'] ?? ''),
                'qty' => $qty,
                'price' => $price,
                'line_total' => $qty * $price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $after = DB::table('invoices')->where('id', $invoiceId)->first();
        $this->logBillingAudit($request, $tenantId, (string) ($auth['username'] ?? 'system'), 'invoice.create', null, $after);

        app(AuditService::class)->log(
            tenantId: $tenantId,
            outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'billing.invoice.create',
            entityType: 'invoice',
            entityId: (string) $invoiceId,
            payload: ['invoice_no' => $invoiceNo, 'amount' => $amount]
        );

        return $this->ok(['invoice_id' => $invoiceId], 'Invoice created');
    }

    public function updateInvoice(Request $request, int $id)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return $this->fail('Unauthorized', 401);
        }

        $before = DB::table('invoices')->where('id', $id)->where('tenant_id', $tenantId)->first();
        if (!$before) {
            return $this->fail('Invoice not found', 404);
        }

        $data = $request->validate([
            'status' => 'nullable|string|in:draft,sent,paid,void,overdue',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
        ]);

        $patch = [
            'updated_at' => now(),
        ];
        if (array_key_exists('status', $data)) {
            $patch['status'] = $data['status'];
            if ($data['status'] === 'paid') {
                $patch['paid_at'] = now();
            }
        }
        if (array_key_exists('due_date', $data)) {
            $patch['due_date'] = $data['due_date'];
        }
        if (array_key_exists('notes', $data)) {
            $patch['notes'] = $data['notes'];
        }

        DB::table('invoices')->where('id', $id)->update($patch);
        $after = DB::table('invoices')->where('id', $id)->first();

        $this->logBillingAudit($request, $tenantId, (string) ($auth['username'] ?? 'system'), 'invoice.update', $before, $after);

        app(AuditService::class)->log(
            tenantId: $tenantId,
            outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'billing.invoice.update',
            entityType: 'invoice',
            entityId: (string) $id,
            payload: ['before_status' => $before->status, 'after_status' => $after->status]
        );

        return $this->ok(['invoice' => $after], 'Invoice updated');
    }

    public function markPaid(Request $request, int $id)
    {
        $request->merge(['status' => 'paid']);
        return $this->updateInvoice($request, $id);
    }

    public function demoReset(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        if ($tenantId < 1) {
            return $this->fail('Unauthorized', 401);
        }

        $tables = ['pos_order_items', 'pos_payments', 'pos_orders', 'pos_stock_movements', 'pos_shifts', 'pos_sync_logs', 'audit_logs', 'billing_audit_logs', 'invoices', 'invoice_items'];
        DB::beginTransaction();
        try {
            foreach ($tables as $table) {
                if ($table === 'invoice_items') {
                    DB::table($table)->whereIn('invoice_id', function ($q) use ($tenantId): void {
                        $q->select('id')->from('invoices')->where('tenant_id', $tenantId);
                    })->delete();
                    continue;
                }
                if (DB::getSchemaBuilder()->hasColumn($table, 'tenant_id')) {
                    DB::table($table)->where('tenant_id', $tenantId)->delete();
                }
            }
            DB::table('produk')->where('tenant_id', $tenantId)->update(['stok' => 99, 'updated_at' => now()]);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $this->logBillingAudit($request, $tenantId, (string) ($auth['username'] ?? 'system'), 'demo.reset', null, ['ok' => true]);

        app(AuditService::class)->log(
            tenantId: $tenantId,
            outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'billing.demo.reset',
            entityType: 'tenant',
            entityId: (string) $tenantId,
            payload: ['reset_tables' => $tables]
        );

        return $this->ok(['tenant_id' => $tenantId], 'Demo tenant reset completed');
    }

    private function logBillingAudit(Request $request, int $tenantId, string $actor, string $action, $before, $after): void
    {
        DB::table('billing_audit_logs')->insert([
            'tenant_id' => $tenantId,
            'actor' => $actor,
            'action' => $action,
            'before_json' => $before ? json_encode($before, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
            'after_json' => $after ? json_encode($after, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
            'request_id' => (string) $request->attributes->get('request_id'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

