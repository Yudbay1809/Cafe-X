<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpsertRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nama_menu' => ['required', 'string', 'max:120'],
            'jenis_menu' => ['nullable', 'string', 'max:80'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'harga' => ['required', 'numeric', 'min:0'],
            'gambar' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
