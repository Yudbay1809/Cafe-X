<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OrderCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source' => ['nullable','string','in:POS,QR'],
            'table_code' => ['nullable','string','max:50'],
            'notes' => ['nullable','string','max:255'],
        ];
    }
}
