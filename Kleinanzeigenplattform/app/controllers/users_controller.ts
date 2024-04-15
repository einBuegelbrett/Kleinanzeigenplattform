import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import hash from "@adonisjs/core/services/hash";
import app from "@adonisjs/core/services/app";

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
      email: result.email,
      profile_image: result.profile_image
    })

    return response.redirect('/home');
  }

  public async logout({session, response}: HttpContext) {
    session.forget('user')

    return response.redirect('/home/anmelden')
  }

  public async userProfile({session, response, view }: HttpContext) {
    if (session.get('user') === undefined) {
      return response.redirect('/home/anmelden')
    }

    return view.render('pages/konto-profil', { user: session.get('user') })
  }

  public async updateProfile({ view, response, request, session }: HttpContext) {
    try {
      const userId = session.get('user').user_id
      const userBenutzername = session.get('user').username
      let profileImage = request.file('profileImage',{ size: '2mb', extnames: ['jpg', 'png', 'jpeg']})

      if(!profileImage?.isValid){
        profileImage = null;
      } else {
        await profileImage.move(app.publicPath('uploads'), {overwrite: true})
      }

      session.put('user', {
        user_id: userId,
        username: userBenutzername,
        firstname: request.input('vorname'),
        lastname: request.input('nachname'),
        email: request.input('email'),
        profile_image: profileImage? profileImage.fileName : session.get('user').profile_image
      })

      await db.from('user').where('user_id', userId).update({
        email: request.input('email'),
        firstname: request.input('vorname'),
        lastname: request.input('nachname'),
        profile_image: profileImage? profileImage.fileName : session.get('user').profile_image})

    } catch (error) {
      return view.render('pages/konto-profil', { error: 'Fehler bei der Dateneingabe', user: session.get('user')});
    }

    return response.redirect('/home/konto/profil')
  }

  public async conversationList({ response, view, session }: HttpContext) {
    const user = await session.get('user');

    if (user === undefined) {
      return response.redirect('/home/anmelden');
    }

    const conversations = await db.from('message as m')
      .select('m.*', 'l.*', 'u.*')
      .join('listing as l', 'm.listing_id', 'l.listing_id')
      .join('user as u', 'l.user_id', 'u.user_id')
      .where('m.sender_id', user.user_id)
      .groupBy('m.sender_id', 'm.listing_id');

    return view.render('pages/nachrichten-liste', { user: session.get('user'), conversations })
  }
}
