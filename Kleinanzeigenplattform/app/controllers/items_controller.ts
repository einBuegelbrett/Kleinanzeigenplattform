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
  public async itemDetail({ view, params, auth }: HttpContext) {
    await auth.check()
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Anzeige nicht gefunden' });
    }

    const seller = await User.findBy('user_id', item.user_id)
    const images = await Image.findManyBy('item_id', item.item_id)

    return view.render('pages/item/item-details', { item, seller, images })
  }

  public async activateItem({ view, params, auth }: HttpContext) {
    await auth.check()
    const item = await Item.findBy('item_id', params.item_id)

    if(!item){
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Anzeige nicht gefunden' });
    }

    // change the state of the item
    item.active = !item.active
    await item.save()
    const seller = await User.findBy('user_id', item.user_id)
    const images = await Image.findManyBy('item_id', item.item_id)

    return view.render('pages/item/item-details', { item, seller, images })
  }

  public async getSubmitItemPage({ view, auth }: HttpContext) {
    await auth.check()
    return view.render('pages/item/submit-item-page')
  }

  public async postItem({ request, view, auth }: HttpContext) {
    await auth.check()
    const { title, price, description } = await request.validateUsing(submitItem)
    try {
      const uploadedImages = request.files('images', {size: '5mb', extnames: ['jpg', 'png', 'jpeg']})
      const user_id = auth.user!.user_id

      if (uploadedImages === null) {
        return view.render('pages/item/submit-item-page', { error: 'Bitte Bild hochladen' })
      }

      const item = await Item.create({ title, description, price, user_id })

      for (const uploadedImage of uploadedImages) {
        const image = new Image()
        await uploadedImage.move(app.publicPath('uploads'), { name: `${cuid()}.${uploadedImage.extname}`, overwrite: true });

        if (!uploadedImage.isValid || !uploadedImage.fileName){
          return await view.render('pages/item/submit-item-page', { error: 'Fehler beim Hochladen des Bildes' });
        }

        image.path = uploadedImage.fileName
        image.item_id = item.item_id
        await image.save()
      }

      return view.render('pages/item/submit-item-page', { success: 'Anzeige wurde erfolgreich erstellt' })
    } catch (error) {
      return view.render('pages/item/submit-item-page', { error })
    }
  }

  public async ownItems({ view, auth }: HttpContext) {
    await auth.check()
    try {
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').where('user_id', auth.user!.user_id).groupBy('items.item_id');
      return view.render('pages/item/own-items.edge', { items });
    } catch (error) {
      return view.render('pages/item/own-items.edge', { error: 'Fehler beim Laden der Anzeigen' });
    }
  }

  public async deleteItem({view, params, auth }: HttpContext) {
    await auth.check()
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Anzeige nicht gefunden' });
      }

      const deletedItemTitle = item.title
      await item.delete()
      const items = await db.from('items').select('*').innerJoin('images', 'items.item_id', 'images.item_id').where('items.user_id', auth.user!.user_id).groupBy('items.item_id');

      return view.render('pages/item/own-items.edge', { items, success: deletedItemTitle + ' wurde erfolgreich gelöscht' });
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Fehler beim Löschen der Anzeige' });
    }
  }

  public async itemChat({view, params, auth }: HttpContext) {
    await auth.check()
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Anzeige nicht gefunden' });
      }

      if ((auth.user!.user_id != params.user_id) && (auth.user!.user_id != item.user_id)) {
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Nicht erlaubt'})
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
      if(auth.user!.user_id === item.user_id) {
        chatPartner = await User.findBy('user_id', allMessages[0].sender_id)
      } else {
        chatPartner = allMessages[0] ? await User.findBy('user_id', allMessages[0].receiver_id) : await User.findBy('user_id', auth.user!.user_id)
      }

      return view.render('pages/communication/item-chat', { item, allMessages, chatPartner })
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Fehler beim Laden des Chats' });
    }
  }

  public async sendMessage({view, params, request, auth }: HttpContext) {
    await auth.check()
    const message  = await request.validateUsing(messageValidator)
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', {  error: 'Anzeige nicht gefunden' });
      }

      if(auth.user!.user_id === item.user_id) {
        await Message.create({content: message.message, item_id: item.item_id,  sender_id: item.user_id, receiver_id: params.user_id })
      } else {
        await Message.create({content: message.message, item_id: item.item_id,  sender_id: params.user_id, receiver_id: item.user_id })
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

      let chatPartner
      if(auth.user!.user_id === item.user_id) {
        chatPartner = await User.findBy('user_id', allMessages[0].sender_id)
      } else {
        chatPartner = await User.findBy('user_id', allMessages[0].receiver_id)
      }

      return view.render('pages/communication/item-chat', { item, allMessages, chatPartner })
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Fehler beim Senden der Nachricht' });
    }
  }

  public async buyingPage({ view, params, auth }: HttpContext) {
    await auth.check()
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Anzeige nicht gefunden' });
      }

      const seller = await User.findBy('user_id', item.user_id)

    return view.render('pages/purchase/purchase-page', { item, seller })
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Fehler beim Kaufen der Anzeige' });
    }
  }

  public async buyItem({ view, params, request, auth }: HttpContext) {
    await auth.check()
    await creditCardValidator.validate(request.all())
    try {
      const item = await Item.findBy('item_id', params.item_id)

      if(!item){
        return view.render('pages/errors-and-successes/error-and-success-page.edge', {  error: 'Anzeige nicht gefunden' });
      }

      const recipient = auth.user!.email;
      const receiver = `${env.get("MAIL_USERNAME")}`;

      await mail.send((message) => {
        message
          .to(recipient)
          .from(receiver)
          .subject('Kauf erfolgreich abgeschlossen')
          .htmlView('email_template/purchase-mail', {
            seller: auth.user!.username,
            item: item.title
          })
      })

      await item.delete()

      return view.render('pages/errors-and-successes/error-and-success-page', { success: 'Kauf erfolgreich abgeschlossen, Sie erhalten in Kürze eine Bestätigung per E-Mail.' });
    } catch (error) {
      return view.render('pages/errors-and-successes/error-and-success-page.edge', { error: 'Fehler beim Kaufen der Anzeige' });
    }
  }
}
