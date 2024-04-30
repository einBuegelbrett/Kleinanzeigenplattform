import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import hash from "@adonisjs/core/services/hash";
import app from "@adonisjs/core/services/app";
import mail from '@adonisjs/mail/services/main'
import { cuid } from '@adonisjs/core/helpers'
import env from "#start/env";
import User from "#models/user";

export default class UsersController {
  public async getSignInPage({ view, response, session }: HttpContext) {
    if (session.get('user') != undefined) {
      return response.redirect('/home')
    }

    return view.render('pages/authentication/signin')
  }

  public async signInProcess({ view, request }: HttpContext) {
    try {
      const user = new User();
      user.firstname = await request.input('firstname')
      user.lastname = await request.input('lastname')
      user.password = await request.input('password')
      user.email = await request.input('email')
      user.username = await request.input('username')
      user.token = cuid()

      if(user.password === request.input('repeat_password')) {
        await user.save()
      } else {
        return view.render('pages/authentication/signin', { error: 'Passwort stimmt nicht überein' })
      }

      const sender = `${env.get("MAIL_USERNAME")}`;
      const urlName = `${env.get("APP_URL")}/home/registrieren/bestaetigen/${user.user_id}/${user.token}`;

      await mail.send((message) => {
        message
          .to(user.email)
          .from(sender)
          .subject('Bestätigungsmail')
          .htmlView('email_template/confirmation-mail', {
            urlName
          })
      })

    } catch (error) {
      return view.render('pages/authentication/signin', { error : 'Fehler bei der Registrierung'});
    }

    return view.render('pages/authentication/login', {success: 'Sie haben sich erfolgreich registriert! Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einzuloggen.'});
  }

  public async confirmationMail({ view, params, response }: HttpContext) {
    try {
      const user = await User.find(params.user_id)

      if (!user) {
        return response.redirect('/home/registrieren')
      }

      if (user.token === params.token) {
        user.verified = true;
        await user.save()
        return view.render('pages/authentication/login', { success: 'E-Mail-Adresse bestätigt, bitte anmelden.' })
      } else {
        return view.render('pages/authentication/login', { error: 'Invalider Token.' });
      }
    } catch (error) {
      return view.render('pages/authentication/login', { error: 'Fehler bei der Bestätigung der E-Mail-Adresse' });
    }
  }

  public async getLogInPage({ view, response, session }: HttpContext) {
    if (session.get('user') != undefined) {
      return response.redirect('/home')
    }

    return view.render('pages/authentication/login')
  }

  public async logInProcess({ response, request, view, session }: HttpContext) {
    try {
      const user = await User.findBy('username', request.input('username'))

      if(!user) {
        return view.render('pages/authentication/login', { error: 'Benutzername oder Passwort falsch' })
      }

      if(!user.verified) {
        return view.render('pages/authentication/login', { error: 'Bitte bestätigen Sie Ihre E-Mail-Adresse' })
      }

      const verifyPassword = await hash.verify(user.password, request.input('password'))

      if(verifyPassword) {
        session.put('user', {
          user_id: user.user_id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          profile_image: user.profile_picture
        })

        return response.redirect('/home');
      } else {
         return view.render('pages/authentication/login', {error: 'Benutzername oder Passwort falsch'})
      }
    } catch (error) {
      return view.render('pages/authentication/login', {error: 'Anmeldung fehlgeschlagen'})
    }
  }

  public async logOut({session, response}: HttpContext) {
    session.forget('user')

    return response.redirect('/home/anmelden')
  }

  public async getProfile({session, response, view }: HttpContext) {
    if (session.get('user') === undefined) {
      return response.redirect('/home/anmelden')
    }

    return view.render('pages/user/konto-profil', { user: session.get('user') })
  }

  public async updateProfile({ view, request, session }: HttpContext) {
    try {
      const user = await User.findBy('user_id', session.get('user').user_id)

      if(!user) {
        return view.render('pages/authentication/login', { error: 'Fehler beim Laden des Profils' })
      }

      let profilePicture = request.file('profile_picture',{ size: '2mb', extnames: ['jpg', 'png', 'jpeg']})

      if(!profilePicture?.isValid){
        profilePicture = null;
      } else {
        await profilePicture.move(app.publicPath('uploads'), { name: `${cuid()}.${profilePicture.extname}`, overwrite: true })
      }

      user.email = await request.input('email')
      user.firstname = await request.input('firstname')
      user.lastname = await request.input('lastname')
      user.profile_picture = profilePicture? profilePicture.fileName : await session.get('user').profile_image

      session.put('user', {
        user_id: user.user_id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profile_image: profilePicture? profilePicture.fileName : session.get('user').profile_image
      })

      await user.save()

      return view.render('pages/user/konto-profil', { success: 'Profil erfolgreich aktualisiert', user: session.get('user')});
    } catch (error) {
      return view.render('pages/user/konto-profil', { error: 'Fehler bei der Dateneingabe', user: session.get('user')});
    }
  }

  public async conversationList({ response, view, session }: HttpContext) {
    const user = await User.findBy('user_id', session.get('user').user_id)

    if (!user) {
      return response.redirect('/home/anmelden');
    }

    const allConversations = await db.from('messages as m')
      .select('m.sender_id', 'i.item_id', 'i.title', 'u.user_id as receiver_id', 'u.username as receiver_username', 's.username as sender_username')
      .join('items as i', 'm.item_id', 'i.item_id')
      .join('users as u', 'i.user_id', 'u.user_id')
      .join('users as s', 'm.sender_id', 's.user_id') // Join to get sender username
      .where('m.sender_id', user.user_id)
      .whereNot('i.user_id', user.user_id) // Exclude where user_id equals sender_id
      .union(builder => {
        builder.select('m.sender_id', 'i.item_id', 'i.title', 'u.user_id as receiver_id', 'u.username as receiver_username', 's.username as sender_username')
          .from('messages as m')
          .join('items as i', 'm.item_id', 'i.item_id')
          .join('users as u', 'i.user_id', 'u.user_id')
          .join('users as s', 'm.sender_id', 's.user_id') // Join to get sender username
          .where('i.user_id', user.user_id)
          .groupBy('i.user_id', 'm.item_id');
      });

    return view.render('pages/communication/nachrichten-liste', { user: session.get('user'), allConversations })
  }
}
