import express from 'express'
import cors from 'cors'
import { parse } from 'qs'
import * as path from 'path'

import { router as apiRouter } from './routers/api'
import { createAppContext } from './context'
import { InMemoryGoodsRepository } from './repo/InMemoryGoodsRepository'

export const createExpressApp = (goodsRepository: InMemoryGoodsRepository) => {
  const app = express()
  app.set('query parser', (queryString: string) => parse(queryString, {
    comma: true
  }))

  app.use(cors())
  app.use(express.json())
  app.use(express.static('src/client/build'))

  app.use((req, _res, next) => {
    Object.assign(req, createAppContext(goodsRepository))
    next()
  })

  const externalEndpointsRegex = /^\/(?!_)/ // all routes that start from _ are reserved for internal usage
  app.get(externalEndpointsRegex, (_req, res) => {
    res.status(200).sendFile('index.html', { root: path.resolve(__dirname, '/src/client/build') })
  })

  app.use('/_api', apiRouter)

  return app
}
