import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";
import {searchbar} from "#validators/item_validator";

export default class HomeController {
  public async getLogInPage({ response }: HttpContext) {
    return response.redirect('/anmelden');
  }

  public async getItems({ view, session, auth }: HttpContext) {
    await auth.check()
    try {
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').groupBy('items.item_id').where('items.active', 1).limit(12);
      return view.render('pages/home/home', { user: session.get('user'), items });
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Fehler beim Laden von Artikeln'});
    }
  }

  public async filterItems({ request, view, session, auth }: HttpContext) {
    await auth.check()
    const search = await request.validateUsing(searchbar)
    try {
      if(search.search === null) {
        const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').groupBy('items.item_id').where('items.active', 1).limit(12);
        return view.render('pages/home/home', { user: session.get('user'), items });
      } else {
        const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').groupBy('items.item_id').where('items.title', 'like', `%${search.search}%`).andWhere('items.active', 1).limit(12);
        return view.render('pages/home/home', { user: session.get('user'), items, search: search.search });
    }} catch (error) {
      return view.render('pages/home/home', { error: 'Fehler bei der Suche'});
    }
  }
}
