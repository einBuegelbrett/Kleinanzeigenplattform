import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/home/anmelden')
  }

  public async getItems({ view, session }: HttpContext) {
    return view.render('pages/home', {
      user: session.get('user'),
      items: [
        { titel: 'Item', beschreibung: 'Beschreibung' },
        { titel: 'Item', beschreibung: 'Beschreibung' },
        { titel: 'Item', beschreibung: 'Beschreibung' },
        { titel: 'Item', beschreibung: 'Beschreibung' },
        { titel: 'Item', beschreibung: 'Beschreibung' },
        { titel: 'Item', beschreibung: 'Beschreibung' }
      ],
    })
  }
}
