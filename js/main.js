        window.onload = async () => {
            document.getElementById('current-year').innerText = new Date().getFullYear();
            initChart(); // Buat canvas dasar

            if(!IS_PREVIEW && GAS_URL !== "URL_DEPLOY_GAS_ANDA_DISINI") {
                showLoading("Menghubungkan ke Server Database...");
                try {
                    const res = await gasAPI('init');
                    if(res.status === 'success') {
                        dummyUsers = res.data.users || [];
                        dummyPoktan = res.data.poktan || [];
                        dummyBantuan = res.data.bantuan || [];
                        if(res.data.settings) printSettings = res.data.settings;
                        if(res.data.tahun && res.data.tahun.length > 0) daftarTahun = res.data.tahun;
                        showToast("Terhubung dengan server", "success");
                    }
                } catch(e) {
                    showToast("Gagal memuat data dari server. Mode offline darurat aktif.", "error");
                }
                hideLoading();
            }

            ADMIN_GLOBAL_YEAR = new Date().getFullYear();
            if(!daftarTahun.includes(ADMIN_GLOBAL_YEAR)) {
                ADMIN_GLOBAL_YEAR = daftarTahun.length > 0 ? Math.max(...daftarTahun) : new Date().getFullYear();
            }
            
            // Param 'true' untuk memaksa nilai awal dropdown Publik ke 'Semua Tahun'
            populateYearDropdowns(true);
            renderTabelTahun();
            updateGlobalYearLabels();
            initPrintSettingsForm(); // Memuat default form print

            initWilayahDropdown();
            renderPublicTable();
            renderPoktanTable();
            renderBantuanTable(); 
            updateDashboardStats();
            updateChartData();
            generateCaptcha(); 
        };
