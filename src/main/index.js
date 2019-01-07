'use strict'

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let workerWindow
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
    minWidth: 1200,
    height: 600,
    minHeight: 600
  })

  workerWindow = new BrowserWindow({show: process.env.NODE_ENV === 'development'})
  workerWindow.loadURL(`${winURL}#/worker`)
  workerWindow.on('closed', () => {
    app.quit()
  })

  ipcMain.on('worker-ready', (event, data) => {
    mainWindow.loadURL(winURL)
  })

  ipcMain.on('specWatchDog-ready', (event, data) => {
    let appPath = app.getPath('home')
    let appDir = join(appPath, '.3gpp-electron')
    if (!existsSync(appDir)) {
      mkdirSync(appDir)
    }
    let specWatchListFilePath = join(appDir, 'specWatchList.json')
    if (!existsSync(specWatchListFilePath)) {
      writeFileSync(specWatchListFilePath, JSON.stringify([]))
    }
    event.sender.send('specWatchDog-filePath', JSON.stringify(specWatchListFilePath))
  })

  ipcMain.on('format-request', (event, data) => {
    workerWindow.webContents.send('format-request', data)
  })

  ipcMain.on('format-response', (event, data) => {
    mainWindow.webContents.send('format-response', data)
  })

  ipcMain.on('idc-request', (event, data) => {
    workerWindow.webContents.send('idc-request', data)
  })

  ipcMain.on('idc-response', (event, data) => {
    mainWindow.webContents.send('idc-response', data)
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
