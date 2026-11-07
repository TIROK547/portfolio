import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
if (fs.existsSync('.env')) process.loadEnvFile('.env')
process.env.NODE_ENV = 'production'
process.env.DATA_DIR = path.resolve(root, process.env.DATA_DIR || 'data')
process.env.HOSTNAME ||= '0.0.0.0'
const server = path.join(root, '.next/standalone/server.js')
if (!fs.existsSync(server)) throw new Error('Run npm run build before npm start')
await import(pathToFileURL(server).href)
