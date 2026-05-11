        // ==========================================
        // EXPORT / IMPORT CSV LOGIC (Sistem Parser & Validasi)
        // ==========================================
        function downloadCSV(filename, csvContent) {
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`File ${filename} berhasil diunduh.`, 'success');
        }

        // CSV Parser Pintar (Menangani string berkoma dalam kutipan)
        function parseCSVRow(str) {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        }

        function upsertLocalData(collection, item, fallbackKey = null) {
            let idx = -1;
            if(item.id !== undefined && item.id !== null && item.id !== '') {
                idx = collection.findIndex(x => String(x.id) === String(item.id));
            }
            if(idx === -1 && fallbackKey && item[fallbackKey]) {
                idx = collection.findIndex(x => String(x[fallbackKey]) === String(item[fallbackKey]));
            }

            if(idx > -1) {
                collection[idx] = item;
            } else {
                collection.push(item);
            }
        }

        // === IMPOR BANTUAN ===
        function downloadTemplateBantuan() {
            toggleDropdown('dropdown-bantuan'); 
            showLoading("Menyiapkan template CSV Bantuan...");
            setTimeout(() => {
                const header = "no_bantuan_import,kode_poktan,nama_poktan,jenis,sumber,bidang,nama_program,tahun,spesifikasi,volume,satuan,harga\n";
                const isiContoh = "BNT-001,KT-0001,Poktan Contoh,Hibah Barang,APBD DAK,Peternakan,Pengadaan Cangkul,2026,Cangkul Baja,10,unit,150000\n";
                downloadCSV("Template_Penyaluran_Bantuan.csv", header + isiContoh);
                hideLoading();
            }, 800);
        }

        function handleUploadBantuan(event) {
            const file = event.target.files[0];
            if(!file) return;
            toggleDropdown('dropdown-bantuan'); 
            showLoading(`Memvalidasi file CSV ${file.name}...`);
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
                
                if(lines.length < 2) {
                    showToast("File CSV kosong atau format salah.", "error");
                    hideLoading(); return;
                }
                
                const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().trim());
                const expectedHeaders = ['no_bantuan_import', 'kode_poktan', 'nama_poktan', 'jenis', 'sumber', 'bidang', 'nama_program', 'tahun', 'spesifikasi', 'volume', 'satuan', 'harga'];
                
                let headerMap = {};
                expectedHeaders.forEach(eh => { headerMap[eh] = headers.indexOf(eh); });
                
                if(headerMap['no_bantuan_import'] === -1 || headerMap['kode_poktan'] === -1 || headerMap['spesifikasi'] === -1) {
                    showToast("Format header CSV tidak sesuai template resmi.", "error");
                    hideLoading(); return;
                }
                
                let groupedData = {};
                let hasError = false;
                let errorMsg = '';
                
                // Mulai Validasi Baris demi baris
                for(let i=1; i<lines.length; i++) {
                    let cols = parseCSVRow(lines[i]);
                    let rowData = {};
                    expectedHeaders.forEach(eh => rowData[eh] = cols[headerMap[eh]]);
                    
                    let no_import = rowData['no_bantuan_import'];
                    let kode_poktan = rowData['kode_poktan'];
                    
                    if(!no_import || !kode_poktan) continue;
                    
                    // Validasi Kode Poktan: Wajib Terdaftar!
                    let poktanTarget = dummyPoktan.find(p => p.kode_poktan === kode_poktan);
                    if(!poktanTarget) {
                        hasError = true;
                        errorMsg = `Upload Gagal di Baris ${i+1}: Kode Poktan '${kode_poktan}' belum terdaftar di Sistem.`;
                        break;
                    }
                    
                    if(!groupedData[no_import]) {
                        groupedData[no_import] = {
                            id_poktan: poktanTarget.id,
                            jenis: rowData['jenis'],
                            sumber: rowData['sumber'],
                            bidang: rowData['bidang'],
                            nama_program: rowData['nama_program'],
                            tahun: parseInt(rowData['tahun']),
                            rincian: []
                        };
                    } else {
                        // Validasi Grouping: Pastikan header baris selanjutnya konsisten
                        let g = groupedData[no_import];
                        if(g.id_poktan !== poktanTarget.id || g.nama_program !== rowData['nama_program']) {
                            hasError = true;
                            errorMsg = `Gagal di Baris ${i+1}: Identitas nama program atau Poktan berbeda di nomor import '${no_import}'.`;
                            break;
                        }
                    }
                    
                    // Validasi Angka
                    let vol = parseFloat(rowData['volume']) || 0;
                    let hrg = parseFloat(rowData['harga']) || 0;
                    if(vol <= 0 || hrg < 0) {
                        hasError = true;
                        errorMsg = `Gagal di Baris ${i+1}: Volume harus lebih dari 0 dan Harga dilarang minus.`;
                        break;
                    }
                    
                    groupedData[no_import].rincian.push({
                        spesifikasi: rowData['spesifikasi'],
                        volume: vol,
                        satuan: rowData['satuan'],
                        harga: hrg,
                        total: vol * hrg
                    });
                }
                
                if(hasError) {
                    showToast(errorMsg, "error");
                    event.target.value = '';
                    hideLoading();
                    return;
                }
                
                let payloads = Object.values(groupedData);
                if(payloads.length === 0) {
                    showToast("Tidak ada data valid yang bisa dieksekusi.", "error");
                    hideLoading(); return;
                }
                
                showLoading(`Menyimpan ${payloads.length} paket bantuan...`);
                try {
                    // Panggil API Bulk Insert (Kita asumsikan Backend mendukung ini)
                    let res = await gasAPI('importBulkBantuan', payloads);
                    if(res.status === 'success' || IS_PREVIEW) {
                        const savedItems = IS_PREVIEW ? payloads : (res.data || payloads);
                        savedItems.forEach(p => {
                            if(IS_PREVIEW && !p.id) {
                                p.id = Date.now() + Math.floor(Math.random()*1000);
                            }
                            upsertLocalData(dummyBantuan, p);
                        });
                        showToast(`Mantap! ${payloads.length} Program Bantuan berhasil diimpor.`, "success");
                        event.target.value = '';
                        triggerAdminBantuanFilter();
                        updateDashboardStats();
                        updateChartData();
                        renderPublicTable();
                    }
                } catch(e) {
                    showToast("Gagal menyimpan ke database server.", "error");
                }
                hideLoading();
            };
            reader.readAsText(file);
        }

        // === IMPOR POKTAN ===
        function downloadTemplatePoktan() {
            toggleDropdown('dropdown-poktan');
            showLoading("Menyiapkan template CSV Poktan...");
            setTimeout(() => {
                const header = "id,kode_poktan,nama,ketua,kec,desa\n";
                const isiContoh = ",,Kelompok Tani Baru,Pak Sadi,Bawang,Gunungsari\n";
                downloadCSV("Template_Kelompok_Tani.csv", header + isiContoh);
                setTimeout(() => { showToast("Info: Kosongkan ID dan Kode Poktan untuk tambah data baru.", "info"); }, 1500);
                hideLoading();
            }, 800);
        }

        function handleUploadPoktan(event) {
            const file = event.target.files[0];
            if(!file) return;
            toggleDropdown('dropdown-poktan');
            showLoading(`Memvalidasi file CSV ${file.name}...`);
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
                if(lines.length < 2) {
                    showToast("File CSV kosong atau format salah.", "error");
                    hideLoading(); return;
                }
                
                const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().trim());
                const required = ['nama', 'ketua', 'kec', 'desa'];
                let headerMap = {};
                headers.forEach((h, idx) => headerMap[h] = idx);
                
                if(required.some(r => headerMap[r] === undefined)) {
                    showToast("Format header CSV tidak sesuai. Wajib ada: nama, ketua, kec, desa.", "error");
                    hideLoading(); return;
                }
                
                let payloads = [];
                let hasError = false;
                let errorMsg = '';
                
                for(let i=1; i<lines.length; i++) {
                    let cols = parseCSVRow(lines[i]);
                    let obj = {};
                    headers.forEach(h => obj[h] = cols[headerMap[h]]);
                    
                    if(!obj.nama || !obj.ketua || !obj.kec || !obj.desa) {
                        hasError = true;
                        errorMsg = `Gagal di Baris ${i+1}: Kolom wajib (Nama, Ketua, Kec, Desa) tidak boleh kosong.`;
                        break;
                    }
                    
                    payloads.push({
                        id: obj.id ? parseInt(obj.id) : null,
                        kode_poktan: obj.kode_poktan || null, // Kosong? Akan dibuatkan oleh Backend/Sistem
                        nama: obj.nama,
                        ketua: obj.ketua,
                        kec: obj.kec,
                        desa: obj.desa
                    });
                }
                
                if(hasError) {
                    showToast(errorMsg, "error");
                    event.target.value = '';
                    hideLoading();
                    return;
                }
                
                showLoading(`Memproses ${payloads.length} data Kelompok Tani...`);
                try {
                    let res = await gasAPI('importBulkPoktan', payloads);
                    if(res.status === 'success' || IS_PREVIEW) {
                        const savedItems = IS_PREVIEW ? payloads : (res.data || payloads);
                        savedItems.forEach(p => {
                            if(IS_PREVIEW && !p.id) {
                                p.id = Date.now() + Math.floor(Math.random()*1000);
                                p.kode_poktan = p.kode_poktan || 'KT-' + Math.floor(1000 + Math.random()*9000);
                            }
                            upsertLocalData(dummyPoktan, p, 'kode_poktan');
                        });
                        showToast(`Selesai! ${payloads.length} Kelompok Tani berhasil diimpor/diupdate.`, "success");
                        event.target.value = '';
                        triggerAdminPoktanFilter();
                        updateDashboardStats();
                        updateChartData();
                        renderPublicTable();
                    }
                } catch(e) {
                    showToast("Gagal menyimpan ke server database.", "error");
                }
                hideLoading();
            };
            reader.readAsText(file);
        }
