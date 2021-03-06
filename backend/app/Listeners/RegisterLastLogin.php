<?php

namespace Cie\Listeners;

use  Illuminate\Auth\Events\Login;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Carbon\Carbon;

class RegisterLastLogin
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  PatientUserFormCreated  $event
     * @return void
     */
    public function handle(Login $event)
    {
        $event->user->last_login = new Carbon();
        $event->user->update();
    }
}
