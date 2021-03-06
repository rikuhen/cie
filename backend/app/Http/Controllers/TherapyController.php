<?php

namespace Cie\Http\Controllers;

use Cie\RepositoryInterface\TherapyRepositoryInterface;
use Cie\Http\Validators\TherapyValidator;
use Cie\Exceptions\TherapyException;
use Illuminate\Http\Request;

class TherapyController extends Controller
{
    
    protected $therapyRepo;


    public function __construct(TherapyRepositoryInterface $therapyRepo, Request $request)
    {
        $this->middleware('jwt.auth');
        // $this->middleware('checkrole:admin');
        parent::__construct($request);
        $this->therapyRepo = $therapyRepo;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $building = $this->therapyRepo->enum()->toJson();
        $building = $this->encodeResponse($building);
        return response()->json($building,200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(TherapyValidator $validator, Request $request)
    {
        try {
            $data = $request->all();
            $building = $this->therapyRepo->save($data)->toJson();
            $building = $this->encodeResponse($building);
            return response()->json($building,200);
        } catch (TherapyException $e) {
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
            $building = $this->therapyRepo->find($id)->toJson();
            $building = $this->encodeResponse($building);
            return response()->json($building,200);
        } catch (TherapyException $e) {
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
    public function update(TherapyValidator $validator, Request $request, $id)
    {
        try {
            $building = $this->therapyRepo->edit($id, $request->all())->tojson();
            $building = $this->encodeResponse($building);
            return response()->json($building,200);
        } catch (TherapyException $e) {
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
            $removed = $this->therapyRepo->remove($id);
            if ($removed) {
                $removed = $this->encodeResponse(json_encode(['exitoso'=>true]));
                return response()->json($removed,200);
            }
        } catch (TherapyException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }
}
