import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import hash from "@adonisjs/core/services/hash";
import app from "@adonisjs/core/services/app";
import { cuid } from '@adonisjs/core/helpers'

export default class UsersController {
  public async registrierungsForm({ view, response, session }: HttpContext) {
    if (session.get('user') != undefined) {
      return response.redirect('/home')
    }

    return view.render('pages/authentication/registrieren')
  }

  public async registrierungsProzess({ view, request }: HttpContext) {
    try {
      const hashedPasswort = await hash.make(request.input('passwort'));
      const passwortOk = await hash.verify(hashedPasswort, request.input('passwort_wiederholen'));

      if(!passwortOk) {
        return view.render('pages/authentication/registrieren', { error: 'Passwörter müssen identisch sein' });
      }

      // database puts the default profile picture
      await db.table('user').insert({
        username: request.input('benutzername'),
        email: request.input('email'),
        firstname: request.input('vorname'),
        lastname: request.input('nachname'),
        password: hashedPasswort });

    } catch (error) {
      return view.render('pages/authentication/registrieren', { error: 'Fehler bei der Dateneingabe' });
    }

    return view.render('pages/authentication/anmelden', {success: 'Sie haben sich erfolgreich registriert!'});
  }

  public async anmeldungsForm({ view, response, session }: HttpContext) {
    if (session.get('user') != undefined) {
      return response.redirect('/home')
    }

    return view.render('pages/authentication/anmelden')
  }

  public async anmeldungsProzess({ response, request, view, session }: HttpContext) {
    let result = await db.from('user').select('*').where('username', request.input('benutzername')).first()

    if(!result) {
      return view.render('pages/authentication/anmelden', {error: 'Benutzername oder Passwort falsch'})
    }

    const passwordOk = await hash.verify(result.password, request.input('passwort'))

    if(!passwordOk) {
       return view.render('pages/authentication/anmelden', {error: 'Benutzername oder Passwort falsch'})
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

    return view.render('pages/user/konto-profil', { user: session.get('user') })
  }

  public async updateProfile({ view, response, request, session }: HttpContext) {
    try {
      const userId = session.get('user').user_id
      const userBenutzername = session.get('user').username
      let profileImage = request.file('profileImage',{ size: '2mb', extnames: ['jpg', 'png', 'jpeg']})

      if(!profileImage?.isValid){
        profileImage = null;
      } else {
        await profileImage.move(app.publicPath('uploads'), { name: `${cuid()}.${profileImage.extname}`, overwrite: true })
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
      return view.render('pages/user/konto-profil', { error: 'Fehler bei der Dateneingabe', user: session.get('user')});
    }

    return response.redirect('/home/konto/profil')
  }

  public async conversationList({ response, view, session }: HttpContext) {
    const user = await session.get('user');

    if (user === undefined) {
      return response.redirect('/home/anmelden');
    }

    const allConversations = await db.from('message as m')
      .select('m.sender_id', 'l.listing_id', 'l.title', 'u.user_id as receiver_id', 'u.username as receiver_username', 's.username as sender_username')
      .join('listing as l', 'm.listing_id', 'l.listing_id')
      .join('user as u', 'l.user_id', 'u.user_id')
      .join('user as s', 'm.sender_id', 's.user_id') // Join to get sender username
      .where('m.sender_id', user.user_id)
      .whereNot('l.user_id', user.user_id) // Exclude where user_id equals sender_id
      .union(builder => {
        builder.select('m.sender_id', 'l.listing_id', 'l.title', 'u.user_id as receiver_id', 'u.username as receiver_username', 's.username as sender_username')
          .from('message as m')
          .join('listing as l', 'm.listing_id', 'l.listing_id')
          .join('user as u', 'l.user_id', 'u.user_id')
          .join('user as s', 'm.sender_id', 's.user_id') // Join to get sender username
          .where('l.user_id', user.user_id)
          .groupBy('l.user_id', 'm.listing_id');
      });

    return view.render('pages/communication/nachrichten-liste', { user: session.get('user'), allConversations })
  }
}
