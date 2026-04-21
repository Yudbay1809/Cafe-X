<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class QrPlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'table_token' => ['required', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'min:1'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:1000'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'member_phone' => ['nullable', 'string', 'max:20'],
            'redeem_points' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
