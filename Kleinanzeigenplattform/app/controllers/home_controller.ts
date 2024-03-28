import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/anmelden')
  }

  public async getAnmeldungsseite({ view }: HttpContext) {
    return view.render('pages/anmelden')
  }

  public async setFormUndItems({ request, view }: HttpContext) {
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
