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

// We need MessageType for the getMessages function. That's because after formatting the date, other attributes like sender_id can no longer be called otherwise
type MessageType = {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  item_id: number;
  content: string;
  created_at: string;
};

// Function is called multiple times, so it is extracted into a function. The function is called in
// getMessages is a function that returns all messages between two users for a specific item and formats the date
async function getMessages(item: Item, params_user_id: number){
  const allMessages = await Message.query()
    .where(query => {
      query
        .where('sender_id', item.user_id)
        .where('receiver_id', params_user_id)
        .where('item_id', item.item_id)
    })
    .orWhere(query => {
      query
        .where('sender_id', params_user_id)
        .where('receiver_id', item.user_id)
        .where('item_id', item.item_id)
    }).orderBy('created_at', 'asc')

  // Format the date in all messages because it is not formatted in the database
  return allMessages.map(message => ({
    ...message.$attributes,
    created_at: message.created_at.setZone('Europe/Berlin').toFormat('dd-MM-yyyy HH:mm')
  })) as MessageType[];
}

// Start of the ItemsController
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
    let { title, price, description, images } = await request.validateUsing(submitItem)
    try {
      const user_id = auth.user!.user_id

      if (images === null) {
        return view.render('pages/item/submit-item-page', { error: 'Bitte Bild hochladen' })
      }

      const item = await Item.create({ title, description, price, user_id })

      // if only one image is uploaded, it is transformed into an array to simplify the code (see the item_validator.ts file)
      if(!Array.isArray(images)) {
        images = [images]
      }

      for (const uploadedImage of images) {
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

      const allMessages = await getMessages(item, params.user_id)

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

      const allMessages = await getMessages(item, params.user_id)

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
