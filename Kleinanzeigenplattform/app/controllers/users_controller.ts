import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import app from "@adonisjs/core/services/app";
import mail from '@adonisjs/mail/services/main'
import { cuid } from '@adonisjs/core/helpers'
import env from "#start/env";
import User from "#models/user";
import {changePasswordValidator, logInValidator, signInValidator} from "#validators/authentication_validator";
import {emailValidator, profileValidator} from "#validators/user_validator";
import Verification from "#models/verification";

async function sendEmail(user: User, verification: Verification){
  const sender = `${env.get("MAIL_USERNAME")}`;
  const urlName = `${env.get("APP_URL")}/bestaetigen/${user.user_id}/${verification.token}`;

  await mail.send((message) => {
    message
      .to(user.email)
      .from(sender)
      .subject('Bestätigungsmail')
      .htmlView('email_template/confirmation-mail', {
        urlName
      })
  })
}

export default class UsersController {
  public async getSignInPage({ view }: HttpContext) {
    return view.render('pages/authentication/signin')
  }

  public async signInProcess({ view, request }: HttpContext) {
    // Extract the needed properties
    const { firstname, lastname, password, repeat_password, email, username } = await request.validateUsing(signInValidator);
    try {
      if(password === repeat_password) {
        const user = await User.create({ firstname, lastname, password, email, username })

        await Verification.create({user_id: user.user_id})

        // verification needs to be called again to get the token
        const verification = await Verification.findBy('user_id', user.user_id)
        if(!verification) {
          return view.render('pages/authentication/signin', { error: 'Fehler bei der Registrierung' })
        }

        await sendEmail(user, verification)

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
        return response.redirect('/registrieren')
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
    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use("web").login(user)
      const verification = await Verification.findBy('user_id', user.user_id)

      if(!verification) {
        return view.render('pages/authentication/login', { error: 'Benutzer existiert nicht' })
      }

      if(!verification.verified) {
        return view.render('pages/authentication/login', { error: 'Bitte bestätigen Sie Ihre E-Mail-Adresse' })
      }

      return response.redirect('/home');
    } catch (error) {
      return view.render('pages/authentication/login', { error: 'Benutzername oder Passwort falsch' })
    }
  }

  public async logOut({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/anmelden')
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
      let profilePicture = request.file('profile_picture',{ size: '2mb', extnames: ['jpg', 'png', 'jpeg', 'gif']})

      if(profilePicture?.isValid){
        await profilePicture.move(app.publicPath('uploads'), { name: `${cuid()}.${profilePicture.extname}`, overwrite: true })
        user.profile_picture = profilePicture.fileName!
      }

      user.firstname = firstname
      user.lastname = lastname
      await user.save()

      // the e-mail needs to be verified again if changed, for this give new token and log out
      if(user.email != email) {
        user.email = email
        verification.token = cuid();
        verification.verified = false;
        await user.save()
        await verification.save()
        await auth.use('web').logout()

        await sendEmail(user, verification)

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


  public async getEmailGuest({ view }: HttpContext) {
    return view.render('pages/user/enter-email')
  }

  public async sendPasswordResetMail({ request, view }: HttpContext) {
    const email = await request.validateUsing(emailValidator)
    const user = await User.findBy('email', email.email)

    if(!user) {
      return view.render('pages/errors-and-successes/error-and-success-page', { error: 'Benutzer nicht gefunden' })
    }

    const verification = await Verification.findBy('user_id', user.user_id)

    if(!verification) {
      return view.render('pages/authentication/login', { error: 'Fehler beim Laden des Profils' })
    }

    // token needs to be changed so that the user can't use the token from the sign in
    verification.token = cuid();
    verification.verified = false;
    await user.save()
    await verification.save()

    await sendEmail(user, verification)

    return view.render('pages/errors-and-successes/error-and-success-page', { success: 'E-Mail zur Passwortänderung wurde versendet' })
  }

  public async getResetPasswordPage({ view, params, response }: HttpContext) {
    try {
      const verification = await Verification.findBy('user_id', params.user_id)

      if (!verification) {
        return response.redirect('/registrieren')
      }

      if (verification.token === params.token) {
        verification.verified = true;
        await verification.save()
        return view.render('pages/user/change-password', { verificationToken: verification.token, user_id: params.user_id })
      } else {
        return view.render('pages/authentication/login', { error: 'Invalider Token' });
      }
    } catch (error) {
      return view.render('pages/authentication/login', { error: 'Fehler beim Laden der Seite' });
    }
  }

  public async checkPassword({ view, request, params }: HttpContext) {
    const { password, repeat_password } = await request.validateUsing(changePasswordValidator)
    try {
      if(password === repeat_password) {
        const user = await User.findBy('user_id', params.user_id)

        if(!user) {
          return view.render('pages/errors-and-successes/error-and-success-page', { error: 'Benutzer nicht gefunden' })
        }

        user.password = password
        await user.save()
        return view.render('pages/errors-and-successes/error-and-success-page', { success: 'Passwort erfolgreich geändert' })
      } else {
        const verification = await Verification.findBy('user_id', params.user_id)
        return view.render('pages/user/change-password', { error: 'Passwort stimmt nicht überein', verificationToken: verification!.token, user_id: params.user_id })
      }
    } catch (error) {
      return view.render('pages/authentication/login', { error: 'Fehler beim Laden der Seite' });
    }
  }
}
