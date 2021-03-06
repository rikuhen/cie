<?php 
namespace Cie\Http\Validators;

use Cie\Exceptions\PathologyException;
use Illuminate\Http\Request;
use Validator;
/**
* 
*/
class PathologyValidator extends Validator implements ValidatorInterface
{
	private $request;

	public function __construct(Request $request)
	{
		$this->make($this->request = $request);
	}


	public function make(Request $request){
		$validator =  parent::make($request->all(),$this->rules($request->method()),$this->messages($request->method()));
        if ($validator->fails()){
        	throw new PathologyException(['title'=>'Error de validación','detail'=>$validator->errors()->toJson(),'level'=>'error'],422);        
        } else {
        	return true;
        } 
	}

	public function rules($method = null) {
		$rules = [
			'name' => 'required|unique:pathology,name',
			// 'cie_ten'=>'required|unique:pathology,cie_ten'
		];

		if ($method == 'PUT') {
			$rules['name'] = 'required|unique:pathology,name,'.$this->request->get('key');
			// $rules['cie_ten'] = 'required|unique:pathology,cie_ten,'.$this->request->get('key');
		}


		return $rules;
	}

	public function messages($method = null) {
		return [
			'name.required' => 'El nombre es requerido',
			'name.unique' => 'El nombre de la patología ya existe',
			// 'cie_ten.required' => 'El código CIE 10 es requerido',
			// 'cie_ten.unique' => 'El código CIE 10 ya fue tomado',
		];
	}
}