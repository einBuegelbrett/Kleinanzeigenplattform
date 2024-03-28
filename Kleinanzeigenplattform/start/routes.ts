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

// Home Controller für Startseite und Anmeldungsseite
router.get('/', [HomeController, 'geheAnmeldungsseite'])
router.post('/home', [HomeController, 'setFormUndItems'])
router.get('/home', [HomeController, 'getItems'])
router.get('/anmelden', [HomeController, 'getAnmeldungsseite'])
router.get('/home/anmelden', [HomeController, 'getAnmeldungsseite'])

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
