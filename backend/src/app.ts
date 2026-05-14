import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'

import helmet from 'helmet'
import rateLimit from 'express-rate-limit'


import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
const limiter = rateLimit({
    // Указываем интервал времени, в рамках которого зададим ограничение
    windowMs: 15 * 60 * 1000,
    // Ограничиваем количество запросов в этом интервале
    limit: 1000,
    // Включаем заголовки нового типа `RateLimit-*`
    standardHeaders: true,
    // Отключаем заголовки старого типа `X-RateLimit-*`
    legacyHeaders: false,
})

const { PORT = 3000, ORIGIN_ALLOW = 'http://localhost' } = process.env

const app = express()

app.use(cookieParser())

app.use(cors({
    origin: ORIGIN_ALLOW,
    credentials: true,
}))

app.options('*', cors({
    origin: ORIGIN_ALLOW,
    credentials: true,
}))

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: {
        policy: 'cross-origin',
    },
}
))

app.use(limiter) 

app.use(urlencoded({
    extended: true,
    limit: '10kb',
}))

app.use(json({
    limit: '10kb',
}))

app.use(express.static(path.join(__dirname, 'public')))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(routes)

app.use(errors())

app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)

        app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()