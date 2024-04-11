import type {HttpContext} from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";
import app from "@adonisjs/core/services/app";

export default class ListingsController {
  public async listingDetails({ view, params }: HttpContext) {
    const listing = await db.from('listing').select('*').where('listing_id', params.id).first()
    const user = await db.from('user').select('*').where('user_id', listing.user_id).first()
    return view.render('pages/anzeige-details', {listing, user})
  }

  public async listingPage({view, response, session}: HttpContext) {
      if (session.get('user') === undefined) {
        return response.redirect('/home/anmelden')
      }
      return view.render('pages/anzeige-aufgeben', {user: session.get('user')})
  }

  public async postListing({request, view, session}: HttpContext) {
    try {
      const image = request.file('image',{ size: '5mb', extnames: ['jpg', 'png', 'jpeg']})

      if(image === null){
        return view.render('pages/anzeige-aufgeben', {error: 'Bitte Bild hochladen'})
      }

      if(!image.isValid){
        return view.render('pages/anzeige-aufgeben', {error: 'Fehler beim Hochladen des Bildes'})
      }

      await image.move(app.publicPath('uploads'))
      const insertedItem = await db.table('listing').insert({
        title: request.input('titel'),
        description: request.input('beschreibung'),
        price: request.input('preis'),
        user_id: session.get('user').user_id
      })

      const insertedItemId = insertedItem[0];
      await db.table('image').insert({
        link: image.fileName,
        listing_id: insertedItemId
      })

    } catch (error) {
      return view.render('pages/anzeige-aufgeben', {error: 'Fehler bei der Dateneingabe', user: session.get('user')})
    }
    return view.render('pages/anzeige-aufgeben', {success: 'Anzeige wurde erfolgreich erstellt', user: session.get('user')})
  }

  public async ownListing({view, session}: HttpContext) {
    const listings = await db.from('listing').select('*').where('user_id', session.get('user').user_id)
    return view.render('pages/eigene-anzeigen.edge', {user: session.get('user'), listings})
  }
}
