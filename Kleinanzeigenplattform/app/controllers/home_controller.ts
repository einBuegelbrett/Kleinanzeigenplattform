import type { HttpContext } from '@adonisjs/core/http'
import db from "@adonisjs/lucid/services/db";

export default class HomeController {
  public async getLoginPage({ response }: HttpContext) {
    return response.redirect('/home/anmelden');
  }

  public async getItems({ view, session }: HttpContext) {
    const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').groupBy('items.item_id').where('items.active', 1).limit(12);

    return view.render('pages/home/home', { user: session.get('user'), items });
  }

  public async filterItems({ request, view, session }: HttpContext) {
    const search = request.input('search');

    if(search === null) {
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').groupBy('items.item_id').where('items.active', 1).limit(12);

      return view.render('pages/home/home', { user: session.get('user'), items });
    } else {
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').groupBy('items.item_id').where('items.title', 'like', `%${search}%`).andWhere('items.active', 1).limit(12);

      return view.render('pages/home/home', { user: session.get('user'), listing: items, search });
    }
  }
}
