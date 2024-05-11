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
import ListingsController from "#controllers/items_controller";
import {middleware} from "#start/kernel";

router.get('/', [HomeController, 'getLogInPage'])
router.get('/home', [HomeController, 'getItems'])
router.post('/home', [HomeController, 'filterItems'])

router.get('/home/registrieren', [UsersController, 'getSignInPage'])
  .use(middleware.guest());
router.post('/home/registrieren', [UsersController, 'signInProcess'])
  .use(middleware.guest());
router.get('/home/registrieren/bestaetigen/:user_id/:token', [UsersController, 'confirmationMail'])
  .use(middleware.guest());
router.get('/home/anmelden', [UsersController, 'getLogInPage'])
  .use(middleware.guest());
router.post('/home/anmelden', [UsersController, 'logInProcess'])
  .use(middleware.guest());
router.get('/home/logout', [UsersController, 'logOut'])
  .use(middleware.auth());
router.get('/home/konto/profil', [UsersController, 'getProfile'])
  .use(middleware.auth());
router.post('/home/konto/profil', [UsersController, 'updateProfile'])
  .use(middleware.auth());
router.get('/home/konto/nachrichten', [UsersController, 'conversationList'])
  .use(middleware.auth());
router.get('/home/artikel/:item_id', [ListingsController, 'itemDetail'])
  .use(middleware.auth());
router.post('/home/artikel/:item_id', [ListingsController, 'activateItem'])
  .use(middleware.auth());
router.get('/home/artikel/:item_id/kaufen', [ListingsController, 'buyingPage'])
  .use(middleware.auth());
router.post('/home/artikel/:item_id/kaufen', [ListingsController, 'buyItem'])
  .use(middleware.auth());
router.get('/home/artikel/:item_id/user/:user_id/chat', [ListingsController, 'itemChat'])
  .use(middleware.auth());
router.post('/home/artikel/:item_id/user/:user_id/chat', [ListingsController, 'sendMessage'])
  .use(middleware.auth());
router.get('/home/anzeige_aufgeben', [ListingsController, 'getSubmitItemPage'])
  .use(middleware.auth());
router.post('/home/anzeige_aufgeben', [ListingsController, 'postItem'])
  .use(middleware.auth());
router.get('/home/konto/eigene_anzeigen', [ListingsController, 'ownItems'])
  .use(middleware.auth());
router.post('/home/konto/eigene_anzeigen/:item_id', [ListingsController, 'deleteItem'])
  .use(middleware.auth());
router.get('/home/anmelden/passwort_vergessen', [UsersController, 'getEmailGuest'])
router.post('/home/anmelden/passwort_vergessen', [UsersController, 'sendPasswordResetMail'])
router.get('/home/passwort_zuruecksaetzen/:user_id/:token', [UsersController, 'getResetPasswordPage'])
router.post('/home/passwort_zuruecksaetzen/:user_id/:token', [UsersController, 'checkPassword'])
