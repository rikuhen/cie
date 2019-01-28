<?php

namespace Cie\Http\Controllers;

use Cie\RepositoryInterface\BuildingRepositoryInterface;
use Cie\Http\Validators\BuildingValidator;
use Cie\Exceptions\BuildingException;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    
    protected $buildingRepo;


    public function __construct(BuildingRepositoryInterface $buildingRepo, Request $request)
    {
        $this->middleware('jwt.auth');
        // $this->middleware('checkrole:admin');
        parent::__construct($request);
        $this->buildingRepo = $buildingRepo;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $building = $this->buildingRepo->enum()->toJson();
        $building = $this->encodeResponse($building);
        return response()->json($building,200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(BuildingValidator $validator, Request $request)
    {
        try {
            $data = $request->all();
            $building = $this->buildingRepo->save($data)->toJson();
            $building = $this->encodeResponse($building);
            return response()->json($building,200);
        } catch (BuildingException $e) {
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
            $building = $this->buildingRepo->find($id)->toJson();
            $building = $this->encodeResponse($building);
            return response()->json($building,200);
        } catch (BuildingException $e) {
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
    public function update(BuildingValidator $validator, Request $request, $id)
    {
        try {
            $building = $this->buildingRepo->edit($id, $request->all())->tojson();
            $building = $this->encodeResponse($building);
            return response()->json($building,200);
        } catch (BuildingException $e) {
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
            $removed = $this->buildingRepo->remove($id);
            if ($removed) {
                $removed = $this->encodeResponse(json_encode(['exitoso'=>true]));
                return response()->json($removed,200);
            }
        } catch (BuildingException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }
}
