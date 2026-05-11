        // ==========================================
        // OTHER LOGIC (POKTAN DROPDOWN, DLL)
        // ==========================================
        function populatePoktanSelect() {
            const dropdown = document.getElementById('bantuan-poktan-dropdown');
            let html = '';
            let sortedPoktan = dummyPoktan.slice().sort((a,b) => a.nama.localeCompare(b.nama));
            sortedPoktan.forEach(p => {
                html += `<div class="poktan-option px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors" data-id="${p.id}" data-name="${p.nama}" data-desa="${p.desa}" onclick="selectPoktan(${p.id}, '${p.kode_poktan} - ${p.nama} (Desa ${p.desa})')">
                            <p class="text-sm font-bold text-slate-800">${p.nama} <span class="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 border rounded">${p.kode_poktan || '-'}</span></p>
                            <p class="text-[10px] text-slate-500">Desa ${p.desa}</p>
                         </div>`;
            });
            if(html === '') html = '<div class="px-4 py-3 text-sm text-slate-500 text-center">Data tidak ditemukan</div>';
            if(dropdown) dropdown.innerHTML = html;
        }

        function togglePoktanDropdown(show) {
            const dropdown = document.getElementById('bantuan-poktan-dropdown');
            if(show) {
                dropdown.classList.remove('hidden');
                filterPoktanSelect();
            } else {
                dropdown.classList.add('hidden');
            }
        }

        function filterPoktanSelect() {
            const input = document.getElementById('bantuan-poktan-search').value.toLowerCase();
            const options = document.querySelectorAll('.poktan-option');
            options.forEach(opt => {
                const name = opt.getAttribute('data-name').toLowerCase();
                const desa = opt.getAttribute('data-desa').toLowerCase();
                const kode = opt.innerText.toLowerCase(); // termaksu pencarian kode
                if(name.includes(input) || desa.includes(input) || kode.includes(input)) {
                    opt.style.display = 'block';
                } else {
                    opt.style.display = 'none';
                }
            });
        }

        function selectPoktan(id, label) {
            document.getElementById('bantuan-poktan-id').value = id;
            document.getElementById('bantuan-poktan-search').value = label;
            togglePoktanDropdown(false);
        }

        // ==========================================
        // MODAL LOGIC & CRUD POKTAN DAN BANTUAN
        // ==========================================
        function openModal(id) {
            const modalEl = document.getElementById(id);
            if (!modalEl) return;
            
            modalEl.classList.remove('hidden');
            
            if(id === 'modal-poktan' && !document.getElementById('poktan-id').value) {
                document.getElementById('form-poktan').reset();
                document.getElementById('poktan-kode').value = '';
                document.getElementById('poktan-desa').innerHTML = '<option value="" disabled selected>-- Pilih Desa / Kel. --</option>';
                document.getElementById('poktan-desa').disabled = true;
                document.getElementById('modal-poktan-title').innerHTML = '<span class="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center text-sm border border-blue-100"><i class="fa-solid fa-users"></i></span> Form Kelompok Tani';
            }
            if(id === 'modal-bantuan' && !document.getElementById('bantuan-id').value) {
                document.getElementById('form-bantuan').reset();
                document.getElementById('bantuan-tahun').value = ADMIN_GLOBAL_YEAR;
                document.getElementById('bantuan-poktan-id').value = ''; 
                document.getElementById('tbody-rincian-dinamis').innerHTML = ''; 
                toggleSumberLainnya(''); 
                addRincianRow(); 
                document.getElementById('modal-bantuan-title').innerHTML = '<span class="w-10 h-10 rounded-xl bg-green-50 text-[#16a34a] flex items-center justify-center text-sm border border-green-100"><i class="fa-solid fa-box-open"></i></span> Pencatatan Penyaluran';
            }
        }

        function closeModal(id) {
            const modalEl = document.getElementById(id);
            if (!modalEl) return;
            
            modalEl.classList.add('hidden');
            if(id === 'modal-poktan') document.getElementById('poktan-id').value = '';
            if(id === 'modal-bantuan') document.getElementById('bantuan-id').value = '';
            if(id === 'modal-profil') {
                document.getElementById('profil-nama').value = '';
                document.getElementById('profil-password').value = '';
            }
        }

        async function savePoktan(e) {
            e.preventDefault();
            showConfirm(
                "Simpan Data Poktan?", 
                "Apakah Anda yakin data kelompok tani yang diisi sudah benar?",
                async () => {
                    showLoading("Menyimpan data kelompok tani...");
                    
                    const id = document.getElementById('poktan-id').value;
                    let existingKode = document.getElementById('poktan-kode').value;
                    
                    // Backend logic akan men-generate kode, kita simulasikan pembuatan kode di frontend sementara jika belum ada
                    if(!existingKode) {
                        existingKode = 'KT-' + Math.floor(1000 + Math.random() * 9000);
                    }

                    const payload = {
                        id: id ? parseInt(id) : Date.now(),
                        kode_poktan: existingKode,
                        nama: document.getElementById('poktan-nama').value,
                        ketua: document.getElementById('poktan-ketua').value,
                        kec: document.getElementById('poktan-kec').value,
                        desa: document.getElementById('poktan-desa').value
                    };

                    try {
                        let res = await gasAPI('savePoktan', payload);
                        if(res.status === 'success' || IS_PREVIEW) {
                            let savedObj = IS_PREVIEW ? payload : res.data;
                            if(id) {
                                const idx = dummyPoktan.findIndex(x => x.id == id);
                                if(idx > -1) dummyPoktan[idx] = savedObj;
                            } else {
                                dummyPoktan.push(savedObj);
                            }
                            
                            showToast('Data Kelompok Tani berhasil disimpan!', 'success');
                            closeModal('modal-poktan');
                            triggerAdminPoktanFilter(); 
                            updateDashboardStats();
                            updateChartData();
                            renderPublicTable();
                        }
                    } catch(err) {
                        showToast('Gagal menyimpan ke server', 'error');
                    }
                    hideLoading();
                }
            );
        }

        function editPoktan(id) {
            const p = dummyPoktan.find(x => x.id == id);
            if(p) {
                document.getElementById('poktan-id').value = p.id;
                document.getElementById('poktan-kode').value = p.kode_poktan || '';
                document.getElementById('poktan-nama').value = p.nama;
                document.getElementById('poktan-ketua').value = p.ketua;
                document.getElementById('poktan-kec').value = p.kec;
                updateDesaDropdown(p.desa);
                document.getElementById('modal-poktan-title').innerHTML = '<span class="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center text-sm border border-blue-100"><i class="fa-solid fa-pen"></i></span> Edit Kelompok Tani';
                openModal('modal-poktan');
            }
        }

        async function deletePoktan(id) {
            showConfirm(
                "Hapus Data Poktan?", 
                "Yakin ingin menghapus data Kelompok Tani ini? Jika sudah ada riwayat bantuan, menghapus data ini dapat merusak referensi.",
                async () => {
                    showLoading("Menghapus data kelompok tani...");
                    try {
                        let res = await gasAPI('deletePoktan', {id: id});
                        if(res.status === 'success' || IS_PREVIEW) {
                            dummyPoktan = dummyPoktan.filter(x => x.id != id);
                            showToast('Data berhasil dihapus', 'success');
                            triggerAdminPoktanFilter(); triggerAdminBantuanFilter(); updateDashboardStats(); updateChartData(); renderPublicTable();
                        }
                    } catch(err) {
                        showToast('Gagal menghapus di server', 'error');
                    }
                    hideLoading();
                }
            );
        }

        async function saveBantuan(e) {
            e.preventDefault();
            
            const id_poktan = parseInt(document.getElementById('bantuan-poktan-id').value);
            if(isNaN(id_poktan)) {
                showToast("Harap pilih Kelompok Tani Penerima dari daftar pencarian!", "error");
                return;
            }

            let sDana = document.getElementById('bantuan-sumber').value;
            if(sDana === 'Lainnya...') sDana = document.getElementById('bantuan-sumber-lainnya').value;
            
            let arrayRincian = [];
            const rows = document.querySelectorAll('#tbody-rincian-dinamis tr');
            rows.forEach(tr => {
                const s = tr.querySelector('.inp-spesifikasi').value;
                const v = parseFloat(tr.querySelector('.inp-volume').value) || 0;
                const u = tr.querySelector('.inp-satuan').value;
                const h = parseFloat(tr.querySelector('.inp-harga').value) || 0;
                const t = v * h;
                if(s && v > 0) arrayRincian.push({spesifikasi: s, volume: v, satuan: u, harga: h, total: t});
            });

            if(arrayRincian.length === 0) {
                showToast("Harap masukkan minimal 1 rincian spesifikasi barang/bantuan!", "error");
                return;
            }

            showConfirm(
                "Simpan Data Penyaluran?", 
                "Apakah Anda yakin rincian barang dan penerima bantuan sudah sesuai?",
                async () => {
                    showLoading("Menyimpan data penyaluran...");
                    
                    const id = document.getElementById('bantuan-id').value;
                    const payload = {
                        id: id ? parseInt(id) : Date.now(),
                        jenis: document.getElementById('bantuan-jenis').value,
                        sumber: sDana,
                        bidang: document.getElementById('bantuan-bidang').value,
                        id_poktan: id_poktan,
                        nama_program: document.getElementById('bantuan-nama-program').value,
                        tahun: parseInt(document.getElementById('bantuan-tahun').value),
                        rincian: arrayRincian
                    };

                    try {
                        let res = await gasAPI('saveBantuan', payload);
                        if(res.status === 'success' || IS_PREVIEW) {
                            let savedObj = IS_PREVIEW ? payload : res.data;
                            if(id) {
                                const idx = dummyBantuan.findIndex(x => x.id == id);
                                if(idx > -1) dummyBantuan[idx] = savedObj;
                            } else {
                                dummyBantuan.push(savedObj);
                            }

                            showToast("Riwayat Penyaluran Bantuan berhasil disimpan!", "success");
                            closeModal('modal-bantuan');
                            triggerAdminBantuanFilter(); 
                            updateDashboardStats();
                            updateChartData();
                            renderPublicTable();
                        }
                    } catch(err) {
                        showToast('Gagal menyimpan ke server', 'error');
                    }
                    hideLoading();
                }
            );
        }

        function editBantuan(id) {
            const b = dummyBantuan.find(x => x.id == id);
            if(b) {
                document.getElementById('bantuan-id').value = b.id;
                document.getElementById('bantuan-jenis').value = b.jenis;
                document.getElementById('bantuan-bidang').value = b.bidang;
                
                document.getElementById('bantuan-poktan-id').value = b.id_poktan;
                const p = dummyPoktan.find(x => x.id == b.id_poktan);
                document.getElementById('bantuan-poktan-search').value = p ? `${p.kode_poktan} - ${p.nama} (Desa ${p.desa})` : '';

                document.getElementById('bantuan-nama-program').value = b.nama_program;
                document.getElementById('bantuan-tahun').value = b.tahun; 
                
                const sumberSelect = document.getElementById('bantuan-sumber');
                let isStandard = false;
                for(let i=0; i<sumberSelect.options.length; i++) {
                    if(sumberSelect.options[i].value === b.sumber) isStandard = true;
                }
                
                if(isStandard) {
                    sumberSelect.value = b.sumber;
                    toggleSumberLainnya(b.sumber);
                } else {
                    sumberSelect.value = 'Lainnya...';
                    toggleSumberLainnya('Lainnya...');
                    document.getElementById('bantuan-sumber-lainnya').value = b.sumber;
                }
                
                document.getElementById('tbody-rincian-dinamis').innerHTML = ''; 
                if(b.rincian && b.rincian.length > 0) {
                    b.rincian.forEach(item => addRincianRow(item.spesifikasi, item.volume, item.satuan, item.harga, item.total));
                } else {
                    addRincianRow(); 
                }

                document.getElementById('modal-bantuan-title').innerHTML = '<span class="w-10 h-10 rounded-xl bg-green-50 text-[#16a34a] flex items-center justify-center text-sm border border-green-100"><i class="fa-solid fa-pen"></i></span> Edit Penyaluran';
                openModal('modal-bantuan');
            }
        }

        async function deleteBantuan(id) {
            showConfirm(
                "Hapus Riwayat Penyaluran?", 
                "Apakah Anda yakin ingin membatalkan/menghapus riwayat penyaluran ini dari sistem?",
                async () => {
                    showLoading("Menghapus data penyaluran...");
                    try {
                        let res = await gasAPI('deleteBantuan', {id: id});
                        if(res.status === 'success' || IS_PREVIEW) {
                            dummyBantuan = dummyBantuan.filter(x => x.id != id);
                            showToast('Riwayat berhasil dihapus', 'success');
                            triggerAdminBantuanFilter();
                            updateDashboardStats();
                            updateChartData();
                            renderPublicTable();
                        }
                    } catch(err) {
                        showToast("Gagal menghapus di server", "error");
                    }
                    hideLoading();
                }
            );
        }
