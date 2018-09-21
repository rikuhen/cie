<?php

namespace Cie\Models;


/**
 * 
 */
class MedicalAssessment extends BaseModel
{
	
	protected $table = "medical_assessment";

	protected $primaryKey = "id";

	protected $with = ['patientUser'];

	protected $fillable = [
    	'patient_user_id',
    	'date_eval',
        'personal_data_procedence',
        'personal_data_residence',
        'pre_history_mother_age',
        'pre_natal_gestational_num',
        'pre_natal_desired_pregnancy',
        'pre_natal_desired_pregnancy_why',
        'pre_natal_diseases_pregnancy',
        'pre_natal_perinatal_history_is_eutocic',
        'pre_natal_perinatal_history_is_distocic',
        'pre_natal_perinatal_history_why',
        'pre_natal_perinatal_history_eg',
        'pre_natal_complications_during_childbirth',
        'pre_natal_complications_during_childbirth_explain',
        'pre_natal_hypoxia_during_childbirth',
        'pre_natal_oxygen_during_childbirth',
        'pre_natal_jaundice_during_childbirth',
        'pre_natal_incubator',
        'pre_natal_incubator_days',
        'pre_natal_cried_birth',
        'pre_natal_weight_child_birth',
        'pre_natal_height_child_birth',
        'pre_natal_other_complications',
        'pre_natal_give_up_with_mother',
        'pre_natal_child_onfalorrexis',
        'pre_natal_child_onfalitis',
        'post_natal_breastmilk',
        'post_natal_formula',
        'post_natal_has_ablactacion',
        'post_natal_immunization_bcg',
        'post_natal_immunization_polio',
        'post_natal_immunization_triple',
        'post_natal_immunization_others',
        'post_natal_nutrition_first_dentition',
        'post_natal_nutrition_hospitalization',
        'post_natal_social_smile',
        'post_natal_hold_objects',
        'post_natal_raise_head',
        'post_natal_hold_head',
        'post_natal_he_turns',
        'post_natal_seat_down',
        'post_natal_crawl',
        'post_natal_stand_up',
        'post_natal_walks',
        'post_natal_run',
        'post_natal_go_up_and_down_stairs',
        'post_natal_hand_clamp',
        'post_natal_trace',
        'post_natal_wrinkled',
        'post_natal_scribble',
        'post_natal_colorize',
        'post_natal_babbles',
        'post_natal_babbles_age',
        'post_natal_first_words',
        'post_natal_first_words_age',
        'post_natal_control_esfinter_day',
        'post_natal_control_esfinter_night',
        'post_natal_evolution_disease',
        'post_natal_evolution_disease_current',
        'post_natal_medicaments',
        'post_natal_a_p_p',
        'post_natal_a_p_f',
        'post_natal_alergies',
        'equipment_respiratory_cardio',
        'equipment_respiratory_swallow_easily',
        'equipment_respiratory_diarrhea',
        'equipment_respiratory_threw_up',
        'equipment_respiratory_constipation',
        'equipment_urinary',
        'equipment_urinary_menarche',
        'equipment_urinary_cycle_duration',
        'equipment_urinary_dysmenorrhea',
        'equipment_urinary_pubarca',
        'equipment_urinary_telarca',
    	'equipment_nervius_hiperactive',
    	'equipment_nervius_irritable',
		'equipment_nervius_nervius',
		'equipment_nervius_quiet',
		// 'equipment_skeletal_muscle',
		'development_arrest',
		'general_system_asthenia',
		'general_system_adynamia',
		'general_system_weightloss',
		'general_system_anorexy',
		'general_system_bulimia',
		'skin_facer_fever',
		'skin_facer_dry',
		'skin_facer_sweating',
		'skin_facer_skin_lesion',
		'skin_facer_nail',
		'skin_facer_hairs',
		'tooth_description',
		'tooth_bruxism',
		'general_inspection_fr',
		'general_inspection_fc',
		'general_inspection_to',
		'general_inspection_weight',
		'general_inspection_height',
		'general_inspection_pc',
		'general_inspection_pt',
		'general_inspection_apparent_age',
		'general_inspection_chronological_age',
		'general_inspection_integument_normal',
		'general_inspection_integument_ictericia',
		'general_inspection_integument_cianosis',
		'general_inspection_integument_ruddiness',
		'general_inspection_integument_sensibility',
		'general_inspection_attitude_normal',
		'general_inspection_attitude_forced',
		'general_inspection_attitude_indifferent',
		'general_inspection_position',
		'general_inspection_facies',
		'general_inspection_conformation_good_formed',
		'general_inspection_conformation_macrocephaly',
		'general_inspection_conformation_microcephaly',
		'general_inspection_conformation_hydrocephalus',
		'general_inspection_conformation_absence_limbs',
		'general_inspection_moves_voluntary',
		'general_inspection_moves_involuntary',
		'general_inspection_moves_uncoordinated',
		'general_inspection_moves_tics',
		'general_inspection_moves_convulsive',
		'general_inspection_head',
		'general_inspection_eye',
		'general_inspection_ear',
		'general_inspection_hearing',
		'general_inspection_noise',
		'general_inspection_noise_secretion',
		'general_inspection_mouth',
		'general_inspection_neck',
		'general_inspection_truck',
		'general_inspection_type_chest',
		'general_inspection_csps_chest',
		'general_inspection_rscs_chest',
		'general_inspection_spine',
		'general_inspection_abdomen',
		'general_inspection_rectal_anus',
		'general_inspection_upper_lower_extremities',
		'general_inspection_dissymmetry',
		'general_inspection_march',
		'current_gross_motricity',
		'current_gross_motricity_sits',
		'current_gross_motricity_walks',
		'current_gross_motricity_run',
		'current_gross_motricity_go_up_down_stairs',
		'current_gross_motricity_lance',
		'current_gross_motricity_grab',
		'current_fine_motricity',
		'current_fine_motricity_pin',
		'current_fine_motricity_pressure',
		'current_fine_motricity_tear',
		'current_fine_motricity_log',
		'current_fine_motricity_cut',
		'current_fine_motricity_wrinkle_paste',
		'current_fine_motricity_doodle',
		'current_fine_motricity_color',
		'current_fine_motricity_thread',
		'current_fine_motricity_puzzle_weapon',
		'current_reflexes_ost_surface',
		'current_reflexes_deep',
		'current_pathology',
		'current_pathology_babinski',
		'current_pathology_hoffman',
		'current_pathology_coreas',
		'current_pathology_clonus',
		'current_pathology_distonias',
		'current_coordination',
		'current_coordination_alternating_movements',
		'current_coordination_tremors',
		'current_sensory_motor_mov_voluntary',
		'current_sensory_motor_mov_involuntary',
		'current_sensory_motor_muscle_development',
		'current_sensory_motor_weakness',
		'current_sensory_motor_muscular_tone',
		'current_sensory_motor_muscular_strength',
		'current_sensory_motor_rigidity',
		'current_sensory_motor_spasticity',
		'current_sensory_motor_myoclonus',
		'current_sensory_motor_athetosis',
		'current_sensory_motor_hypersensitivity',
		'current_sensory_motor_fasciculation',
		'current_language_develop_have_difficult',
		'current_language_develop_expressive',
		'current_language_develop_comprenssive',
		'current_cognitive_develop_attention',
		'current_cognitive_develop_comprention',
		'current_cognitive_develop_school_level',
		'current_cognitive_develop_recognize',
		'current_cognitive_develop_write',
		'current_cognitive_develop_write_his_name',
		'current_cognitive_develop_recognizes_vowels',
		'current_cognitive_develop_recognizes_consonants',
		'current_cognitive_develop_recognizes_figures',
		'current_social_develop_conduct_shouts',
		'current_social_develop_conduct_shouts_cries_easily',
		'current_social_develop_conduct_shouts_laugh_easily',
		'current_social_develop_conduct_assault',
		'current_social_develop_conduct_self_assault',
		'current_social_develop_conduct_quiet',
		'current_social_develop_conduct_inquiet',
		'current_social_develop_conduct_anxious',
		'current_social_develop_conduct_hiperactive',
		'current_social_develop_conduct_nervius',
		'current_social_develop_irritable',
		'current_social_develop_introvert',
		'current_social_develop_hobbies',
		'current_social_develop_seek_contact_other_people',
		'current_social_develop_integrate_with_classmates',
		'current_social_develop_altered_with_noise',
		'current_social_develop_like_music',
		'current_social_develop_observation',
		'current_social_develop_sleep_right_away',
		'current_social_develop_whoo_sleep_with',
		'current_social_develop_wake_up',
		'current_personal_develop',
		'current_personal_develop_bath_alone',
		'current_personal_develop_dress_alone',
		'current_personal_develop_undress_alone',
		'current_personal_develop_tie_the_shoes',
		'current_personal_develop_eat_alone',
		'current_personal_develop_observation',
		'current_perceptive_develop_auditive',
		'current_perceptive_develop_visual',
		'current_perceptive_develop_tactile',
		'current_perceptive_the_self_follow_orders',
		'current_perceptive_give_me',
		'current_perceptive_take',
		'current_perceptive_pulls_out',
		'current_perceptive_save',
		'current_perceptive_bring',
		'current_spacial_notion',
		'current_spacial_notion_up',
		'current_spacial_notion_down',
		'current_spacial_notion_left',
		'current_spacial_notion_right',
		'current_spacial_notion_in',
		'current_spacial_notion_out',
		'current_spacial_notion_open',
		'current_spacial_notion_closed',
		'current_spacial_notion_behind',
		'current_spacial_notion_ahead',
		'current_structural_familiar_who_live',
		'current_structural_familiar_have_brothers',
		'current_structural_familiar_num_brothers',
		'current_structural_familiar_brothers_relation',
		'current_structural_familiar_live_other_familiar',
		'current_structural_familiar_integrate_with_familiar_activities',
		'current_needs_feeling_express',
		'current_needs_feeling_how_express',
		'current_needs_feeling_express_strong_emotions',
		'current_needs_feeling_how_reassure_him',
		'current_needs_feeling_manifest_sweetie',
		'current_socio_economic_report_is_own',
		'current_socio_economic_report_is_cement',
		'current_socio_economic_report_one_ambient',
		'current_socio_economic_report_street_lighting',
		'current_socio_economic_report_rented',
		'current_socio_economic_report_wood',
		'current_socio_economic_report_environment_guy',
		'current_socio_economic_report_drinking_water',
		'current_socio_economic_report_familiar',
		'current_socio_economic_report_mixed',
		'current_socio_economic_report_sewerage',
		'current_socio_economic_report_electricity',
		'observation',
		'impretion_diagnostic',
		'definitive_diagnostic',
		'post_natal_thick_motor',
		'post_natal_fine_motor',
		'created_user_id'
    ];

