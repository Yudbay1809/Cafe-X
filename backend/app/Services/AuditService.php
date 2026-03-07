<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AuditService
{
    public function log(?int $tenantId, ?int $outletId, ?string $actor, string $eventType, ?string $entityType = null, ?string $entityId = null, array $payload = []): void
    {
        DB::table('audit_logs')->insert([
            'tenant_id' => $tenantId,
            'outlet_id' => $outletId,
            'actor' => $actor,
            'event_type' => $eventType,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload_json' => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

