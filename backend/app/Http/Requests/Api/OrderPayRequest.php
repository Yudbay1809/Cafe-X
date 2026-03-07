<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OrderPayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required','integer','min:1'],
            'method' => ['required','string','in:cash,qris,transfer,card,other'],
            'amount' => ['required','numeric','min:0'],
            'reference_no' => ['nullable','string','max:100'],
        ];
    }
}
