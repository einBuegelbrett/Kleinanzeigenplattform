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
import PostsController from "#controllers/posts_controller";
import UsersController from "#controllers/users_controller";

// Home Controller für Startseite und Anmeldungsseite
router.get('/', [HomeController, 'geheAnmeldungsseite'])
router.get('/home', [HomeController, 'getItems'])
router.get('/home/registrieren', [UsersController, 'registrierungsForm'])
router.post('/home/registrieren', [UsersController, 'registrierungsProzess'])
router.get('/home/anmelden', [UsersController, 'anmeldungsForm'])
router.post('/home/anmelden', [UsersController, 'anmeldungsProzess'])
router.get('/home/logout', [UsersController, 'logout'])

router.get('/home/kleine_preise', async ({ view, session }) => {
  return view.render('pages/kleine-preise', {user: session.get('user')})
})

router.get('/home/hilfe', async ({ view, session }) => {
  return view.render('pages/hilfe', {user: session.get('user')})
})

router.get('/home/anzeige_aufgeben', async ({ view, response, session }) => {
  if (session.get('user') === undefined) {
    return response.redirect('/home/anmelden')
  }

  return view.render('pages/anzeige-aufgeben', {user: session.get('user')})
})

router.get('/home/konto/profil', async ({ view, session }) => {
  return view.render('pages/konto-profil', {user: session.get('user')})
})

router.post('/home/konto/profil', [PostsController, 'profil'])
