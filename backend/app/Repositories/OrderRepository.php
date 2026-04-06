<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class OrderRepository
{
    public function find(int $id)
    {
        return DB::table('pos_orders')->where('id', $id)->first();
    }

    public function items(int $orderId)
    {
        return DB::table('pos_order_items')->where('order_id', $orderId)->orderBy('id')->get();
    }
}
