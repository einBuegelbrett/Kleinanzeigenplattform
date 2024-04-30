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

router.get('/', [HomeController, 'getLogInPage'])
router.get('/home', [HomeController, 'getItems'])
router.post('/home', [HomeController, 'filterItems'])
router.get('/home/registrieren', [UsersController, 'getSignInPage'])
router.post('/home/registrieren', [UsersController, 'signInProcess'])
router.get('/home/registrieren/bestaetigen/:user_id/:token', [UsersController, 'confirmationMail'])
router.get('/home/anmelden', [UsersController, 'getLogInPage'])
router.post('/home/anmelden', [UsersController, 'logInProcess'])
router.get('/home/logout', [UsersController, 'logOut'])
router.get('/home/konto/profil', [UsersController, 'getProfile'])
router.post('/home/konto/profil', [UsersController, 'updateProfile'])
router.get('/home/konto/nachrichten', [UsersController, 'conversationList'])
router.get('/home/artikel/:item_id', [ListingsController, 'itemDetail'])
router.post('/home/artikel/:item_id', [ListingsController, 'activateItem'])
router.get('/home/artikel/:item_id/kaufen', [ListingsController, 'buyingPage'])
router.post('/home/artikel/:item_id/kaufen', [ListingsController, 'buyItem'])
router.get('/home/artikel/:item_id/user/:user_id/chat', [ListingsController, 'itemChat'])
router.post('/home/artikel/:item_id/user/:user_id/chat', [ListingsController, 'sendMessage'])
router.get('/home/anzeige_aufgeben', [ListingsController, 'getSubmitItemPage'])
router.post('/home/anzeige_aufgeben', [ListingsController, 'postItem'])
router.get('/home/konto/eigene_anzeigen', [ListingsController, 'ownItems'])
router.post('/home/konto/eigene_anzeigen/:listing_id', [ListingsController, 'deleteItem'])
