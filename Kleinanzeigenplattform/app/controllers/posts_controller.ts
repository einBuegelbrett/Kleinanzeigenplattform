// import type { HttpContext } from '@adonisjs/core/http'

import type {HttpContext} from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";

export default class PostsController {
  public async anmelden({ response, request, view }: HttpContext) {
    const benutzername = request.input('benutzername');
    const passwort = request.input('passwort');

    if(benutzername === null || passwort === null){
      return view.render('pages/anmelden',{error: 'Benutzername oder Passwort falsch'})
    }

    return response.redirect().toRoute('/home');
  }

  public async registrieren({ response, request, view }: HttpContext) {
    const benutzername = request.input('benutzername');
    const email = request.input('email');
    const vorname = request.input('vorname');
    const nachname = request.input('nachname');
    const passwort = request.input('passwort');
    const passwortWiederholen = request.input('passwort_wiederholen');

    if (benutzername === null || email === null || vorname === null || nachname === null || passwort === null || passwortWiederholen === null) {
      return view.render('pages/registrieren', { error: 'Alle Felder müssen ausgefüllt sein' });
    }

    await db.table('user').insert({ username: benutzername, firstname: vorname, lastname: nachname, password: passwort, email: email})
    return response.redirect().toRoute('/home');
  }

public async profil({ view }: HttpContext) {
    return view.render('pages/konto-profil')
  }
}
