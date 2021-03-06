<?php

namespace Cie\Http\Controllers;

use Cie\RepositoryInterface\PhysicalAssessmentRepositoryInterface;
use Cie\Http\Validators\PhysicalAssessmentValidator; //TODO
use Cie\Exceptions\PhysicalAssessmentException;
use Illuminate\Http\Request;
use PDF;



class PhysicalAssessmentController extends Controller
{
    
    protected $psAsse;


    public function __construct(PhysicalAssessmentRepositoryInterface $psAsse, Request $request)
    {
        $this->middleware('jwt.auth')->except('generatePdF');
        // $this->middleware('checkrole:admin,doc-val-psic,dirTerapia');
        parent::__construct($request);
        $this->psAsse = $psAsse;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $psAsse = $this->psAsse->enum($request->all())->toJson();
        $psAsse = $this->encodeResponse($psAsse);
        return response()->json($psAsse,200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PhysicalAssessmentValidator $validator, Request $request)
    {
        try {
            $data = $request->all();
            $psAsse = $this->psAsse->save($data)->toJson();
            $psAsse = $this->encodeResponse($psAsse);
            return response()->json($psAsse,200);
        } catch (PhysicalAssessmentException $e) {
            $error = $this->encodeResponse($e->getMessage());
            return response()->json($error,$e->getCode());
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
            $psAsse = $this->psAsse->find($id)->toJson();
            $psAsse = $this->encodeResponse($psAsse);
            return response()->json($psAsse,200);
        } catch (PhysicalAssessmentException $e) {

            $error = $this->encodeResponse(json_encode(['error'=>$e->getMessage()]));
            return response()->json($error,$e->getCode());
        }
    }

   
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(PhysicalAssessmentValidator $validator, Request $request, $id)
    {
        try {
            $data = $request->all();
            
            $psAsse = $this->psAsse->edit($id, $data)->toJson();
            $psAsse = $this->encodeResponse($psAsse);
            return response()->json($psAsse,200);
        } catch (PhysicalAssessmentException $e) {
            $error = $this->encodeResponse($e->getMessage());
            return response()->json($error,$e->getCode());
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
            $removed = $this->psAsse->remove($id);
            if ($removed) {
                $psAsse = $this->encodeResponse(json_encode(['exitoso'=>true]));
                return response()->json($psAsse,200);
            }
        } catch (PhysicalAssessmentException $e) {
            return response()->json($e->getMessage(),$e->getCode());
        }
    }

    public function generatePdF($id, Request $request)
    {
        
        $physicalAss =  $this->psAsse->find($id);
        // return view('pdf.puserinscriptions',compact('pUser'));
        if ($request->has('download') && $request->get('download')) {
            return PDF::loadView('pdf.physical-ass',compact('physicalAss'))->download('Valoración Física de  '.$physicalAss->last_name . ' ' . $physicalAss->name.'.pdf');
        } else {
            return PDF::loadView('pdf.physical-ass',compact('physicalAss'))->stream('Valoración Física de  ' . $physicalAss->last_name . ' ' . $physicalAss->name.'.pdf');
            
        }
    }
}