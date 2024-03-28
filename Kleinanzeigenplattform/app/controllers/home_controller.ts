import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/home/anmelden')
  }

  public async getAnmeldungsseite({ view }: HttpContext) {
    return view.render('pages/anmelden')
  }

  public async setFormUndItems({ request, view }: HttpContext) {
    const benutzername = request.input('benutzername');
    const passwort = request.input('passwort');

    if(benutzername === null || passwort === null){
      return view.render('pages/anmelden',{error: 'Benutzername oder Passwort falsch'})
    }

    return view.render('pages/home', {
      profil: [
        {benutzername, passwort}
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
