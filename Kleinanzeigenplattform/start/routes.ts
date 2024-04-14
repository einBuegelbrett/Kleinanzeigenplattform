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
import ListingsController from "#controllers/listings_controller";

router.get('/', [HomeController, 'geheAnmeldungsseite'])
router.get('/home', [HomeController, 'getItems'])
router.post('/home', [HomeController, 'filterListing'])
router.get('/home/registrieren', [UsersController, 'registrierungsForm'])
router.post('/home/registrieren', [UsersController, 'registrierungsProzess'])
router.get('/home/anmelden', [UsersController, 'anmeldungsForm'])
router.post('/home/anmelden', [UsersController, 'anmeldungsProzess'])
router.get('/home/logout', [UsersController, 'logout'])
router.get('/home/konto/profil', [UsersController, 'userProfile'])
router.post('/home/konto/profil', [UsersController, 'updateProfile'])
router.get('/home/artikel/:listing_id', [ListingsController, 'listingDetails'])
router.post('/home/artikel/:listing_id', [ListingsController, 'activateListing'])
router.get('/home/artikel/:listing_id/user/:user_id/chat', [ListingsController, 'listingChat'])
router.post('/home/artikel/:listing_id/user/:user_id/chat', [ListingsController, 'sendMessage'])
router.get('/home/anzeige_aufgeben', [ListingsController, 'listingPage'])
router.post('/home/anzeige_aufgeben', [ListingsController, 'postListing'])
router.get('/home/konto/eigene_anzeigen', [ListingsController, 'ownListing'])

router.get('/home/kleine_preise', async ({ view, session }) => {
  return view.render('pages/kleine-preise', {user: session.get('user')})
})

router.get('/home/hilfe', async ({ view, session }) => {
  return view.render('pages/hilfe', {user: session.get('user')})
})
