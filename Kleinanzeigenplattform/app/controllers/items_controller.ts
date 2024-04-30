import type {HttpContext} from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";
import app from "@adonisjs/core/services/app";
import {cuid} from "@adonisjs/core/helpers";
import mail from '@adonisjs/mail/services/main'
import env from "#start/env";
import Item from "#models/item";
import Image from "#models/image";
import User from "#models/user";
import Message from "#models/message";

export default class ItemsController {
  public async itemDetail({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    const seller = await User.findBy('user_id', item.user_id)
    const images = await Image.findManyBy('item_id', item.item_id)

    return view.render('pages/item/item-details', { user: session.get('user'), item, seller, images })
  }

  public async activateItem({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    // change the state of the item
    item.active = !item.active
    await item.save()
    const seller = await User.findBy('user_id', item.user_id)
    const images = await Image.findManyBy('item_id', item.item_id)

    return view.render('pages/item/item-details', { user: session.get('user'), item, seller, images })
  }

  public async getSubmitItemPage({view, response, session}: HttpContext) {
    if (session.get('user') === undefined) {
      return response.redirect('/home/anmelden')
    }
    return view.render('pages/item/submit-item-page', {user: session.get('user')})
  }

  public async postItem({request, view, session}: HttpContext) {
    try {
      const item = new Item()
      const image = new Image()
      const uploadedImages = request.files('images', {size: '5mb', extnames: ['jpg', 'png', 'jpeg']})

      if (uploadedImages === null) {
        return view.render('pages/item/submit-item-page', {error: 'Bitte Bild hochladen', user: session.get('user')})
      }

      item.title = request.input('titel')
      item.description = request.input('beschreibung')
      item.price = request.input('preis')
      item.user_id = session.get('user').user_id
      await item.save()

      for (const uploadedImage of uploadedImages) {
        await uploadedImage.move(app.publicPath('uploads'), { name: `${cuid()}.${uploadedImage.extname}`, overwrite: true });

        if (!uploadedImage.isValid || !uploadedImage.fileName){
          return await view.render('pages/item/submit-item-page', {error: 'Fehler beim Hochladen des Bildes', user: session.get('user')});
        }

        image.path = uploadedImage.fileName
        image.item_id = item.item_id
        await image.save()
      }

      return view.render('pages/item/submit-item-page', {
        success: 'Anzeige wurde erfolgreich erstellt',
        user: session.get('user')
      })
    } catch (error) {
      return view.render('pages/item/submit-item-page', { error: 'Fehler bei der Dateneingabe', user: session.get('user') })
    }
  }

  public async ownItems({view, session}: HttpContext) {
    try {
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').where('user_id', session.get('user').user_id).groupBy('items.item_id');
      return view.render('pages/item/own-items.edge', { user: session.get('user'), items });
    } catch (error) {
      return view.render('pages/item/own-items.edge', { user: session.get('user'), error: 'Fehler beim Laden der Anzeigen' });
    }
  }

  public async deleteItem({view, params, session}: HttpContext) {
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
      }

      const deletedItemTitle = item.title
      await item.delete()
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').where('items.user_id', session.get('user').user_id).groupBy('items.item_id');

      return view.render('pages/item/own-items.edge', { user: session.get('user'), items, success: deletedItemTitle + ' wurde erfolgreich gelöscht' });
    } catch (error) {
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Fehler beim Löschen der Anzeige' });
    }
  }

  public async itemChat({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    if ((await session.get('user')).user_id != params.user_id && (await session.get('user')).user_id != item.user_id) {
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Nicht erlaubt'})
    }

    const allMessages = await db.from('messages')
      .select('messages.*', 'users.username as sender_username', 'users.profile_picture as sender_profile_picture')
      .join('users', 'messages.sender_id', 'users.user_id')
      .where('item_id', item.item_id)
      .andWhere(builder => {
        builder.where('sender_id', session.get('user').user_id)
          .orWhere('sender_id', '!=', session.get('user').user_id);
      })
      .orderBy('created_at', 'asc');

    const receiverUsername = await db.from('items')
      .select('users.username as receiver_username', 'users.profile_picture as receiver_profile_picture')
      .join('users', 'items.user_id', 'users.user_id')
      .where('item_id', item.item_id);

    return view.render('pages/communication/item-chat', { user: session.get('user'), item, allMessages, receiverUsername })
  }

  public async sendMessage({view, params, request, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)
    const message = new Message()

    if(!item){
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    message.sender_id = session.get('user').user_id
    message.item_id = item.item_id
    message.content = request.input('nachricht');
    await message.save()

    const allMessages = await db.from('messages')
      .select('messages.*', 'users.username as sender_username', 'users.profile_picture as sender_profile_picture')
      .join('users', 'messages.sender_id', 'users.user_id')
      .where('item_id', item.item_id)
      .andWhere(builder => {
        builder.where('sender_id', session.get('user').user_id)
          .orWhere('sender_id', '!=', session.get('user').user_id);
      })
      .orderBy('created_at', 'asc');

    const receiverUsername = await db.from('items')
      .select('users.username as receiver_username', 'users.profile_picture as receiver_profile_picture')
      .join('users', 'items.user_id', 'users.user_id')
      .where('item_id', item.item_id);

    return view.render('pages/communication/item-chat', {user: session.get('user'), item, allMessages, receiverUsername })
  }

  public async buyingPage({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    const seller = await db.from('user').select('*').where('user_id', item.user_id).first()

    return view.render('pages/item/kaufen', { user: session.get('user'), item, seller })
  }

  public async buyItem({ view, params, session }: HttpContext) {
    try {
      const listing = await db.from('listing').select('*').where('listing_id', params.listing_id).first()
      const recipient = await session.get('user').email;
      const receiver = `${env.get("MAIL_USERNAME")}`;

      await mail.send((message) => {
        message
          .to(recipient)
          .from(receiver)
          .subject('Kauf erfolgreich abgeschlossen')
          .htmlView('email_template/buy', {
            seller: session.get('user').username,
            listing: listing.title
          })
      })

      await db.from('listing').where('listing_id', params.listing_id).delete();

      return view.render('pages/successes/erfolg-seite', { user: session.get('user'), success: 'Kauf erfolgreich abgeschlossen, Sie erhalten in Kürze eine Bestätigung per E-Mail.' });
    } catch (error) {
      return view.render('pages/errors/fehler-seite.edge', { user: session.get('user'), error: 'Fehler beim Kaufen der Anzeige' });
    }
  }
}
