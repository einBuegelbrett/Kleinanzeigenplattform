import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/home/anmelden')
  }

  public async getItems({ view, session }: HttpContext) {
    const listings = await db.from('listing').select('*').limit(9);
    return view.render('pages/home', {user: session.get('user'), listings})
  }
}
