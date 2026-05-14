import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import crypto from 'crypto'
import fs from 'fs'
import { join } from 'path'
import sharp from 'sharp'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (req.file.size < 2 * 1024) {
        return next(
            new BadRequestError('Файл слишком маленький')
        )
    }
    try {
        const extensions: Record<string, string> = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/gif': '.gif',
            'image/svg+xml': '.svg',
        }

        const extension = extensions[req.file.mimetype]

        if (!extension) {
            return next(new BadRequestError('Неверный тип файла'))
        }

        const safeFileName = `${crypto.randomUUID()}${extension}`

        const uploadDir = process.env.UPLOAD_PATH
            ? join(__dirname, `../public/${process.env.UPLOAD_PATH}`)
            : join(__dirname, '../public')

        fs.mkdirSync(uploadDir, { recursive: true })

        const uploadPath = join(uploadDir, safeFileName)

        const metadata = await sharp(req.file.buffer).metadata()

        if (!metadata.format) {
            return next(new BadRequestError('Файл не является изображением'))
        }
        fs.writeFileSync(
            uploadPath,
            new Uint8Array(req.file.buffer)
        )
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${safeFileName}`
            : `/${safeFileName}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
