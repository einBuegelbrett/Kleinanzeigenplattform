import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";

export default class HomeController {
  public async geheAnmeldungsseite({ response }: HttpContext) {
    return response.redirect('/home/anmelden')
  }

  public async getItems({ view, session }: HttpContext) {
    const listings = await db.from('listing').select('*').limit(10);
    return view.render('pages/home', {user: session.get('user'), listings})
  }

  public async listingDetails({ view, params }: HttpContext) {
    const listing = await db.from('listing').select('*').where('listing_id', params.id).first()
    const user = await db.from('user').select('*').where('user_id', listing.user_id).first()
    return view.render('pages/anzeige-details', {listing, user})
  }
}
