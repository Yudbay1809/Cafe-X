<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->date('booking_date');
            $table->time('booking_time');
            $table->integer('guests');
            $table->string('table_type')->nullable();
            $table->decimal('booking_fee', 15, 2)->default(0);
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, attended
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loyalty_stamps', function (Blueprint $table) {
            $table->id();
            $table->string('member_id');
            $table->integer('stamps_count')->default(0);
            $table->decimal('total_spend', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->string('period_month'); // e.g. "2026-04"
            $table->decimal('base_salary', 15, 2);
            $table->decimal('commission', 15, 2)->default(0);
            $table->decimal('deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2);
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo_url')->nullable();
            $table->string('primary_color')->default('#4f46e5');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('loyalty_stamps');
        Schema::dropIfExists('payroll_records');
        Schema::dropIfExists('brands');
    }
};
