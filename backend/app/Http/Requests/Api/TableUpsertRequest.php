<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class TableUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'table_code' => ['required','string','max:50'],
            'table_name' => ['required','string','max:100'],
            'is_active' => ['nullable','boolean'],
            'qr_token' => ['nullable','string','max:80'],
            'rotate_qr' => ['nullable','boolean'],
        ];
    }
}
