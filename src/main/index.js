'use strict'

import { fork } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as request from 'request'
import { parse } from 'url'
import * as urlJoin from 'url-join'
import { app, BrowserWindow, ipcMain } from 'electron'
import { repository, version } from '../../package.json'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let workerWindow
let worker
const workerPath = process.env.NODE_ENV === 'development'
  ? 'src/worker/worker.js'
  : join(__dirname, 'worker/worker.js')
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 1200,
    height: 600
  })

  workerWindow = new BrowserWindow({show: process.env.NODE_ENV === 'development'})
  workerWindow.loadURL(`${winURL}#/worker`)
  workerWindow.on('closed', () => {
    app.quit()
  })

  worker = fork(workerPath)
  worker.on('message', (msg) => {
    const {event, data} = msg
    mainWindow.webContents.send(event, data)
  })

  ipcMain.on('worker-ready', (event, data) => {
    let appPath = app.getPath('home')
    let appDir = join(appPath, '.3gpp-electron')
    if (!existsSync(appDir)) {
      mkdirSync(appDir)
    }
    mainWindow.loadURL(winURL)
  })

  ipcMain.on('version-check-request', (event, data) => {
    if (event.sender === mainWindow.webContents) {
      checkVersion(event)
    }
  })

  ipcMain.on('ie-list-request', (event, data) => {
    workerWindow.webContents.send('ie-list-request', data)
  })

  ipcMain.on('ie-list-response', (event, data) => {
    mainWindow.webContents.send('ie-list-response', data)
  })

  ipcMain.on('format-request', (event, data) => {
    worker.send({
      event: 'format-request',
      data
    })
  })

  ipcMain.on('format-path-response', (event, data) => {
    worker.send({
      event: 'format-path-response',
      data
    })
  })

  ipcMain.on('format-response', (event, data) => {
    mainWindow.webContents.send('format-response', data)
  })

  ipcMain.on('diff-request', (event, data) => {
    workerWindow.webContents.send('diff-request', data)
  })

  ipcMain.on('diff-response', (event, data) => {
    mainWindow.webContents.send('diff-response', data)
  })

  mainWindow.on('closed', () => {
    app.quit()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

function checkVersion (event) {
  let appPath = app.getPath('home')
  let appDir = join(appPath, '.3gpp-electron')
  if (!existsSync(appDir)) {
    mkdirSync(appDir)
  }
  let lastVersionCheckFilePath = join(appDir, 'lastVersionCheck.json')
  if (!existsSync(lastVersionCheckFilePath)) {
    writeFileSync(lastVersionCheckFilePath, JSON.stringify({}))
  }
  let lastVersionCheck = JSON.parse(readFileSync(lastVersionCheckFilePath, 'utf8'))
  let timeDiffMs = new Date().getTime() - new Date(lastVersionCheck.date || null).getTime()
  if (timeDiffMs / 1000 / 60 / 60 / 24 < 1) {
    return
  }
  const urlObj = parse(repository.url)
  const apiReleasesUrl = urlJoin(urlObj.protocol, 'api.github.com', 'repos', urlObj.path, 'releases/latest')
  const headers = {
    'User-Agent': 'gsongsong/3gpp-electron',
    'Authorization': 'token 5c68b07d9bd331aef636501c0ff8172a495a30d6'
  }
  request({url: apiReleasesUrl, headers: headers},
    (e, res, body) => {
      let json = {}
      try {
        json = JSON.parse(body)
      } catch (e) {
        return
      }
      lastVersionCheck.date = new Date()
      writeFileSync(lastVersionCheckFilePath, JSON.stringify(lastVersionCheck))
      if (!('tag_name' in json)) {
        return
      }
      const tagName = json.tag_name
      const last = tagName.substring(1).split('.').map(el => Number(el))
      const curr = version.split('.').map(el => Number(el))
      for (let i = 0; i < last.length; i++) {
        if (last[i] > curr[i]) {
          event.sender.send('new-version-available')
          return
        } else if (last[i] === curr[i]) {
          continue
        } else {
          return
        }
      }
    })
}
