<?php 
namespace Cie\Http\Validators;

use Cie\Exceptions\AuthenticateException;
use Illuminate\Http\Request;
use Validator;
/**
* 
*/
class AuthenticateValidator extends Validator implements ValidatorInterface
{
	
	public function make(Request $request){
		$credentials = $request->only('username','password');
		$validator =  parent::make($credentials,$this->rules(),$this->messages());
        if ($validator->fails()){
        	throw new AuthenticateException(['title'=>'Error de validación','detail'=>$validator->errors()->first('username'),'level'=>'error'],422);        
        } else {
        	return true;
        } 
	}

	public function rules($method = null) {
		return [
			'username' => 'required|string',
			'password'=>'required'
		];
	}

	public function messages($method = null) {
		return [
			'username.required' => 'El usuario es requerido',
			'username.string' => 'El usuario es inválido',
			'password.required' => 'La clave es requerida'
		];
	}
}