<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class QrCreateOrderRequest extends FormRequest
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
            'device_id' => ['nullable', 'string', 'max:120'],
        ];
    }
}
