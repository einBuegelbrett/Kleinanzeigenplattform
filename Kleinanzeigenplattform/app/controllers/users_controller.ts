import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import app from "@adonisjs/core/services/app";
import mail from '@adonisjs/mail/services/main'
import { cuid } from '@adonisjs/core/helpers'
import env from "#start/env";
import User from "#models/user";
import {logInValidator, signInValidator} from "#validators/authentication_validator";
import {profileValidator} from "#validators/user_validator";
import Verification from "#models/verification";

export default class UsersController {
  public async getSignInPage({ view }: HttpContext) {
    return view.render('pages/authentication/signin')
  }

  public async signInProcess({ view, request, auth }: HttpContext) {
    // Extract the needed properties
    const { firstname, lastname, password, repeat_password, email, username } = await request.validateUsing(signInValidator);
    try {
      if(password === repeat_password) {
        const user = await User.create({ firstname, lastname, password, email, username })
        await auth.use("web").login(user, true);

        const verification = new Verification();
        verification.user_id = user.user_id;
        await verification.save()
        // verification needs to be called again to get the token
        const verificationInDB = await Verification.findBy('user_id', user.user_id)
        if(!verificationInDB) {
          return view.render('pages/authentication/signin', { error: 'Fehler bei der Registrierung' })
        }
        const sender = `${env.get("MAIL_USERNAME")}`;
        const urlName = `${env.get("APP_URL")}/home/registrieren/bestaetigen/${user.user_id}/${verificationInDB.token}`;

        await mail.send((message) => {
          message
            .to(user.email)
            .from(sender)
            .subject('Bestätigungsmail')
            .htmlView('email_template/confirmation-mail', {
              urlName
            })
        })

      } else {
        return view.render('pages/authentication/signin', { error: 'Passwort stimmt nicht überein' })
      }
      return view.render('pages/authentication/login', {success: 'Sie haben sich erfolgreich registriert! Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einzuloggen.'});
    } catch (error) {
      return view.render('pages/authentication/signin', { error : 'Fehler bei der Registrierung' });
    }
  }

  public async confirmationMail({ view, params, response }: HttpContext) {
    try {
      const verification = await Verification.findBy('user_id', params.user_id)

      if (!verification) {
        return response.redirect('/home/registrieren')
      }

      if (verification.token === params.token) {
        verification.verified = true;
        await verification.save()
        return view.render('pages/authentication/login', { success: 'E-Mail-Adresse bestätigt, bitte anmelden.' })
      } else {
        return view.render('pages/authentication/login', { error: 'Invalider Token.' });
      }
    } catch (error) {
      return view.render('pages/authentication/login', { error: 'Fehler bei der Bestätigung der E-Mail-Adresse' });
    }
  }

  public async getLogInPage({ view }: HttpContext) {
    return view.render('pages/authentication/login')
  }

  public async logInProcess({ request, response, view, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(logInValidator)
    const user = await User.verifyCredentials(email, password)
    try {
      await auth.use('web').login(user)
      const verification = await Verification.findBy('user_id', user?.user_id)

      if(!user || !verification) {
        return view.render('pages/authentication/login', { error: 'Benutzername oder Passwort falsch' })
      }

      if(!verification.verified) {
        return view.render('pages/authentication/login', { error: 'Bitte bestätigen Sie Ihre E-Mail-Adresse' })
      }

      return response.redirect('/home');
    } catch (error) {
      return view.render('pages/authentication/login', { error: 'Anmeldung fehlgeschlagen' })
    }
  }

  public async logOut({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/home/anmelden')
  }

  public async getProfile({ view }: HttpContext) {
    return view.render('pages/user/profile')
  }

  public async updateProfile({ view, request, auth }: HttpContext) {
    await auth.check()
    try {
      const user = auth.user!
      const verification = await Verification.findBy('user_id', user.user_id)

      if(!verification) {
        return view.render('pages/authentication/login', { error: 'Fehler beim Laden des Profils' })
      }

      const { firstname, lastname, email } = await request.validateUsing(profileValidator);
      let profilePicture = request.file('profile_picture',{ size: '2mb', extnames: ['jpg', 'png', 'jpeg']})

      if(profilePicture?.isValid){
        await profilePicture.move(app.publicPath('uploads'), { name: `${cuid()}.${profilePicture.extname}`, overwrite: true })
        user.profile_picture = profilePicture.fileName!
      }

      user.firstname = firstname
      user.lastname = lastname

      // the e-mail needs to be verified again, for this give new token and log out
      if(user.email != email) {
        user.email = email
        verification.token = cuid();
        verification.verified = false;
        await user.save()
        await auth.use('web').logout()

        const sender = `${env.get("MAIL_USERNAME")}`;
        const urlName = `${env.get("APP_URL")}/home/registrieren/bestaetigen/${user.user_id}/${verification.token}`;

        await mail.send((message) => {
          message
            .to(user.email)
            .from(sender)
            .subject('Bestätigungsmail')
            .htmlView('email_template/confirmation-mail', {
              urlName
            })
        })

        return view.render('pages/authentication/signin', { success: 'E-Mail-Adresse erfolgreich geändert. Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einzuloggen.' })
      }

      return view.render('pages/user/profile', { success: 'Profil erfolgreich aktualisiert' });
    } catch (error) {
      return view.render('pages/user/profile', { error: 'Fehler beim Aktualisieren des Profils'});
    }
  }

  public async conversationList({ view, auth }: HttpContext) {
    const user = auth.user!

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

    return view.render('pages/communication/list-chat', { allConversations })
  }
}
