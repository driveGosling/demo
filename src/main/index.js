import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: '5432',
  database: 'prac0',
  max: 20,
  idleTimeoutMillis: 30000
});

async function executeQuery(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

async function getPartners() {
  try {
    const result = await executeQuery('SELECT * FROM partners');
    return result.rows;
  } catch (error) {
    console.error('Error fetching partners:', error);
    return { error: error.message };
  }
}

async function createPartner(event, partner) {
  const { type, name, ceo, email, phone, address, rating } = partner;

  try {
    const result = await executeQuery(
      `INSERT into partners (type, name, ceo, mail, phone, address, rating) values('${type}', '${name}', '${ceo}', '${email}', '${phone}', '${address}', ${rating})`
    );
    dialog.showMessageBox({ message: 'Успех! Партнер создан' });
    return result.rows;
  } catch (error) {
    dialog.showErrorBox('Ошибка', 'Ошибка создания партнера');
    return { error: error.message };
  }
}

async function updatePartner(event, partner) {
  const { id, type, name, ceo, email, phone, address, rating } = partner;
  try {
    await executeQuery(`UPDATE partners
      SET name='${name}', type='${type}', ceo='${ceo}', mail='${email}', phone='${phone}', address='${address}', rating='${rating}'
      WHERE partners.id = ${id};`);
    dialog.showMessageBox({ message: 'Успех! Данные обновлены' });
    return;
  } catch (error) {
    dialog.showErrorBox('Ошибка', 'Ошибка обновления партнера');
    return { error: error.message };
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');
  ipcMain.handle('getPartners', getPartners);
  ipcMain.handle('createPartner', createPartner);
  ipcMain.handle('updatePartner', updatePartner);
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
