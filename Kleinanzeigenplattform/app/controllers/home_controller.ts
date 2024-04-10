import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/home/anmelden');
  }

  public async getItems({ view, session }: HttpContext) {
    const listing = await db.from('listing').select('*').limit(9);
    return view.render('pages/home', {user: session.get('user'), listing});
  }

  public async filterListing({ request, view, session }: HttpContext) {
    const search = request.input('search');
    if(search === null) {
      const listing = await db.from('listing').select('*').limit(9);
      return view.render('pages/home', {user: session.get('user'), listing, search});
    } else {
      const listing = await db.from('listing').select('*').where('title', 'like', `%${search}%`);
      return view.render('pages/home', {user: session.get('user'), listing, search});
    }
  }
}
