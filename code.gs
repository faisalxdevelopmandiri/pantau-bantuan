/**
 * BACKEND GOOGLE APPS SCRIPT
 * Untuk WebApp Transparansi Bantuan
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetsInfo = {
    'Users': ['id', 'username', 'password', 'name', 'role'],
    'Poktan': ['id', 'kode_poktan', 'nama', 'ketua', 'kec', 'desa'],
    'Bantuan': ['id', 'jenis', 'sumber', 'bidang', 'id_poktan', 'nama_program', 'tahun', 'rincian'],
    'Settings': ['id', 'pemda', 'instansi', 'alamat', 'jabatan', 'daerah', 'pangkat', 'nama', 'nip', 'logoBase64'],
    'Tahun': ['tahun']
  };

  for (let sheetName in sheetsInfo) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Bold headers
      sheet.appendRow(sheetsInfo[sheetName]);
      sheet.getRange(1, 1, 1, sheetsInfo[sheetName].length).setFontWeight("bold").setBackground("#e2e8f0");
    } else {
      // AUTO-MIGRASI: Cek header baru (seperti kode_poktan) dan tambahkan jika belum ada
      let lastCol = sheet.getLastColumn();
      let existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
      let requiredHeaders = sheetsInfo[sheetName];
      
      requiredHeaders.forEach(reqHeader => {
        if (existingHeaders.indexOf(reqHeader) === -1) {
          let newCol = sheet.getLastColumn() + 1;
          sheet.getRange(1, newCol).setValue(reqHeader).setFontWeight("bold").setBackground("#e2e8f0");
        }
      });
    }
  }

  // Buat Admin Pertama Jika Kosong
  let userSheet = ss.getSheetByName('Users');
  if (userSheet.getLastRow() === 1) {
    userSheet.appendRow([new Date().getTime(), 'admin', 'admin2026', 'Super Administrator', 'super_admin']);
  }
  
  // Buat Tahun Default Jika Kosong
  let tahunSheet = ss.getSheetByName('Tahun');
  if (tahunSheet.getLastRow() === 1) {
    tahunSheet.appendRow([new Date().getFullYear()]);
  }
}

// -------------------------------------------------------------
// ENDPOINT UTAMA UNTUK FETCH JSON
// -------------------------------------------------------------
function doPost(e) {
  const output = { status: 'error', message: 'Unknown action' };
  
  try {
    // Parsing JSON dari frontend
    const req = JSON.parse(e.postData.contents);
    const action = req.action;
    const payload = req.payload;

    if (action === 'init') {
      output.data = {
        users: getSheetDataAsObjects('Users'),
        poktan: getSheetDataAsObjects('Poktan'),
        bantuan: getSheetDataAsObjects('Bantuan'),
        settings: getSheetDataAsObjects('Settings')[0] || null,
        tahun: getSheetDataAsObjects('Tahun').map(t => parseInt(t.tahun))
      };
      output.status = 'success';
    } 
    else if (action === 'savePoktan') {
      output.data = saveOrUpdateRow('Poktan', payload);
      output.status = 'success';
    } 
    else if (action === 'deletePoktan') {
      deleteRow('Poktan', payload.id);
      output.status = 'success';
    } 
    else if (action === 'saveBantuan') {
      output.data = saveOrUpdateRow('Bantuan', payload);
      output.status = 'success';
    } 
    else if (action === 'deleteBantuan') {
      deleteRow('Bantuan', payload.id);
      output.status = 'success';
    } 
    else if (action === 'saveUser') {
      output.data = saveOrUpdateRow('Users', payload);
      output.status = 'success';
    } 
    else if (action === 'deleteUser') {
      deleteRow('Users', payload.id);
      output.status = 'success';
    } 
    else if (action === 'saveTahun') {
      output.data = saveOrUpdateRow('Tahun', payload, true); // No ID validation needed
      output.status = 'success';
    }
    else if (action === 'deleteTahun') {
      deleteRowByField('Tahun', 'tahun', payload.tahun);
      output.status = 'success';
    }
    else if (action === 'saveSettings') {
      output.data = saveOrUpdateRow('Settings', payload);
      output.status = 'success';
    } 
    // === API BARU UNTUK BULK IMPORT CSV ===
    else if (action === 'importBulkPoktan') {
      output.data = importBulkData('Poktan', payload);
      output.status = 'success';
    }
    else if (action === 'importBulkBantuan') {
      output.data = importBulkData('Bantuan', payload);
      output.status = 'success';
    }
  } catch (err) {
    output.message = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

// Untuk memastikan API tidak mati jika diakses via GET (Browser URL)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: "success", message: "API Backend GAS Berjalan Normal"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// FUNGSI HELPER CRUD DATABASE
// -------------------------------------------------------------

function importBulkData(sheetName, payloads) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const existingData = sheet.getDataRange().getValues();
  
  let idMap = {};
  for (let i = 1; i < existingData.length; i++) {
    idMap[existingData[i][0]] = i; 
  }

  let rowsToAppend = [];
  let isDataUpdated = false;
  let currentTime = new Date().getTime();

  payloads.forEach((payload, index) => {
    // Generate ID jika kosong
    if (!payload.id) {
      payload.id = currentTime + index; // Ditambah index agar unik saat perulangan cepat
    }
    
    // Generate kode_poktan jika kosong (hanya berlaku saat import Poktan)
    if (sheetName === 'Poktan' && !payload.kode_poktan) {
      payload.kode_poktan = 'KT-' + ('0000' + Math.floor(Math.random() * 10000)).slice(-4);
    }

    let rowData = [];
    for (let j = 0; j < headers.length; j++) {
      let key = headers[j];
      let val = payload[key] !== undefined ? payload[key] : '';
      if (key === 'rincian') {
        val = JSON.stringify(val || []);
      }
      rowData.push(val);
    }

    if (idMap[payload.id]) {
      existingData[idMap[payload.id]] = rowData;
      isDataUpdated = true;
    } else {
      rowsToAppend.push(rowData);
    }
  });

  if (isDataUpdated) {
    sheet.getRange(1, 1, existingData.length, headers.length).setValues(existingData);
  }
  
  if (rowsToAppend.length > 0) {
    let startRow = isDataUpdated ? existingData.length + 1 : sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
  }
  
  return payloads; // <-- SATU-SATUNYA YANG BERUBAH: Mengembalikan objek data seutuhnya agar tabel Frontend langsung update
}

function getSheetDataAsObjects(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Hanya header
  
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = data[i][j];
      
      // Parse JSON otomatis untuk kolom 'rincian'
      if (headers[j] === 'rincian') {
        try { val = JSON.parse(val); } catch(e) { val = []; }
      }
      obj[headers[j]] = val;
    }
    result.push(obj);
  }
  return result;
}

function saveOrUpdateRow(sheetName, payload, bypassIdCheck = false) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let rowIndex = -1;
  
  if (!bypassIdCheck) {
    if (payload.id) {
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == payload.id) {
          rowIndex = i + 1; // Index baris Google Sheet (dimulai dari 1)
          break;
        }
      }
    } else {
      // Jika tidak ada ID, buat ID unik (timestamp)
      payload.id = new Date().getTime();
    }
  }

  let rowData = [];
  for (let j = 0; j < headers.length; j++) {
    let key = headers[j];
    let val = payload[key] !== undefined ? payload[key] : '';
    
    // Stringify JSON untuk kolom rincian sebelum disimpan ke Sheet
    if (key === 'rincian') {
      val = JSON.stringify(val || []);
    }
    rowData.push(val);
  }

  if (rowIndex > -1) {
    // Update baris lama
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    // Tambah baris baru
    sheet.appendRow(rowData);
  }
  
  return payload;
}

function deleteRow(sheetName, id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function deleteRowByField(sheetName, fieldName, fieldValue) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let fieldIndex = headers.indexOf(fieldName);
  if(fieldIndex === -1) return;
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][fieldIndex] == fieldValue) {
      sheet.deleteRow(i + 1);
    }
  }
}