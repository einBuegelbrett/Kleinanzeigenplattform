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
import {creditCardValidator} from "#validators/purchase_validator";
import {submitItem} from "#validators/item_validator";
import {messageValidator} from "#validators/user_validator";

export default class ItemsController {
  public async itemDetail({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    const seller = await User.findBy('user_id', item.user_id)
    const images = await Image.findManyBy('item_id', item.item_id)

    return view.render('pages/item/item-details', { user: session.get('user'), item, seller, images })
  }

  public async activateItem({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
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
    await submitItem.validate(request.all())

    try {
      const item = new Item()
      const image = new Image()
      const uploadedImages = request.files('images', {size: '5mb', extnames: ['jpg', 'png', 'jpeg']})

      if (uploadedImages === null) {
        return view.render('pages/item/submit-item-page', {error: 'Bitte Bild hochladen', user: session.get('user')})
      }

      item.title = request.input('title')
      item.description = request.input('description')
      item.price = request.input('price')
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
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
      }

      const deletedItemTitle = item.title
      await item.delete()
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').where('items.user_id', session.get('user').user_id).groupBy('items.item_id');

      return view.render('pages/item/own-items.edge', { user: session.get('user'), items, success: deletedItemTitle + ' wurde erfolgreich gelöscht' });
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Fehler beim Löschen der Anzeige' });
    }
  }

  public async itemChat({view, params, session}: HttpContext) {
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
    }

    if ((await session.get('user')).user_id != params.user_id && (await session.get('user')).user_id != item.user_id) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Nicht erlaubt'})
    }

    const allMessages = await Message.query()
      .where(function (query) {
        query
          .where('sender_id', item.user_id)
          .where('receiver_id', params.user_id)
          .where('item_id', item.item_id)
      })
      .orWhere(function (query) {
        query
          .where('sender_id', params.user_id)
          .where('receiver_id', item.user_id)
          .where('item_id', item.item_id)
      }).orderBy('created_at', 'asc')

    // The first message always comes from the person that is interested in the item
    let chatPartner
    if(session.get('user').user_id === item.user_id) {
      chatPartner = await User.findBy('user_id', allMessages[0].sender_id)
    } else {
      chatPartner = allMessages[0] ? await User.findBy('user_id', allMessages[0].receiver_id) : await User.findBy('user_id', session.get('user').user_id)
    }

    return view.render('pages/communication/item-chat', { user: session.get('user'), item, allMessages, chatPartner })
  }

  public async sendMessage({view, params, request, session}: HttpContext) {
    await messageValidator.validate(request.all())

    try {
      const item = await Item.findBy('item_id', params.item_id)
      const message = new Message()

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
      }

      if(session.get('user').user_id === item.user_id) {
        message.sender_id = item.user_id
        message.receiver_id = params.user_id
      } else {
        message.sender_id = params.user_id
        message.receiver_id = item.user_id
      }

      message.item_id = item.item_id
      message.content = request.input('nachricht');
      await message.save()

      const allMessages = await Message.query()
        .where(function (query) {
          query
            .where('sender_id', item.user_id)
            .where('receiver_id', params.user_id)
            .where('item_id', item.item_id)
        })
        .orWhere(function (query) {
          query
            .where('sender_id', params.user_id)
            .where('receiver_id', item.user_id)
            .where('item_id', item.item_id)
        }).orderBy('created_at', 'asc')

      let chatPartner
      if(session.get('user').user_id === item.user_id) {
        chatPartner = await User.findBy('user_id', allMessages[0].sender_id)
      } else {
        chatPartner = await User.findBy('user_id', allMessages[0].receiver_id)
      }

      return view.render('pages/communication/item-chat', {user: session.get('user'), item, allMessages, chatPartner })
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Fehler beim Senden der Nachricht' });
    }
  }

  public async buyingPage({view, params, session}: HttpContext) {
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
      }

      const seller = await User.findBy('user_id', item.user_id)

    return view.render('pages/purchase/purchase-page', { user: session.get('user'), item, seller })
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Fehler beim Kaufen der Anzeige' });
    }
  }

  public async buyItem({ view, params, request, session }: HttpContext) {
    await creditCardValidator.validate(request.all())

    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Anzeige nicht gefunden' });
      }

      const recipient = await session.get('user').email;
      const receiver = `${env.get("MAIL_USERNAME")}`;

      await mail.send((message) => {
        message
          .to(recipient)
          .from(receiver)
          .subject('Kauf erfolgreich abgeschlossen')
          .htmlView('email_template/purchase-mail', {
            seller: session.get('user').username,
            item: item.title
          })
      })

      await item.delete()

      return view.render('pages/errors-and-successes/error-and-success-page', { user: session.get('user'), success: 'Kauf erfolgreich abgeschlossen, Sie erhalten in Kürze eine Bestätigung per E-Mail.' });
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { user: session.get('user'), error: 'Fehler beim Kaufen der Anzeige' });
    }
  }
}
