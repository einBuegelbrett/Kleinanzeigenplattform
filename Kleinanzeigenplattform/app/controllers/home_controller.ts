import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/home/anmelden')
  }

  public async getAnmeldungsseite({ view }: HttpContext) {
    return view.render('pages/anmelden')
  }

  public async getRegistrierungsseite({ view }: HttpContext) {
    return view.render('pages/registrieren')
  }

  public async getItems({ view }: HttpContext) {
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
  }
}
