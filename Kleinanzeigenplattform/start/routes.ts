/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import HomeController from "#controllers/home_controller";
import UsersController from "#controllers/users_controller";
import db from "@adonisjs/lucid/services/db";
import ListingsController from "#controllers/listings_controller";

// Home Controller für Startseite und Anmeldungsseite
router.get('/', [HomeController, 'geheAnmeldungsseite'])
router.get('/home', [HomeController, 'getItems'])
router.get('/home/registrieren', [UsersController, 'registrierungsForm'])
router.post('/home/registrieren', [UsersController, 'registrierungsProzess'])
router.get('/home/anmelden', [UsersController, 'anmeldungsForm'])
router.post('/home/anmelden', [UsersController, 'anmeldungsProzess'])
router.get('/home/logout', [UsersController, 'logout'])
router.get('/home/artikel/:id', [ListingsController, 'listingDetails'])
router.get('/home/anzeige_aufgeben', [ListingsController, 'listingPage'])
router.post('/home/anzeige_aufgeben', [ListingsController, 'postListing'])

router.get('/home/kleine_preise', async ({ view, session }) => {
  return view.render('pages/kleine-preise', {user: session.get('user')})
})

router.get('/home/hilfe', async ({ view, session }) => {
  return view.render('pages/hilfe', {user: session.get('user')})
})

router.get('/home/konto/profil', async ({ view, response, session }) => {
  if (session.get('user') === undefined) {
    return response.redirect('/home/anmelden')
  }

  return view.render('pages/konto-profil', {user: session.get('user')})
})

router.post('/home/konto/profil', async ({ view, response, request, session}) => {
  try {
    const userId = session.get('user').user_id
    const userBenutzername = session.get('user').username

    session.forget('user')

    session.put('user', {
      user_id: userId,
      username: userBenutzername,
      firstname: request.input('vorname'),
      lastname: request.input('nachname'),
      email: request.input('email')
    })

    await db.from('user').where('user_id', userId).update({
      email: request.input('email'),
      firstname: request.input('vorname'),
      lastname: request.input('nachname')})

  } catch (error) {
    return view.render('pages/konto-profil', { error: 'Fehler bei der Dateneingabe' });
  }

  return response.redirect('/home/konto/profil')
})
