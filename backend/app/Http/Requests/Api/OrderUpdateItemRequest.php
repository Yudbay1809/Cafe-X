<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OrderUpdateItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id' => ['required','integer','min:1'],
            'product_id' => ['required','integer','min:1'],
            'qty' => ['required','integer','min:1','max:1000'],
            'notes' => ['nullable','string','max:255'],
        ];
    }
}
