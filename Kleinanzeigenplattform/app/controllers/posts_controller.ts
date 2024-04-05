// import type { HttpContext } from '@adonisjs/core/http'

import type {HttpContext} from "@adonisjs/core/http";

export default class PostsController {
public async profil({ view }: HttpContext) {
    return view.render('pages/konto-profil')
  }
}
