<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class AuthLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required','string','max:100'],
            'password' => ['required','string','max:255'],
            'device_name' => ['nullable','string','max:100'],
        ];
    }
}
