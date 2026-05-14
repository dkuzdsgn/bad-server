import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { mkdirSync } from 'fs'
import { join, extname } from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.memoryStorage()

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = async (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    try {
        if (!types.includes(file.mimetype)) {
            return cb(new Error('Неверный тип файла'))
        }

        const metadata = await sharp(file.buffer).metadata()

        if (!metadata.format) {
            return cb(new Error('Файл не является изображением'))
        }

        return cb(null, true)
    } catch {
        return cb(new Error('Файл не является изображением'))
    }
}

export default multer({
    storage, fileFilter, limits: {
        fileSize: 10 * 1024 * 1024,
    },
})
