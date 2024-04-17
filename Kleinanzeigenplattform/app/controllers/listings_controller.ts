import type {HttpContext} from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";
import app from "@adonisjs/core/services/app";

export default class ListingsController {
  public async listingDetails({view, params, session}: HttpContext) {
    const listing = await db.from('listing').select('*').where('listing_id', params.listing_id).first()
    const seller = await db.from('user').select('*').where('user_id', listing.user_id).first()
    const images = await db.from('image').select('*').where('listing_id', listing.listing_id)

    return view.render('pages/anzeige-details', { user: session.get('user'), listing, seller, images })
  }

  public async activateListing({view, params, session}: HttpContext) {
    let listing = await db.from('listing').select('*').where('listing_id', params.listing_id).first();
    await db.from('listing').where('listing_id', params.listing_id).update('active', listing.active? 0 : 1);
    listing = await db.from('listing').select('*').where('listing_id', params.listing_id).first();
    const seller = await db.from('user').select('*').where('user_id', listing.user_id).first();
    const images = await db.from('image').select('*').where('listing_id', listing.listing_id);

    return view.render('pages/anzeige-details', { user: session.get('user'), listing, seller, images })
  }

  public async listingPage({view, response, session}: HttpContext) {
    if (session.get('user') === undefined) {
      return response.redirect('/home/anmelden')
    }
    return view.render('pages/anzeige-aufgeben', {user: session.get('user')})
  }

  public async postListing({request, view, session}: HttpContext) {
    try {
      const images = request.files('images', {size: '5mb', extnames: ['jpg', 'png', 'jpeg']})

      if (images === null) {
        return view.render('pages/anzeige-aufgeben', {error: 'Bitte Bild hochladen', user: session.get('user')})
      }

      const insertedItem = await db.table('listing').insert({
        title: request.input('titel'),
        description: request.input('beschreibung'),
        price: request.input('preis'),
        user_id: session.get('user').user_id
      })

      for (const image of images) {
        if (!image.isValid) {
          view.render('pages/anzeige-aufgeben', {error: 'Fehler beim Hochladen des Bildes', user: session.get('user')});
        }

        await image.move(app.publicPath('uploads'));
        const insertedItemId = insertedItem[0];
        await db.table('image').insert({
          link: image.fileName,
          listing_id: insertedItemId
        })
      }
    } catch (error) {
      return view.render('pages/anzeige-aufgeben', {error: 'Fehler bei der Dateneingabe', user: session.get('user')})
    }
    return view.render('pages/anzeige-aufgeben', {
      success: 'Anzeige wurde erfolgreich erstellt',
      user: session.get('user')
    })
  }

  public async ownListing({view, session}: HttpContext) {
    const listing = await db.from('listing').select('*').innerJoin('image', 'listing.listing_id', 'image.listing_id').where('user_id', session.get('user').user_id).groupBy('listing.listing_id');
    return view.render('pages/eigene-anzeigen.edge', {user: session.get('user'), listing});
  }

  public async listingChat({view, params, session}: HttpContext) {
    const listing = await db.from('listing').select('*').where('listing_id', params.listing_id).first();

    if ((await session.get('user')).user_id != params.user_id && (await session.get('user')).user_id != listing.user_id) {

      return view.render('pages/nicht-erlaubt.edge', { user: session.get('user'), error: 'Nicht erlaubt'})
    }

    const allMessages = await db.from('message')
      .select('*')
      .where('listing_id', listing.listing_id)
      .andWhere(builder => {
        builder.where('sender_id', session.get('user').user_id)
          .orWhere('sender_id', '!=', session.get('user').user_id);
      })
      .orderBy('timestamp', 'asc');

    return view.render('pages/listing-chat', { user: session.get('user'), listing, allMessages })
  }

  public async sendMessage({view, params, request, session}: HttpContext) {
    const listing = await db.from('listing').select('*').where('listing_id', params.listing_id).first();
    const timestamp = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'});

    await db.table('message').insert({
      sender_id: session.get('user').user_id,
      listing_id: listing.listing_id,
      message_text: request.input('nachricht'),
      timestamp: timestamp
    })

    const allMessages = await db.from('message')
      .select('*')
      .where('listing_id', listing.listing_id)
      .andWhere(builder => {
        builder.where('sender_id', session.get('user').user_id)
          .orWhere('sender_id', '!=', session.get('user').user_id);
      })
      .orderBy('timestamp', 'asc');

    console.log(allMessages)

    return view.render('pages/listing-chat', {user: session.get('user'), listing, allMessages, timestamp})
  }
}
