/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async ({ response }) => {
  return response.redirect('/home')
})

router.get('/home', async ({ view }) => {
  return view.render('pages/home', {
    items: [
      { titel: 'Item', beschreibung: 'Beschreibung' },
      { titel: 'Item', beschreibung: 'Beschreibung' },
      { titel: 'Item', beschreibung: 'Beschreibung' },
      { titel: 'Item', beschreibung: 'Beschreibung' },
      { titel: 'Item', beschreibung: 'Beschreibung' },
      { titel: 'Item', beschreibung: 'Beschreibung' }
    ],
  })
})

router.get('/home/kleine_preise', async ({ view }) => {
  return view.render('pages/k-preise')
})

router.get('/home/hilfe', async ({ view }) => {
  return view.render('pages/hilfe')
})

router.get('/home/anzeige_aufgeben', async ({ view }) => {
  return view.render('pages/anzeige-aufgeben')
})

router.get('/home/anmelden', async ({ view }) => {
  return view.render('pages/anmelden')
})