    protected $casts = [
    	'patient_user_id' => 'int',
        'pre_history_mother_age' => 'int',
        'pre_natal_gestational_num' => 'int',
        'pre_natal_desired_pregnancy' => 'int',
        'pre_natal_perinatal_history_is_eutocic' => 'int',
        'pre_natal_perinatal_history_is_distocic'  => 'int',
        'pre_natal_hypoxia_during_childbirth'  => 'int',
        'pre_natal_oxygen_during_childbirth' => 'int',
        'pre_natal_jaundice_during_childbirth' => 'int',
        'pre_natal_incubator' => 'int',
        'pre_natal_incubator_days' => 'int',
        'pre_natal_cried_birth'  => 'int',
        'pre_natal_weight_child_birth'  => 'float',
        'pre_natal_height_child_birth' => 'float',
        'pre_natal_give_up_with_mother' => 'int',
        'post_natal_immunization_bcg' => 'int',
        'post_natal_immunization_polio' => 'int',
        'post_natal_immunization_triple' => 'int',
        'post_natal_social_smile' => 'int',
        'post_natal_hold_objects' => 'int',
        'post_natal_raise_head' => 'int',
        'post_natal_hold_head' => 'int',
        'post_natal_he_turns' => 'int',
        'post_natal_seat_down' => 'int',
        'post_natal_crawl' => 'int',
        'post_natal_stand_up' => 'int',
        'post_natal_walks' => 'int',
        'post_natal_run' => 'int',
        'post_natal_go_up_and_down_stairs' => 'int',
        'post_natal_hand_clamp' => 'int',
        'post_natal_trace' => 'int',
        'post_natal_wrinkled' => 'int',
        'post_natal_scribble'=> 'int',
        'post_natal_colorize' => 'int',
        'post_natal_babbles' => 'int',
        'post_natal_babbles_age' => 'int',
        'post_natal_first_words_age' => 'int',       
        'equipment_respiratory_swallow_easily'=> 'int' ,
        'equipment_respiratory_diarrhea' => 'int',
        'equipment_respiratory_threw_up' => 'int',
        'equipment_respiratory_constipation' => 'int',
        'equipment_nervius_hiperactive' => 'int',
    	'equipment_nervius_irritable' => 'int',
		'equipment_nervius_nervius' => 'int',
		'equipment_nervius_quiet' => 'int',
		'general_system_asthenia' => 'int',
		'general_system_adynamia' => 'int',
		'general_system_weightloss' => 'int',
		'general_system_anorexy' => 'int',
		'general_system_bulimia' => 'int',
		'skin_facer_fever'=> 'int',
		'skin_facer_dry'=> 'int',
		'skin_facer_sweating'=> 'int',
		'tooth_bruxism' => 'int',
		'general_inspection_apparent_age' => 'int',
		'general_inspection_chronological_age' => 'int',
		'general_inspection_integument_normal'=> 'int',
		'general_inspection_integument_ictericia'=> 'int',
		'general_inspection_integument_cianosis'=> 'int',
		'general_inspection_integument_ruddiness'=> 'int',
		'general_inspection_integument_sensibility'=> 'int',
		'general_inspection_attitude_normal'=> 'int',
		'general_inspection_attitude_forced'=> 'int',
		'general_inspection_attitude_indifferent'=> 'int',
		'general_inspection_conformation_good_formed'=> 'int',
		'general_inspection_conformation_macrocephaly'=> 'int',
		'general_inspection_conformation_microcephaly'=> 'int',
		'general_inspection_conformation_hydrocephalus'=> 'int',
		'general_inspection_moves_voluntary'=> 'int',
		'general_inspection_moves_involuntary'=> 'int',
		'general_inspection_moves_uncoordinated'=> 'int',
		'general_inspection_noise_secretion' => 'int',
		'current_gross_motricity_sits' => 'int',
		'current_gross_motricity_walks' => 'int',
		'current_gross_motricity_run' => 'int',
		'current_gross_motricity_go_up_down_stairs' => 'int',
		'current_gross_motricity_lance' => 'int',
		'current_gross_motricity_grab' => 'int',
		'current_fine_motricity_pin' => 'int',
		'current_fine_motricity_pressure'=> 'int',
		'current_fine_motricity_tear'=> 'int',
		'current_fine_motricity_log'=> 'int',
		'current_fine_motricity_cut'=> 'int',
		'current_fine_motricity_wrinkle_paste'=> 'int',
		'current_fine_motricity_doodle'=> 'int',
		'current_fine_motricity_color'=> 'int',
		'current_fine_motricity_thread',
		'current_fine_motricity_puzzle_weapon'=> 'int',
		'current_pathology_babinski'=> 'int',
		'current_pathology_hoffman'=> 'int',
		'current_pathology_coreas'=> 'int',
		'current_pathology_clonus'=> 'int',
		'current_pathology_distonias'=> 'int',
		'current_coordination_alternating_movements'=> 'int',
		'current_coordination_tremors'=> 'int',
		'current_language_develop_have_difficult' => 'int',
		// 'current_cognitive_develop_recognize'=> 'int',
		// 'current_cognitive_develop_write'=> 'int',
		// 'current_cognitive_develop_write_his_name'=> 'int',
		'current_cognitive_develop_recognizes_vowels'=> 'int',
		'current_cognitive_develop_recognizes_consonants'=> 'int',
		'current_cognitive_develop_recognizes_figures'=> 'int',
		'current_social_develop_conduct_shouts'=> 'int',
		'current_social_develop_conduct_shouts_cries_easily'=> 'int',
		'current_social_develop_conduct_shouts_laugh_easily'=> 'int',
		'current_social_develop_conduct_assault'=> 'int',
		'current_social_develop_conduct_self_assault'=> 'int',
		'current_social_develop_conduct_quiet'=> 'int',
		'current_social_develop_conduct_inquiet'=> 'int',
		'current_social_develop_conduct_anxious'=> 'int',
		'current_social_develop_conduct_hiperactive'=> 'int',
		'current_social_develop_conduct_nervius'=> 'int',
		'current_social_develop_irritable'=> 'int',
		'current_social_develop_introvert'=> 'int',
		'current_social_develop_seek_contact_other_people'=> 'int',
		'current_social_develop_integrate_with_classmates'=> 'int',
		'current_social_develop_altered_with_noise'=> 'int',
		'current_social_develop_like_music'=> 'int',
		'current_social_develop_sleep_right_away'=> 'int',
		// 'current_social_develop_wake_up' => 'int',
		'current_personal_develop_bath_alone'=> 'int',
		'current_personal_develop_dress_alone'=> 'int',
		'current_personal_develop_undress_alone'=> 'int',
		'current_personal_develop_tie_the_shoes'=> 'int',
		'current_personal_develop_eat_alone'=> 'int',
		'current_perceptive_give_me' => 'int',
		'current_perceptive_take' => 'int',
		'current_perceptive_pulls_out' => 'int',
		'current_perceptive_save' => 'int',
		'current_perceptive_bring' => 'int',
		'current_spacial_notion_up'=> 'int',
		'current_spacial_notion_down'=> 'int',
		'current_spacial_notion_left'=> 'int',
		'current_spacial_notion_right'=> 'int',
		'current_spacial_notion_in'=> 'int',
		'current_spacial_notion_out'=> 'int',
		'current_spacial_notion_open'=> 'int',
		'current_spacial_notion_closed'=> 'int',
		'current_spacial_notion_behind'=> 'int',
		'current_spacial_notion_ahead'=> 'int',
		'current_structural_familiar_have_brothers' => 'int',
		'current_structural_familiar_num_brothers' => 'int',
		'current_structural_familiar_integrate_with_familiar_activities' =>'int',
		'current_needs_feeling_express' =>'int',
		'current_needs_feeling_manifest_sweetie'=> 'int',
		'current_socio_economic_report_is_own'=> 'int',
		'current_socio_economic_report_is_cement'=> 'int',
		'current_socio_economic_report_one_ambient'=> 'int',
		'current_socio_economic_report_street_lighting'=> 'int',
		'current_socio_economic_report_rented'=> 'int',
		'current_socio_economic_report_wood'=> 'int',
		'current_socio_economic_report_environment_guy'=> 'int',
		'current_socio_economic_report_drinking_water'=> 'int',
		'current_socio_economic_report_familiar'=> 'int',
		'current_socio_economic_report_mixed'=> 'int',
		'current_socio_economic_report_sewerage'=> 'int',
		'current_socio_economic_report_electricity'=> 'int',
    ];

     public function patientUser()
    {
        return $this->belongsTo('Cie\Models\PatientUser','patient_user_id');
    }
}