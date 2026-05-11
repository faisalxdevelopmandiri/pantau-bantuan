        // ==========================================
        // CHART & DASHBOARD STATS
        // ==========================================
        function updateDashboardStats() {
            const statPoktan = document.getElementById('stat-poktan');
            if (statPoktan) statPoktan.innerText = dummyPoktan.length;
            
            let filteredBantuan = dummyBantuan.filter(b => b.tahun === ADMIN_GLOBAL_YEAR);
            const statBantuan = document.getElementById('stat-bantuan');
            if (statBantuan) statBantuan.innerText = filteredBantuan.length;

            let totalRp = 0;
            filteredBantuan.forEach(b => {
                if(b.rincian) {
                    b.rincian.forEach(r => totalRp += r.total);
                }
            });
            const statTotalRp = document.getElementById('stat-total-rp');
            if (statTotalRp) statTotalRp.innerText = formatRupiah(totalRp);

            renderRecentActivities();
        }

        function renderRecentActivities() {
            const tbody = document.getElementById('tbody-recent-bantuan');
            if(!tbody) return;

            let filteredBantuan = dummyBantuan.filter(b => b.tahun === ADMIN_GLOBAL_YEAR);
            let sortedData = filteredBantuan.slice().sort((a, b) => b.id - a.id).slice(0, 5); 

            const poktanMap = getPoktanMap();
            let html = '';

            if (sortedData.length === 0) {
                html = `<tr><td colspan="3" class="text-center py-8 text-slate-400 font-medium text-xs"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-slate-300"></i>Belum ada penyaluran di tahun ini</td></tr>`;
            } else {
                sortedData.forEach(b => {
                    let p = poktanMap[b.id_poktan] || {nama: 'Terhapus', desa: '-'};
                    let grandTotal = b.rincian ? b.rincian.reduce((sum, item) => sum + item.total, 0) : 0;
                    let badgeType = b.jenis === 'Hibah Uang' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700';

                    html += `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-3">
                            <p class="text-xs font-bold text-slate-900">${p.nama}</p>
                            <p class="text-[10px] text-slate-500">Desa ${p.desa}</p>
                        </td>
                        <td class="px-6 py-3">
                            <p class="text-xs font-bold text-slate-800">${b.nama_program}</p>
                            <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase ${badgeType}">${b.jenis}</span>
                        </td>
                        <td class="px-6 py-3 text-right">
                            <p class="text-xs font-black text-[#16a34a]">${formatRupiah(grandTotal)}</p>
                        </td>
                    </tr>`;
                });
            }
            tbody.innerHTML = html;
        }

        function getBidangChartData() {
            let filteredBantuan = dummyBantuan.filter(b => b.tahun === ADMIN_GLOBAL_YEAR);
            let distMap = {};
            filteredBantuan.forEach(b => {
                let bidang = b.bidang || 'Lainnya';
                distMap[bidang] = (distMap[bidang] || 0) + 1;
            });
            if(Object.keys(distMap).length === 0) return { labels: ['Belum ada data'], data: [0] };
            return { labels: Object.keys(distMap), data: Object.values(distMap) };
        }

        function getKecamatanChartData() {
            let filteredBantuan = dummyBantuan.filter(b => b.tahun === ADMIN_GLOBAL_YEAR);
            const poktanMap = getPoktanMap();
            let distMap = {};
            filteredBantuan.forEach(b => {
                let p = poktanMap[b.id_poktan];
                if(p && p.kec) {
                    distMap[p.kec] = (distMap[p.kec] || 0) + 1;
                }
            });
            if(Object.keys(distMap).length === 0) return { labels: ['Belum ada data'], data: [1] }; 
            return { labels: Object.keys(distMap).map(k => 'Kec. ' + k), data: Object.values(distMap) };
        }

        function initChart() {
            const ctxBidang = document.getElementById('bidangChart').getContext('2d');
            let gradientBidang = ctxBidang.createLinearGradient(0, 0, 0, 400);
            gradientBidang.addColorStop(0, '#1e3a8a'); 
            gradientBidang.addColorStop(1, '#1e40af');

            const dataBidang = getBidangChartData();
            windowBidangChart = new Chart(ctxBidang, {
                type: 'bar',
                data: {
                    labels: dataBidang.labels,
                    datasets: [{
                        label: 'Jumlah Bantuan',
                        data: dataBidang.data,
                        backgroundColor: gradientBidang,
                        borderRadius: 8,
                        barThickness: 30
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
                        x: { grid: { display: false }, ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' }, color: '#64748b' } }
                    }
                }
            });

            const ctxKecamatan = document.getElementById('kecamatanChart').getContext('2d');
            const dataKecamatan = getKecamatanChartData();
            windowKecamatanChart = new Chart(ctxKecamatan, {
                type: 'doughnut',
                data: {
                    labels: dataKecamatan.labels,
                    datasets: [{
                        data: dataKecamatan.data,
                        backgroundColor: ['#1e3a8a', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#64748b'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'right', 
                            labels: { usePointStyle: true, boxWidth: 8, font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 } } 
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        function updateChartData() {
            if(windowBidangChart) {
                const dataBidang = getBidangChartData();
                windowBidangChart.data.labels = dataBidang.labels;
                windowBidangChart.data.datasets[0].data = dataBidang.data;
                windowBidangChart.update();
            }
            if(windowKecamatanChart) {
                const dataKecamatan = getKecamatanChartData();
                windowKecamatanChart.data.labels = dataKecamatan.labels;
                windowKecamatanChart.data.datasets[0].data = dataKecamatan.data;
                
                if(dataKecamatan.labels[0] === 'Belum ada data') {
                    windowKecamatanChart.data.datasets[0].backgroundColor = ['#f1f5f9'];
                } else {
                    windowKecamatanChart.data.datasets[0].backgroundColor = ['#1e3a8a', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#64748b'];
                }
                windowKecamatanChart.update();
            }
        }

        // ==========================================
        // MANAJEMEN TAHUN DINAMIS (TERINTEGRASI API)
        // ==========================================
        function populateYearDropdowns(isInitialLoad = false) {
            const publicSelect1 = document.getElementById('filter-tahun-publik');
            const publicSelect2 = document.getElementById('filter-tahun-publik-vs2');
            const adminSelect = document.getElementById('global-year-admin');

            let htmlPublic1 = '<option value="Semua">Semua Tahun</option>';
            let htmlPublic2 = '<option value="" disabled selected>-- Pilih Tahun --</option>';
            let htmlAdmin = '';

            let sortedYears = [...daftarTahun].sort((a, b) => b - a);

            sortedYears.forEach(y => {
                let isSelectedAdmin = (y === ADMIN_GLOBAL_YEAR) ? 'selected' : '';
                let optAdmin = `<option value="${y}" ${isSelectedAdmin}>Tahun ${y}</option>`;
                let optPub = `<option value="${y}">Tahun ${y}</option>`;
                
                htmlPublic1 += optPub;
                htmlPublic2 += optPub;
                htmlAdmin += optAdmin;
            });

            if (publicSelect1 && publicSelect2 && adminSelect) {
                let oldVal1 = isInitialLoad ? "Semua" : publicSelect1.value;
                let oldVal2 = isInitialLoad ? "" : publicSelect2.value;

                publicSelect1.innerHTML = htmlPublic1;
                publicSelect2.innerHTML = htmlPublic2;
                adminSelect.innerHTML = htmlAdmin;

                if(oldVal1 && (oldVal1 === 'Semua' || daftarTahun.includes(parseInt(oldVal1)))) publicSelect1.value = oldVal1;
                if(oldVal2 === "" || (oldVal2 && daftarTahun.includes(parseInt(oldVal2)))) publicSelect2.value = oldVal2;
            }
        }

        function renderTabelTahun() {
            const tbody = document.getElementById('tbody-pengaturan-tahun');
            if (!tbody) return;
            let html = '';
            let sortedYears = [...daftarTahun].sort((a, b) => b - a);
            
            sortedYears.forEach(y => {
                html += `
                <tr class="group hover:bg-slate-50 transition-colors">
                    <td class="py-2.5 px-2 font-extrabold text-slate-700 w-full flex items-center gap-2">
                        <i class="fa-solid fa-calendar text-slate-400"></i> Tahun ${y}
                    </td>
                    <td class="py-2.5 px-2 text-right">
                        <button type="button" onclick="hapusTahun(${y})" class="text-slate-400 hover:text-red-500 w-8 h-8 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center ml-auto">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            });
            
            if(html === '') html = '<tr><td colspan="2" class="text-center text-slate-400 py-6 text-xs font-medium">Belum ada tahun yang terdaftar.</td></tr>';
            tbody.innerHTML = html;
        }

        async function handleTambahTahun(e) {
            e.preventDefault();
            const input = document.getElementById('input-tambah-tahun');
            const val = parseInt(input.value);
            
            if(isNaN(val)) return;
            if(daftarTahun.includes(val)) {
                showToast("Tahun tersebut sudah terdaftar!", "error");
                return;
            }

            showConfirm(
                "Tambah Tahun Anggaran?", 
                `Apakah Anda yakin ingin menambahkan Tahun ${val} ke dalam sistem?`,
                async () => {
                    showLoading(`Mendaftarkan Tahun ${val}...`);
                    try {
                        let res = await gasAPI('saveTahun', {tahun: val});
                        if(res.status === 'success' || IS_PREVIEW) {
                            daftarTahun.push(val);
                            input.value = '';
                            showToast("Tahun Anggaran berhasil ditambahkan.", "success");
                            
                            populateYearDropdowns();
                            renderTabelTahun();
                        }
                    } catch(err) {
                        showToast("Gagal menyimpan ke server", "error");
                    }
                    hideLoading();
                }
            );
        }

        async function hapusTahun(y) {
            showConfirm(
                "Hapus Tahun Anggaran?", 
                "Yakin ingin menghapus Tahun " + y + "? Riwayat penyaluran di tahun ini tidak akan bisa dipilih pada filter pencarian.",
                async () => {
                    showLoading(`Menghapus Tahun ${y}...`);
                    try {
                        let res = await gasAPI('deleteTahun', {tahun: y});
                        if(res.status === 'success' || IS_PREVIEW) {
                            daftarTahun = daftarTahun.filter(t => t !== y);
                            
                            // Jika yang dihapus kebetulan tahun yang sedang aktif di admin
                            if(ADMIN_GLOBAL_YEAR === y) {
                                ADMIN_GLOBAL_YEAR = daftarTahun.length > 0 ? Math.max(...daftarTahun) : new Date().getFullYear();
                                changeGlobalYear(ADMIN_GLOBAL_YEAR); 
                            }
                            
                            showToast("Tahun " + y + " berhasil dihapus", "success");
                            populateYearDropdowns();
                            renderTabelTahun();
                        }
                    } catch(err) {
                        showToast("Gagal menghapus dari server", "error");
                    }
                    hideLoading();
                }
            );
        }
