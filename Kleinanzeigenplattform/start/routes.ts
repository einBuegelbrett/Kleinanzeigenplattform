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
  return response.redirect('/anmelden')
})

router.post('/home', async ({ request, view }) => {
  const vorname = request.input('vorname')
  const nachname = request.input('nachname')

  if(nachname === null || vorname === null){
    return view.render('/',{error: 'Bitte geben Sie einen Vornamen und Nachnamen ein'})
  }

  return view.render('pages/home', {
    profil: [
      {vorname, nachname}
    ],
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
  return view.render('pages/kleine-preise')
})

router.get('/home/hilfe', async ({ view }) => {
  return view.render('pages/hilfe')
})

router.get('/home/anzeige_aufgeben', async ({ view }) => {
  return view.render('pages/anzeige-aufgeben')
})

router.get('/anmelden', async ({ view }) => {
  return view.render('pages/anmelden')
})

router.get('/home/anmelden', async ({ view }) => {
  return view.render('pages/anmelden')
})

router.get('/home/konto/profil', async ({ view }) => {
  return view.render('pages/konto-profil')
})
