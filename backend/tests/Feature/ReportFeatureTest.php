<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate', ['--force' => true]);
        $this->artisan('db:seed', ['--force' => true]);
    }

    public function test_report_summary_available_for_seeded_plan(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'admin',
            'device_name' => 'report-test',
        ]);
        $login->assertOk();

        $token = $login->json('data.token');
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/v1/reports/summary')
            ->assertOk();

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/v1/reports/shift')
            ->assertStatus(404);
    }
}
