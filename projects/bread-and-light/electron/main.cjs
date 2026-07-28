const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { app, BrowserWindow, Menu, session, shell } = require('electron')

const isMac = process.platform === 'darwin'
const productionCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

function createApplicationMenu() {
  if (!isMac) {
    Menu.setApplicationMenu(null)
    return
  }

  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    { role: 'help', submenu: [] },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow() {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  const indexUrl = pathToFileURL(indexPath).toString()
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 640,
    minHeight: 620,
    show: false,
    title: 'Bread & Light',
    backgroundColor: '#f2eee3',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (new URL(url).protocol === 'https:') void shell.openExternal(url)
    } catch {
      // Invalid links remain blocked.
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== indexUrl) {
      event.preventDefault()
      try {
        if (new URL(url).protocol === 'https:') void shell.openExternal(url)
      } catch {
        // Invalid navigation remains blocked.
      }
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  void mainWindow.loadFile(indexPath)
}

app.whenReady().then(() => {
  app.name = 'Bread & Light'
  createApplicationMenu()

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [productionCsp],
      },
    })
  })

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})
