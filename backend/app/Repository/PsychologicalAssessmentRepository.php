<?php
namespace Cie\Repository;

use Cie\RepositoryInterface\PsychologicalAssessmentRepositoryInterface;
use Cie\Exceptions\PsychologicalAssessmentException;
use Cie\Models\PsychologicalAssessment;
use Cie\Models\StatePatientUser;
use Cie\Models\PatientUser;
use Auth;

/**
* 
*/
class PsychologicalAssessmentRepository implements PsychologicalAssessmentRepositoryInterface
{
	



	public function paginate()
	{
		return PsychologicalAssessment::paginate();
	}

	public function enum($params = null)
	{
		if ($params) {
			if(is_array($params)) {
				if(array_key_exists('num_identification', $params) && isset($params['num_identification'])) {
				
					//USADO PARA LA BUSQUEDA DE USUARIOS EN EVALUACIONES PSICOLOGICA Y MÉDICA
					$paUsers = $this->find($params);
					
				} elseif(array_key_exists('name', $params) && isset($params['name'])) {
					$paUsers = PatientUser::leftJoin('psychological_assessment',function($join){
						$join->on('patient_user.id','=','psychological_assessment.patient_user_id')->whereRaw('psychological_assessment.deleted_at is null');
					})->where(function($query) use ($params){
						$query->where('person.name','like','%'.$params['name'].'%')->orWhere('person.last_name','like','%'.$params['name'].'%');
					})->where('patient_user.state_id','=',$this->getStatusRegistrado())->whereNull('psychological_assessment.id')->get();
					if(!count($paUsers))
						throw new PsychologicalAssessmentException(['title'=>'No se han encontrado el listado de usuarios','detail'=>'No se han encontrado usuarios con este criterio de busqueda o ya existe una entrevista psicológica creada. Intente nuevamente o comuniquese con el administrador','level'=>'error'],"404");
					

				}
			}
		} else {

			//load Psychologicalassessment
			if (Auth::user()->hasRole('doc-val-psic')) {
				$paUsers = PsychologicalAssessment::where('created_user_id',Auth::user()->id)->get();
			} else{
				$paUsers = PsychologicalAssessment::get();
			}


			if (!$paUsers) {
				throw new PsychologicalAssessmentException(['title'=>'No se han encontrado el listado de Asistencia psicológica','detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"404");
			}
		}
		return $paUsers;
	}



	public function find($field)
	{
		

		if (is_array($field)) {
			if (array_key_exists('patient_user_id', $field)) { 

				if (Auth::user()->hasAnyRole(['admin','dirTerapia'])) 
				{
					$paUser = PsychologicalAssessment::where('patient_user_id',$field['patient_user_id'])->first();
					
				} 
				elseif (Auth::user()->hasRole('doc-val-psic')) 
				{
					$paUser = PsychologicalAssessment::where('patient_user_id',$field['patient_user_id'])->where('created_user_id',Auth::user()->id)->first();
				}
		
			}elseif (array_key_exists('num_identification', $field)) {

				//USADO PARA BUSCAR UNA EVALUACIÓN PSICOLÓGICA POR CÉDULA EN EL MODAL DE CREACIÓN Y EVALUACIÓN PSICOLOGICA
				$paUser = PatientUser::leftJoin('psychological_assessment',function($join){
						$join->on('patient_user.id','=','psychological_assessment.patient_user_id')->whereRaw('psychological_assessment.deleted_at is null');
					})->where('person.num_identification',$field['num_identification'])->where('patient_user.state_id','=',$this->getStatusRegistrado())->whereNull('psychological_assessment.id')->first();
				
				if(!$paUser)
					throw new PsychologicalAssessmentException(['title'=>'No se han encontrado el listado de usuarios','detail'=>'No se han encontrado usuarios con este criterio de busqueda o ya existe una entrevista psicológica creada. Intente nuevamente o comuniquese con el administrador','level'=>'error'],"404");

			} else {

				throw new PsychologicalAssessmentException(['title'=>'No se puede buscar la entrevista psicológica','detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"404");	
			}

		} elseif (is_string($field) || is_int($field)) {
			
			if (Auth::user()->hasAnyRole(['admin','dirTerapia'])) 
			{
				$paUser = PsychologicalAssessment::find($field);
			} 
			elseif (Auth::user()->hasRole('doc-val-psic')) 
			{
				$paUser = PsychologicalAssessment::where('created_user_id',Auth::user()->id)->where('id',$field)->first();
			}


		} else {
			throw new PsychologicalAssessmentException(['title'=>'No se puede buscar la Asistencia psicológica','detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"500");	
		}

		if (!$paUser) throw new PsychologicalAssessmentException(['title'=>'No se puede buscar la Asistencia psicológica','detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"404");	
		
		return $paUser;

	}

	public function save($data)
	{

		$assessment = new PsychologicalAssessment();
		$assessment->fill($data);

		if ($assessment->save()) {
			$key = $assessment->getKey();
			//update status
			$assessment->patientUser->state_id = $this->getStatusValoradoPsicologicamente();
			$assessment->patientUser->save();
			return $this->find($key);
		} else {
			throw new PsychologicalAssessmentException(['title'=>'Ha ocurrido un error al guardar la Asistencia psicológica de '.$data['patient_user_id'],'detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"500");
		}
			
		
	}


	
	public function edit($id,$data)
	{
		$assessment = $this->find($id);
		
		if ($assessment) {

			$assessment->fill($data);
			if($assessment->update()){
				$key = $assessment->getKey();
				//update status
				// $assessment->patientUser->state_id = $this->getStatusValoradoPsicologicamente();
				$assessment->patientUser->save();
				return $this->find($key);
			} else {
				throw new PsychologicalAssessmentException(['title'=>'Ha ocurrido un error al guardar la Asistencia psicológica de '.$data['patient_user_id'],'detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"500");
			}
		} else {
			throw new PsychologicalAssessmentException(['title'=>'Ha ocurrido un error al guardar la Asistencia psicológica de '.$data['patient_user_id'],'detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"500");
		}
		 


	}

	public function remove($id)
	{
		
		$assessment = $this->find($id);
		if ($assessment) {
			$assessment->patientUser->state_id = $this->getStatusRegistrado();
			$assessment->patientUser->save();
			$assessment->delete();
			return true;
		}
		throw new PsychologicalAssessmentException(['title'=>'Ha ocurrido un error al eliminar la Asistencia psicológica ','detail'=>'Intente nuevamente o comuniquese con el administrador','level'=>'error'],"500");
	}

	/**
	 * return default state 
	 */
	public function getStatusValoradoPsicologicamente()
	{
		return  StatePatientUser::select('id')->where('code','valorado_psicologicamente')->first()->id;
	}


	/**
	 * return default state 
	 */
	public function getStatusRegistrado()
	{
		return  StatePatientUser::select('id')->where('code','registrado')->first()->id;
	}
}