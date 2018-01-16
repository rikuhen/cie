<?php

namespace Cie\Http\Controllers;

use Cie\RepositoryInterface\PatientUserRepositoryInterface;
use Cie\Http\Validators\PatientUserValidator;
use Cie\Exceptions\PatientUserException;
use Illuminate\Http\Request;

class PatientUserController extends Controller
{
    
    protected $pUserRepo;


    public function __construct(PatientUserRepositoryInterface $pUserRepo)
    {
        $this->middleware('jwt.auth');
        $this->pUserRepo = $pUserRepo;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = $this->pUserRepo->enum();
        return response()->json(['data'=>$users],200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PatientUserValidator $validator, Request $request)
    {
        try {
            $data = $request->all();
            $user = $this->pUserRepo->save($data);
            return response()->json($user,200);
        } catch (PatientUserException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        
        try {
            $user = $this->pUserRepo->find($id);
            return response()->json($user,200);
        } catch (PatientUserException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }

   
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(PatientUserValidator $validator, Request $request, $id)
    {
        try {
            $user = $this->pUserRepo->edit($id, $request->all());
            return response()->json($user,200);
        } catch (PatientUserException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $removed = $this->pUserRepo->remove($id);
            if ($removed) {
                return response()->json(['exitoso'=>true],200);
            }
        } catch (PatientUserException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }
}