import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import hash from "@adonisjs/core/services/hash";

export default class UsersController {
  public async registrierungsForm({ view, response, session }: HttpContext) {
    if (session.get('user') != undefined) {
      return response.redirect('/home')
    }

    return view.render('pages/registrieren')
  }

  public async registrierungsProzess({ view, request }: HttpContext) {
    try {
      const hashedPasswort = await hash.make(request.input('passwort'));
      const passwortOk = await hash.verify(hashedPasswort, request.input('passwort_wiederholen'));

      if(!passwortOk) {
        return view.render('pages/registrieren', { error: 'Passwörter müssen identisch sein' });
      }

      await db.table('user').insert({
        username: request.input('benutzername'),
        email: request.input('email'),
        firstname: request.input('vorname'),
        lastname: request.input('nachname'),
        password: hashedPasswort});
    } catch (error) {
      return view.render('pages/registrieren', { error: 'Fehler bei der Dateneingabe' });
    }

    return view.render('pages/anmelden', {success: 'Sie haben sich erfolgreich registriert!'});
  }

  public async anmeldungsForm({ view, response, session }: HttpContext) {
    if (session.get('user') != undefined) {
      return response.redirect('/home')
    }

    return view.render('pages/anmelden')
  }

  public async anmeldungsProzess({ response, request, view, session }: HttpContext) {
    let result = await db.from('user').select('*').where('username', request.input('benutzername')).first()

    if(!result) {
      return view.render('pages/anmelden', {error: 'Benutzername oder Passwort falsch'})
    }

    const passwordOk = await hash.verify(result.password, request.input('passwort'))

    if(!passwordOk) {
       return view.render('pages/anmelden', {error: 'Benutzername oder Passwort falsch'})
    }

    session.put('user', {
      user_id: result.user_id,
      username: result.username,
      firstname: result.firstname,
      lastname: result.lastname,
      email: result.email
    })

    return response.redirect('/home');
  }

  public async logout({session, response}: HttpContext) {
    session.forget('user')

    return response.redirect('/home/anmelden')
  }
}
