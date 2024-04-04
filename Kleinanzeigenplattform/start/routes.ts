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

// Home Controller für Startseite und Anmeldungsseite
router.get('/', [HomeController, 'geheAnmeldungsseite'])
router.post('/home/anmelden', [PostsController, 'anmelden'])
router.post('/home/registrieren', [PostsController, 'registrieren'])
router.get('/home', [HomeController, 'getItems'])
router.get('/home/anmelden', [HomeController, 'getAnmeldungsseite'])
router.get('/home/registrieren', [HomeController, 'getRegistrierungsseite'])

router.get('/home/kleine_preise', async ({ view }) => {
  return view.render('pages/kleine-preise')
})

router.get('/home/hilfe', async ({ view }) => {
  return view.render('pages/hilfe')
})

router.get('/home/anzeige_aufgeben', async ({ view }) => {
  return view.render('pages/anzeige-aufgeben')
})

router.get('/home/konto/profil', async ({ view }) => {
  return view.render('pages/konto-profil')
})

router.post('/home/konto/profil', [PostsController, 'profil'])
