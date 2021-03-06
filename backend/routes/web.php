<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
 
});

Route::get('test','ReportController@index');


Route::group(['prefix'=>'api'],function() {

	Route::get('dashboard','DashboardController@index');

	Route::group(['prefix'=>'authenticate'],function(){
		Route::post('login','Auth\LoginController@login');
		// Route::post('logout','Auth\AuthenticateController@logout');
		Route::get('verify','Auth\LoginController@verify');
		Route::get('refresh','Auth\LoginController@refresh');
	});


	Route::get('users/import','PatientUserController@import');
	Route::get('user/person/{personId}','UserController@finUserByPerson');
	Route::resource('users','UserController',['except'=>['create']]);
	Route::resource('modules','ModuleController',['except'=>['create']]);
	Route::resource('permissions','PermissionController',['except'=>['create']]);
	Route::resource('typepermissions','PermissionTypeController',['except'=>['create']]);
	Route::resource('roles','RoleController',['except'=>['create']]);
	Route::resource('grades-disability','GradeOfDisabilityController',['except'=>['create']]);

	Route::get('pUsers/getParent','PatientUserController@getParent');
	//custom route for patient user inscripton
	Route::resource('pUsers','PatientUserController',['except'=>['create','update']]);
	Route::post('pUsers/{pUserId}/update','PatientUserController@update');
	Route::get('pUsers/print-inscription/{pUserId}','PatientUserController@generatePdF');
	Route::resource('psycho-assessments','PsychologicalAssessmentController',['except'=>['create']]);
	Route::get('psycho-assessments/print/{pUserId}','PsychologicalAssessmentController@generatePdF');
	Route::resource('medical-assessments','MedicalAssessmentController',['except'=>['create']]);
	
	Route::resource('physical-assessments','PhysicalAssessmentController',['except'=>['create']]);
	Route::get('physical-assessments/print/{pUserId}','PhysicalAssessmentController@generatePdF');
	
	Route::resource('provinces','ProvinceController',['except'=>['create']]);
	Route::resource('cities','CityController',['except'=>['create']]);
	Route::resource('parishies','ParishController',['except'=>['create']]);
	Route::resource('pathologies','PathologyController',['except'=>['create']]);
	Route::resource('pertypes','PersonTypeController',['except'=>['create']]);
	Route::resource('identitypes','IdentificationTypeController',['except'=>['create']]);
	Route::resource('stapatients','StatePatientUserController',['except'=>['create']]);
    //////////////
    Route::resource('carousels','CarouselController',['except'=>['create']]);
    Route::resource('requests','RequestController',['except'=>['create','store']]);
	///////////////
	
	//schedules
    Route::resource('buildings','BuildingController',['except'=> ['create']]);
    Route::resource('buildings.therapies','BuildingTherapyController',['except'=> ['create']]);
    Route::resource('therapies','TherapyController',['except'=>['create']]);
    Route::resource('thavailables','BuildingTherapyAvailableController',['except'=>['create']]);
    Route::resource('type-therapies','TypeTherapyController',['except'=>['create']]);
    Route::resource('buildingtherapyUser','BuildingTherapyUserController',['except'=>['create']]);
    Route::resource('therapists','TherapistController',['only'=>['index']]);
    Route::resource('holidays','HoliDayController',['except' => ['create']]);

    //helpers
	Route::get('validator/{method}','HelperController@validation');
	Route::get('menu','HelperController@loadMenu');
	Route::get('load-parameter/{key}','HelperController@loadKeysParameter');
});