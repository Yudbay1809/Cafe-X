<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OrderSplitRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id' => ['required','integer','min:1'],
            'items' => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer','min:1'],
            'items.*.qty' => ['required','integer','min:1','max:1000'],
        ];
    }
}
