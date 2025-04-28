import Logger from '@novice1/logger'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path'

async function buildDT() {
    Logger.info('scripts/buildDT')

    const sourceFilePath = `${dirname(fileURLToPath(import.meta.url))}/../types/index.d.ts`
    const destFilePath = `${dirname(fileURLToPath(import.meta.url))}/../index.d.ts`

    Logger.info(`source = ${sourceFilePath}`)
    Logger.info(`destination = ${destFilePath}`)

    const content = await fs.promises.readFile(sourceFilePath, { encoding: 'utf-8' })

    // remove "export {" line
    const parsedContent = content.replace(/^.*export \{.*$/mg, '');

    Logger.warn(parsedContent)

    await fs.promises.appendFile(destFilePath, parsedContent, { encoding: 'utf-8' })

    Logger.info('Done')
}

buildDT()