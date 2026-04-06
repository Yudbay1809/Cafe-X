<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class InventoryAdjustRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|min:1',
            'qty' => 'required|integer|min:1',
            'direction' => 'required|in:in,out',
            'notes' => 'nullable|string|max:200',
        ];
    }
}
