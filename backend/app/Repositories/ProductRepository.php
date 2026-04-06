<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class ProductRepository
{
    public function query()
    {
        return DB::table('produk');
    }

    public function find(int $id)
    {
        return DB::table('produk')->where('id_menu', $id)->first();
    }

    public function insert(array $data): int
    {
        return (int) DB::table('produk')->insertGetId($data);
    }

    public function update(int $id, array $data): void
    {
        DB::table('produk')->where('id_menu', $id)->update($data);
    }
}
