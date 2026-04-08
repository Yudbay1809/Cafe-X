<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('plans')) {
            Schema::create('plans', function (Blueprint $table): void {
                $table->id();
                $table->string('code', 40)->unique();
                $table->string('name', 80);
                $table->decimal('price_monthly', 14, 2)->default(0);
                $table->json('feature_flags_json')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->unsignedBigInteger('plan_id');
                $table->enum('status', ['trial', 'active', 'past_due', 'canceled'])->default('active');
                $table->timestamp('period_start')->nullable();
                $table->timestamp('period_end')->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'status']);
            });
        }

        if (!Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->string('invoice_no', 60)->unique();
                $table->decimal('amount', 14, 2)->default(0);
                $table->date('due_date')->nullable();
                $table->enum('status', ['draft', 'sent', 'paid', 'void', 'overdue'])->default('draft');
                $table->text('notes')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'status', 'due_date']);
            });
        }

        if (!Schema::hasTable('invoice_items')) {
            Schema::create('invoice_items', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('invoice_id');
                $table->string('description', 160);
                $table->integer('qty')->default(1);
                $table->decimal('price', 14, 2)->default(0);
                $table->decimal('line_total', 14, 2)->default(0);
                $table->timestamps();
                $table->index(['invoice_id']);
            });
        }

        if (!Schema::hasTable('billing_audit_logs')) {
            Schema::create('billing_audit_logs', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->string('actor', 120)->nullable();
                $table->string('action', 80);
                $table->json('before_json')->nullable();
                $table->json('after_json')->nullable();
                $table->string('request_id', 100)->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'action', 'created_at']);
            });
        }

        if (Schema::hasTable('tenant_subscriptions') && !Schema::hasColumn('tenant_subscriptions', 'subscription_id')) {
            Schema::table('tenant_subscriptions', function (Blueprint $table): void {
                $table->unsignedBigInteger('subscription_id')->nullable()->after('tenant_id');
                $table->index(['tenant_id', 'plan_code', 'is_active']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_audit_logs');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
