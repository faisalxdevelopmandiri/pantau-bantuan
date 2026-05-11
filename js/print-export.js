        // ==========================================
        // FITUR CETAK & EXPORT EXCEL 
        // ==========================================

        function initPrintSettingsForm() {
            document.getElementById('print-pemda').value = printSettings.pemda;
            document.getElementById('print-instansi').value = printSettings.instansi;
            document.getElementById('print-alamat').value = printSettings.alamat;
            document.getElementById('print-jabatan').value = printSettings.jabatan;
            document.getElementById('print-daerah').value = printSettings.daerah;
            document.getElementById('print-pangkat').value = printSettings.pangkat;
            document.getElementById('print-nama').value = printSettings.nama;
            document.getElementById('print-nip').value = printSettings.nip;
            if(printSettings.logoBase64) {
                document.getElementById('preview-logo-cetak').src = printSettings.logoBase64;
            } else {
                document.getElementById('preview-logo-cetak').src = APP_ASSETS.logoMark;
            }
        }

        function handleLogoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('preview-logo-cetak').src = e.target.result;
                    printSettings.logoBase64 = e.target.result;
                    showToast('Logo berhasil diunggah dan dikonversi.', 'success');
                }
                reader.readAsDataURL(file);
            }
        }

        function savePrintSettings(e) {
            e.preventDefault();
            showConfirm(
                "Simpan Pengaturan Cetak?", 
                "Apakah Anda yakin ingin menyimpan format kop surat dan tanda tangan ini?",
                async () => {
                    showLoading("Menyimpan format cetak...");
                    const payload = {
                        id: printSettings.id || Date.now(), 
                        pemda: document.getElementById('print-pemda').value,
                        instansi: document.getElementById('print-instansi').value,
                        alamat: document.getElementById('print-alamat').value,
                        jabatan: document.getElementById('print-jabatan').value,
                        daerah: document.getElementById('print-daerah').value,
                        pangkat: document.getElementById('print-pangkat').value,
                        nama: document.getElementById('print-nama').value,
                        nip: document.getElementById('print-nip').value,
                        logoBase64: printSettings.logoBase64
                    };

                    try {
                        let res = await gasAPI('saveSettings', payload);
                        if(res.status === 'success' || IS_PREVIEW) {
                            printSettings = payload;
                            showToast('Format cetak dan Kop Surat berhasil disimpan!', 'success');
                        }
                    } catch(err) {
                        showToast('Gagal menyimpan ke server', 'error');
                    }
                    hideLoading();
                }
            );
        }

        function generateKopSuratHTML(judul) {
            let logoSrc = printSettings.logoBase64 || APP_ASSETS.logoMark;
            let alamatHtml = printSettings.alamat.replace(/\n/g, '<br>');
            return `
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 120px; text-align: left; vertical-align: middle;">
                            <img src="${logoSrc}" onerror="this.onerror=null; this.src='${APP_ASSETS.logoMarkFallback}';" style="width: 75px; object-fit: contain;">
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <div style="font-family: Arial, sans-serif; line-height: 1.15;">
                                <div style="font-size: 14pt; font-weight: normal; text-transform: uppercase; margin: 0;">${printSettings.pemda}</div>
                                <div style="font-size: 18pt; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">${printSettings.instansi}</div>
                                <div style="font-size: 10pt; margin-top: 4px;">${alamatHtml}</div>
                            </div>
                        </td>
                        <td style="width: 120px;"></td> <!-- Penyeimbang agar teks rata tengah sempurna -->
                    </tr>
                </table>
                <div style="border-top: 3px solid black; margin-top: 15px; margin-bottom: 20px;"></div>
                <div style="text-align: center; font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; font-family: Arial, sans-serif; text-decoration: underline;">${judul}</div>
            `;
        }

        function generateTandaTanganHTML() {
            let dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            return `
                <div class="print-ttd" style="width: 100%; margin-top: 40px; font-family: Arial, sans-serif;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 60%;"></td>
                            <td style="width: 40%; text-align: left; line-height: 1.15;">
                                <div style="margin: 0;">Batang, ${dateStr}</div>
                                <div style="margin: 0;">${printSettings.jabatan}</div>
                                <div style="margin: 0; margin-bottom: 70px;">${printSettings.daerah}</div>
                                
                                <div style="margin: 0; font-weight: bold; text-decoration: underline;">${printSettings.nama}</div>
                                <div style="margin: 0;">${printSettings.pangkat}</div>
                                <div style="margin: 0;">NIP. ${printSettings.nip}</div>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }

        // --- EXPORT POKTAN ---
        function generatePoktanTableHTML(forExcel = false) {
            const cari = document.getElementById('search-admin-poktan')?.value.toLowerCase() || '';
            let filteredData = dummyPoktan.filter(p => {
                return `${p.nama} ${p.ketua} ${p.desa} ${p.kec}`.toLowerCase().includes(cari);
            });

            let html = `<table ${forExcel ? 'border="1"' : 'class="print-table"'}>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kode Poktan</th>
                        <th>Nama Kelompok Tani</th>
                        <th>Nama Ketua</th>
                        <th>Desa / Kelurahan</th>
                        <th>Kecamatan</th>
                    </tr>
                </thead>
                <tbody>`;
            
            if(filteredData.length === 0) {
                html += `<tr><td colspan="6" style="text-align:center;">Tidak ada data</td></tr>`;
            } else {
                filteredData.forEach((p, index) => {
                    html += `<tr>
                        <td style="text-align:center;">${index + 1}</td>
                        <td>${p.kode_poktan || '-'}</td>
                        <td>${p.nama}</td>
                        <td>${p.ketua}</td>
                        <td>${p.desa}</td>
                        <td>${p.kec}</td>
                    </tr>`;
                });
            }
            html += `</tbody></table>`;
            return html;
        }

        function cetakPDFPoktan() {
            toggleDropdown('dropdown-poktan'); // Tutup dropdown
            showLoading("Menyiapkan dokumen cetak PDF...");
            setTimeout(() => {
                const printArea = document.getElementById('print-area');
                let content = generateKopSuratHTML("Data Master Kelompok Tani");
                content += generatePoktanTableHTML(false);
                content += generateTandaTanganHTML();
                
                printArea.innerHTML = content;
                hideLoading();
                setTimeout(() => { window.print(); }, 100);
            }, 800);
        }

        function eksporExcelPoktan() {
            toggleDropdown('dropdown-poktan'); // Tutup dropdown
            showLoading("Menyiapkan dokumen Excel...");
            setTimeout(() => {
                const judul = "DATA MASTER KELOMPOK TANI";
                const tableHTML = generatePoktanTableHTML(true);
                const excelString = createExcelTemplate(judul, tableHTML, 6); 
                downloadHTMLAsExcel(excelString, `Laporan_Poktan_${new Date().getTime()}.xls`);
                hideLoading();
            }, 1000);
        }

        // --- EXPORT BANTUAN ---
        function generateBantuanTableHTML(forExcel = false) {
            const poktanMap = getPoktanMap();
            const cari = document.getElementById('search-admin-bantuan')?.value.toLowerCase() || '';
            
            let filteredData = dummyBantuan.filter(b => {
                if(b.tahun !== ADMIN_GLOBAL_YEAR) return false;
                let p = poktanMap[b.id_poktan] || {nama: '', desa: '', kec: ''};
                return `${p.nama} ${p.desa} ${p.kec} ${b.nama_program} ${b.bidang} ${b.jenis}`.toLowerCase().includes(cari);
            }).reverse();

            let html = `<table ${forExcel ? 'border="1"' : 'class="print-table"'}>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kode Poktan</th>
                        <th>Penerima & Lokasi</th>
                        <th>Program Bantuan</th>
                        <th>Bidang</th>
                        <th>Rincian Spesifikasi</th>
                        <th>Vol</th>
                        <th>Satuan</th>
                        <th>Harga (Rp)</th>
                        <th>Total (Rp)</th>
                        <th>Sumber Dana</th>
                    </tr>
                </thead>
                <tbody>`;
            
            if(filteredData.length === 0) {
                html += `<tr><td colspan="11" style="text-align:center;">Tidak ada data</td></tr>`;
            } else {
                let no = 1;
                filteredData.forEach(b => {
                    let p = poktanMap[b.id_poktan] || {nama: '-', desa: '-', kec: '-', kode_poktan: '-'};
                    let rowspan = b.rincian && b.rincian.length > 0 ? b.rincian.length : 1;
                    
                    if(!b.rincian || b.rincian.length === 0) {
                        html += `<tr>
                            <td style="text-align:center;">${no++}</td>
                            <td>${p.kode_poktan || '-'}</td>
                            <td><b>${p.nama}</b><br>Ds. ${p.desa}, Kec. ${p.kec}</td>
                            <td>${b.nama_program}</td>
                            <td>${b.bidang}</td>
                            <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
                            <td>${b.sumber}</td>
                        </tr>`;
                    } else {
                        // Baris pertama dari rincian
                        let r1 = b.rincian[0];
                        html += `<tr>
                            <td rowspan="${rowspan}" style="text-align:center; vertical-align:top;">${no++}</td>
                            <td rowspan="${rowspan}" style="vertical-align:top;">${p.kode_poktan || '-'}</td>
                            <td rowspan="${rowspan}" style="vertical-align:top;"><b>${p.nama}</b><br>Ds. ${p.desa}, Kec. ${p.kec}</td>
                            <td rowspan="${rowspan}" style="vertical-align:top;">${b.nama_program}</td>
                            <td rowspan="${rowspan}" style="vertical-align:top;">${b.bidang}</td>
                            <td>${r1.spesifikasi}</td>
                            <td style="text-align:center;">${r1.volume}</td>
                            <td style="text-align:center;">${r1.satuan}</td>
                            <td style="text-align:right;">${r1.harga}</td>
                            <td style="text-align:right;">${r1.total}</td>
                            <td rowspan="${rowspan}" style="vertical-align:top;">${b.sumber}</td>
                        </tr>`;
                        // Baris sisanya jika ada
                        for(let i=1; i<b.rincian.length; i++) {
                            let r = b.rincian[i];
                            html += `<tr>
                                <td>${r.spesifikasi}</td>
                                <td style="text-align:center;">${r.volume}</td>
                                <td style="text-align:center;">${r.satuan}</td>
                                <td style="text-align:right;">${r.harga}</td>
                                <td style="text-align:right;">${r.total}</td>
                            </tr>`;
                        }
                    }
                });
            }
            html += `</tbody></table>`;
            return html;
        }

        function cetakPDFBantuan() {
            toggleDropdown('dropdown-bantuan'); // Tutup dropdown
            showLoading("Menyiapkan dokumen cetak PDF...");
            setTimeout(() => {
                const printArea = document.getElementById('print-area');
                let content = generateKopSuratHTML("Laporan Penyaluran Bantuan Tahun " + ADMIN_GLOBAL_YEAR);
                content += generateBantuanTableHTML(false);
                content += generateTandaTanganHTML();
                
                printArea.innerHTML = content;
                hideLoading();
                setTimeout(() => { window.print(); }, 100);
            }, 800);
        }

        function eksporExcelBantuan() {
            toggleDropdown('dropdown-bantuan'); // Tutup dropdown
            showLoading("Menyiapkan dokumen Excel...");
            setTimeout(() => {
                const judul = "LAPORAN PENYALURAN BANTUAN TAHUN " + ADMIN_GLOBAL_YEAR;
                const tableHTML = generateBantuanTableHTML(true);
                const excelString = createExcelTemplate(judul, tableHTML, 11); 
                downloadHTMLAsExcel(excelString, `Laporan_Bantuan_${ADMIN_GLOBAL_YEAR}_${new Date().getTime()}.xls`);
                hideLoading();
            }, 1000);
        }

        // Engine HTML-to-Excel pembuat Kop & TTD
        function createExcelTemplate(judulLaporan, tableHTML, colCount) {
            let dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            let alamatExcel = printSettings.alamat.replace(/\n/g, '<br style="mso-data-placement:same-cell;"/>');
            
            // Menggabungkan Kop Surat dalam 1 sel agar spasi atas-bawah rapat di Excel
            let kopText = `<span style="font-size:14pt;">${printSettings.pemda}</span><br style="mso-data-placement:same-cell;"/><span style="font-weight:bold; font-size:18pt;">${printSettings.instansi}</span>`;
            
            // Menggabungkan Tanda Tangan dalam 1 sel agar spasi atas-bawah rapat di Excel
            let ttdText = `Batang, ${dateStr}<br style="mso-data-placement:same-cell;"/>${printSettings.jabatan}<br style="mso-data-placement:same-cell;"/>${printSettings.daerah}<br style="mso-data-placement:same-cell;"/><br style="mso-data-placement:same-cell;"/><br style="mso-data-placement:same-cell;"/><br style="mso-data-placement:same-cell;"/><span style="font-weight:bold; text-decoration:underline;">${printSettings.nama}</span><br style="mso-data-placement:same-cell;"/>${printSettings.pangkat}<br style="mso-data-placement:same-cell;"/>NIP. ${printSettings.nip}`;
            
            return `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head><meta charset="utf-8"></head>
                <body>
                    <table>
                        <tr><td colspan="${colCount}" style="text-align:center; font-family: Arial, sans-serif;">${kopText}</td></tr>
                        <tr><td colspan="${colCount}" style="text-align:center; font-family: Arial, sans-serif;">${alamatExcel}</td></tr>
                        <tr><td colspan="${colCount}" style="border-bottom: 3px solid black; height: 15px;"></td></tr>
                        <tr><td colspan="${colCount}" style="height: 15px;"></td></tr>
                        <tr><td colspan="${colCount}" style="text-align:center; font-weight:bold; font-size:12pt; text-decoration: underline;">${judulLaporan}</td></tr>
                        <tr><td colspan="${colCount}"></td></tr>
                    </table>
                    ${tableHTML}
                    <table>
                        <tr><td colspan="${colCount}"></td></tr>
                        <tr>
                            <td colspan="${colCount - 3}"></td>
                            <td colspan="3" style="text-align:left; vertical-align:top; font-family: Arial, sans-serif;">${ttdText}</td>
                        </tr>
                    </table>
                </body>
                </html>
            `;
        }

        function downloadHTMLAsExcel(htmlString, filename) {
            const blob = new Blob(["\uFEFF" + htmlString], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`Laporan Excel berhasil diunduh.`, 'success');
        }
