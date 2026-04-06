<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class PaymentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|integer|min:1',
            'method' => 'required|in:cash,qris,transfer,card,other',
            'amount' => 'required|numeric|min:0.01',
            'reference_no' => 'nullable|string|max:120',
        ];
    }
}
