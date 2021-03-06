<?php

namespace Cie\Models;

use  Illuminate\Database\Eloquent\SoftDeletes;

class Therapy extends BaseModel
{
    protected $table = "therapy";

    protected $dates = ['deleted_at'];

    protected $with = ['type','buildingTherapies'];

    protected $primaryKey = "id";

    // protected $casts = [
    //     'schedule' => 'array',
    // ];

    protected $fillable = [
    	'name',
        'code',
        'description',
        'image',
        'type_therapy_id'
    ];

    public function type() {
        return $this->belongsTo('Cie\Models\TypeTherapy','type_therapy_id');
    }

    public function buildingTherapies()
    {
        return $this->hasMany('Cie\Models\BuildingTherapy','therapy_id');
    }

    public static function boot()
    {
        $istance = new Static;
        parent::boot();
        static::saving(function($therapy) use($istance){
            $therapy->code =  str_slug($therapy->name);
        });

        static::updating(function($therapy) use($istance) {
            $therapy->code =  str_slug($therapy->name);
        });
    }
}
