<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OrderCancelItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id' => ['required','integer','min:1'],
            'product_id' => ['required','integer','min:1'],
            'reason' => ['nullable','string','max:255'],
        ];
    }
}
