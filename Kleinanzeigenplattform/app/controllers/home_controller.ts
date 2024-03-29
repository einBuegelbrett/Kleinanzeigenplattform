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

  public async anmelden({ response, request, view }: HttpContext) {
    const benutzername = request.input('benutzername');
    const passwort = request.input('passwort');

    if(benutzername === null || passwort === null){
      return view.render('pages/anmelden',{error: 'Benutzername oder Passwort falsch'})
    }

    return response.redirect().toRoute('/home');
  }

  public async registrieren({ response, request, view }: HttpContext) {
    const benutzername = request.input('benutzername');
    const vorname = request.input('vorname');
    const nachname = request.input('nachname');
    const passwort = request.input('passwort');
    const passwortWiederholen = request.input('passwort_wiederholen');

    if (benutzername === null || vorname === null || nachname === null || passwort === null || passwortWiederholen === null) {
      return view.render('pages/registrieren', { error: 'Alle Felder müssen ausgefüllt sein' });
    }

    return response.redirect().toRoute('/home');
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
