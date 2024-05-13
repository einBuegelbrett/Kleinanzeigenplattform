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
import ItemsController from "#controllers/items_controller";
import {middleware} from "#start/kernel";

// Home Controller
router.get('/', [HomeController, 'getLogInPage'])
router.get('/home', [HomeController, 'getItems'])
router.post('/home', [HomeController, 'filterItems'])

// Users Controller
router.get('/registrieren', [UsersController, 'getSignInPage'])
  .use(middleware.guest());
router.post('/registrieren', [UsersController, 'signInProcess'])
  .use(middleware.guest());
router.get('/bestaetigen/:user_id/:token', [UsersController, 'confirmationMail'])
  .use(middleware.guest());
router.get('/anmelden', [UsersController, 'getLogInPage'])
  .use(middleware.guest());
router.post('/anmelden', [UsersController, 'logInProcess'])
  .use(middleware.guest());
router.get('/logout', [UsersController, 'logOut'])
  .use(middleware.auth());
router.get('/konto/profil', [UsersController, 'getProfile'])
  .use(middleware.auth());
router.post('/konto/profil', [UsersController, 'updateProfile'])
  .use(middleware.auth());
router.get('/konto/nachrichten', [UsersController, 'conversationList'])
  .use(middleware.auth());
// no middleware used because you can change the passwort being authenticated and as a guest
router.get('/passwort_vergessen', [UsersController, 'getEmailGuest'])
router.post('/passwort_vergessen', [UsersController, 'sendPasswordResetMail'])
router.get('/passwort_zuruecksaetzen/:user_id/:token', [UsersController, 'getResetPasswordPage'])
router.post('/passwort_zuruecksaetzen/:user_id/:token', [UsersController, 'checkPassword'])

// Items Controller
router.get('/artikel/:item_id', [ItemsController, 'itemDetail'])
router.post('/artikel/:item_id', [ItemsController, 'activateItem'])
  .use(middleware.auth());
router.get('/artikel/:item_id/kaufen', [ItemsController, 'buyingPage'])
  .use(middleware.auth());
router.post('/artikel/:item_id/kaufen', [ItemsController, 'buyItem'])
  .use(middleware.auth());
router.get('/artikel/:item_id/user/:user_id/chat', [ItemsController, 'itemChat'])
  .use(middleware.auth());
router.post('/artikel/:item_id/user/:user_id/chat', [ItemsController, 'sendMessage'])
  .use(middleware.auth());
router.get('/anzeige_aufgeben', [ItemsController, 'getSubmitItemPage'])
  .use(middleware.auth());
router.post('/anzeige_aufgeben', [ItemsController, 'postItem'])
  .use(middleware.auth());
router.get('/konto/eigene_anzeigen', [ItemsController, 'ownItems'])
  .use(middleware.auth());
router.post('/konto/eigene_anzeigen/:item_id', [ItemsController, 'deleteItem'])
  .use(middleware.auth());

