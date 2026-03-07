<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OrderMergeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'source_order_id' => ['required','integer','min:1'],
            'target_order_id' => ['required','integer','min:1','different:source_order_id'],
        ];
    }
}
