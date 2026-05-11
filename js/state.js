        // DATA MULTI-ROLE & PENGGUNA (BARU)
        let dummyUsers = [
            { id: 1, username: 'admin', password: 'edudigital', name: 'Super Administrator', role: 'super_admin' },
            { id: 2, username: 'operator', password: '12345', name: 'Operator Data', role: 'operator' }
        ];
        let currentUser = null;

        // DATA WILAYAH KAB. BATANG
        const dataWilayah = {
            "Batang": ["Kauman", "Karangasem Utara", "Karangasem Selatan", "Proyonanggan Utara", "Proyonanggan Tengah", "Proyonanggan Selatan", "Kasepuhan", "Sambong", "Watesalit", "Kalipucang Kulon", "Kalipucang Wetan", "Karanganyar", "Kecepak", "Klidang Lor", "Klidang Wetan", "Pasekaran", "Denasri Kulon", "Denasri Wetan", "Kalisalak", "Cepokokuning", "Rowobelid"],
            "Bandar": ["Bandar", "Batiombo", "Binangun", "Candi", "Kluwih", "Pesalakan", "Pucanggading", "Sidayu", "Simpar", "Tambahrejo", "Tombo", "Toso", "Tumbrep", "Wonodadi", "Wonokerto", "Wonomerto", "Wonosegoro"],
            "Bawang": ["Bawang", "Candigugur", "Candirejo", "Deles", "Getas", "Gunungsari", "Jambangan", "Jlamprang", "Kalirejo", "Kebaturan", "Pangempon", "Pasusukan", "Pranten", "Purbo", "Sangubanyu", "Sibebek", "Sidoharjo", "Soka", "Surjo", "Wonosari"],
            "Blado": ["Bawang", "Besani", "Bismo", "Blado", "Cokro", "Gerlang", "Gondang", "Kalipancur", "Kalisari", "Kalitengah", "Kambangan", "Kembanglangit", "Keputon", "Keteleng", "Pagilaran", "Pesantren", "Selopajang Barat", "Selopajang Timur"],
            "Subah": ["Adinuso", "Clapar", "Durenombo", "Gondang", "Jatisari", "Kalimanggis", "Karangtengah", "Keborangan", "Kemiri Barat", "Kemiri Timur", "Kuripan", "Mangunharjo", "Menjangan", "Musuk", "Pecalungan", "Subah", "Tenggulangharjo"],
            "Limpung": ["Amongrogo", "Babadan", "Dlisen", "Donorejo", "Kalisalak", "Kepuh", "Limpung", "Lobang", "Ngaliyan", "Plumbon", "Pungangan", "Rowosari", "Sidomulyo", "Sempu", "Sukorejo", "Tembok", "Wonokerso"],
            "Gringsing": ["Gringsing", "Kebondalem", "Ketanggan", "Krengseng", "Kutosari", "Lebo", "Madugowongjati", "Mentosari", "Plelen", "Sawangan", "Sentul", "Sidorejo", "Surodadi", "Tedunan", "Yosorejo"],
            "Tersono": ["Banteng", "Boja", "Gondo", "Harjowinangun Barat", "Harjowinangun Timur", "Kebumen", "Kranggan", "Margosono", "Plosowangi", "Pujut", "Rejosari Barat", "Rejosari Timur", "Satriyan", "Sendang", "Sijono", "Sukomangli", "Sumurbanger", "Tanjungsari", "Tersono", "Wanar"],
            "Reban": ["Adinuso", "Cablikan", "Kalisari", "Karanganyar", "Kepundung", "Kumesu", "Mojotengah", "Ngadirejo", "Ngroto", "Pacet", "Padomasan", "Polodoro", "Reban", "Semampir", "Sojomerto", "Sukomulyo", "Tambakboyo", "Wonorejo", "Wonosobo"],
            "Tulis": ["Beji", "Cluwuk", "Jolosekti", "Jrakahpayung", "Kaliboyo", "Kebumen", "Kedungsegog", "Kenconorejo", "Manggis", "Ponowareng", "Posong", "Sembojo", "Siberuk", "Simbangdesa", "Simbangjati", "Tulis", "Wringingintung"],
            "Warungasem": ["Banjiran", "Candiareng", "Cepagan", "Kalibeluk", "Kaliwareng", "Lebo", "Masin", "Menguneng", "Pandansari", "Pejambon", "Pesaren", "Sariglagah", "Sidorejo", "Sijambe", "Terban", "Warungasem", "Gapuro"],
            "Wonotunggal": ["Brayo", "Brokoh", "Dringo", "Gringgingsari", "Kedungmalang", "Kemiri Barat", "Kemplong", "Penundan", "Polodoro", "Sendang", "Sigayam", "Silurah", "Sodong", "Wates", "Wonotunggal"],
            "Kandeman": ["Bakalan", "Botolambat", "Cempereng", "Depok", "Juragan", "Kandeman", "Karanganom", "Karanggeneng", "Lawangaji", "Tegalsari", "Tragung", "Ujungnegoro", "Wonokerso"],
            "Banyuputih": ["Banaran", "Banyuputih", "Bulu", "Durenombo", "Kedawung", "Luwung", "Penundan", "Sembung", "Timbang", "Kalibalik", "Manyarejo"],
            "Pecalungan": ["Bandung", "Gemuh", "Gombong", "Gumawang", "Keniten", "Pecalungan", "Pretek", "Randu", "Selokarto", "Siguci"]
        };

        // EXTENDED DUMMY DATA FOR POKTAN (Ditambahkan kode_poktan)
        let dummyPoktan = [
            { id: 1, kode_poktan: 'KT-0001', nama: 'Poktan Hasil Lumintu', ketua: 'Sutiono', desa: 'Gunungsari', kec: 'Bawang' },
            { id: 2, kode_poktan: 'KT-0002', nama: 'Gapoktan Sumber Rejo', ketua: 'Mistur', desa: 'Kalirejo', kec: 'Bawang' },
            { id: 3, kode_poktan: 'KT-0003', nama: 'Poktan Tani Maju', ketua: 'Hasan', desa: 'Sempu', kec: 'Limpung' },
            { id: 4, kode_poktan: 'KT-0004', nama: 'Poktan Sri Rejeki', ketua: 'Ahmad', desa: 'Subah', kec: 'Subah' },
            { id: 5, kode_poktan: 'KT-0005', nama: 'Gapoktan Karya Mandiri', ketua: 'Budi', desa: 'Tersono', kec: 'Tersono' },
            { id: 6, kode_poktan: 'KT-0006', nama: 'Poktan Makmur Jaya', ketua: 'Cipto', desa: 'Gringsing', kec: 'Gringsing' },
            { id: 7, kode_poktan: 'KT-0007', nama: 'Poktan Sido Makmur', ketua: 'Daryono', desa: 'Warungasem', kec: 'Warungasem' },
            { id: 8, kode_poktan: 'KT-0008', nama: 'Gapoktan Harapan Tani', ketua: 'Eko', desa: 'Kandeman', kec: 'Kandeman' },
            { id: 9, kode_poktan: 'KT-0009', nama: 'Poktan Tani Mulyo', ketua: 'Fajar', desa: 'Batang', kec: 'Batang' },
            { id: 10, kode_poktan: 'KT-0010', nama: 'Poktan Sumber Urip', ketua: 'Gatot', desa: 'Blado', kec: 'Blado' }
        ];

        // EXTENDED DUMMY DATA FOR BANTUAN
        let dummyBantuan = [
            { id: 1, bidang: 'Hortikultura', jenis: 'Hibah Barang', id_poktan: 1, nama_program: 'Pengadaan Sarana Produksi Tembakau', tahun: 2024, sumber: 'APBD DBHCT', rincian: [{ spesifikasi: 'Pupuk Organik Padat', volume: 6000, satuan: 'Kg', harga: 5000, total: 30000000 }, { spesifikasi: 'Pupuk NPK', volume: 1200, satuan: 'Kg', harga: 15000, total: 18000000 }] },
            { id: 2, bidang: 'Tanaman Pangan', jenis: 'Hibah Barang', id_poktan: 3, nama_program: 'Pengadaan Traktor Roda 2', tahun: 2024, sumber: 'APBN', rincian: [{ spesifikasi: 'Traktor Roda 2 Mesin Diesel 8.5 HP', volume: 2, satuan: 'Unit', harga: 25000000, total: 50000000 }] },
            { id: 3, bidang: 'Ketahanan Pangan', jenis: 'Hibah Uang', id_poktan: 1, nama_program: 'Bantuan Modal Lumbung Pangan', tahun: 2024, sumber: 'APBD', rincian: [{ spesifikasi: 'Modal Kerja Operasional Kelompok', volume: 1, satuan: 'Paket', harga: 25000000, total: 25000000 }] },
            { id: 4, bidang: 'Peternakan', jenis: 'Hibah Barang', id_poktan: 4, nama_program: 'Pengadaan Sapi Potong', tahun: 2024, sumber: 'APBD', rincian: [{ spesifikasi: 'Sapi Jantan', volume: 5, satuan: 'Ekor', harga: 15000000, total: 75000000 }] },
            { id: 5, bidang: 'Perkebunan', jenis: 'Hibah Barang', id_poktan: 5, nama_program: 'Bantuan Bibit Kopi', tahun: 2024, sumber: 'APBD Provinsi', rincian: [{ spesifikasi: 'Bibit Kopi Arabika Bersertifikat', volume: 5000, satuan: 'Batang', harga: 10000, total: 50000000 }] },
            { id: 6, bidang: 'Hortikultura', jenis: 'Hibah Barang', id_poktan: 7, nama_program: 'Bantuan Benih Bawang Merah', tahun: 2024, sumber: 'APBN', rincian: [{ spesifikasi: 'Benih Bawang Merah', volume: 500, satuan: 'Kg', harga: 40000, total: 20000000 }] },
            { id: 7, bidang: 'Peternakan', jenis: 'Hibah Uang', id_poktan: 10, nama_program: 'Bantuan Biaya Pakan Ternak', tahun: 2024, sumber: 'APBD', rincian: [{ spesifikasi: 'Pembelian Pakan Konsentrat', volume: 1, satuan: 'Paket', harga: 10000000, total: 10000000 }] },
            { id: 8, bidang: 'Peternakan', jenis: 'Hibah Barang', id_poktan: 2, nama_program: 'Pengadaan Kambing PE Betina', tahun: 2023, sumber: 'APBD', rincian: [{ spesifikasi: 'Kambing PE Betina', volume: 15, satuan: 'Ekor', harga: 2000000, total: 30000000 }] },
            { id: 9, bidang: 'Tanaman Pangan', jenis: 'Hibah Barang', id_poktan: 1, nama_program: 'Bantuan Pompa Air', tahun: 2023, sumber: 'APBN', rincian: [{ spesifikasi: 'Pompa Air 3 Inch', volume: 3, satuan: 'Unit', harga: 5000000, total: 15000000 }] },
            { id: 10, bidang: 'Hortikultura', jenis: 'Hibah Uang', id_poktan: 3, nama_program: 'Bantuan Operasional Petani Cabai', tahun: 2023, sumber: 'APBD PIK', rincian: [{ spesifikasi: 'Operasional Tanam Cabai', volume: 1, satuan: 'Paket', harga: 20000000, total: 20000000 }] },
            { id: 11, bidang: 'Perkebunan', jenis: 'Hibah Barang', id_poktan: 6, nama_program: 'Pengadaan Alat Pasca Panen Kopi', tahun: 2023, sumber: 'APBD', rincian: [{ spesifikasi: 'Mesin Pulper Kopi', volume: 1, satuan: 'Unit', harga: 12000000, total: 12000000 }, { spesifikasi: 'Terpal Jemur', volume: 10, satuan: 'Lembar', harga: 150000, total: 1500000 }] },
            { id: 12, bidang: 'Ketahanan Pangan', jenis: 'Hibah Barang', id_poktan: 8, nama_program: 'Bantuan Beras Cadangan', tahun: 2023, sumber: 'APBD', rincian: [{ spesifikasi: 'Beras Premium', volume: 2000, satuan: 'Kg', harga: 13000, total: 26000000 }] },
            { id: 13, bidang: 'Tanaman Pangan', jenis: 'Hibah Barang', id_poktan: 9, nama_program: 'Pengadaan Benih Padi', tahun: 2023, sumber: 'APBD', rincian: [{ spesifikasi: 'Benih Padi Inpari', volume: 1000, satuan: 'Kg', harga: 12000, total: 12000000 }] },
            { id: 14, bidang: 'Hortikultura', jenis: 'Hibah Barang', id_poktan: 1, nama_program: 'Bantuan Green House', tahun: 2025, sumber: 'APBN', rincian: [{ spesifikasi: 'Rangka Baja Ringan & UV', volume: 1, satuan: 'Unit', harga: 75000000, total: 75000000 }] },
            { id: 15, bidang: 'Tanaman Pangan', jenis: 'Hibah Uang', id_poktan: 3, nama_program: 'Bantuan Asuransi Gagal Panen', tahun: 2025, sumber: 'APBD', rincian: [{ spesifikasi: 'Klaim Asuransi Lahan 2 Ha', volume: 1, satuan: 'Paket', harga: 12000000, total: 12000000 }] },
            { id: 16, bidang: 'Peternakan', jenis: 'Hibah Barang', id_poktan: 2, nama_program: 'Pengadaan Mesin Cacah Rumput', tahun: 2025, sumber: 'APBD', rincian: [{ spesifikasi: 'Mesin Chopper', volume: 2, satuan: 'Unit', harga: 6000000, total: 12000000 }] },
            { id: 17, bidang: 'Perkebunan', jenis: 'Hibah Barang', id_poktan: 5, nama_program: 'Pengadaan Pupuk NPK Kopi', tahun: 2025, sumber: 'APBD', rincian: [{ spesifikasi: 'Pupuk NPK Khusus Kopi', volume: 2000, satuan: 'Kg', harga: 16000, total: 32000000 }] }
        ];

        // STATE STATE PRINT SETTINGS (BARU)
        let printSettings = {
            pemda: "PEMERINTAH KABUPATEN BATANG",
            instansi: "DINAS PANGAN DAN PERTANIAN",
            alamat: "Jalan Ahmad Yani Nomor 943 Batang, kodepos 51215,\nTelepon (0285) 391092 Faksimile (0285) 391092\nLaman dispaperta@batangkab.go.id, https://pertanian.batangkab.go.id/",
            jabatan: "Kepala Dinas Pangan Dan Pertanian",
            daerah: "Kabupaten Batang",
            pangkat: "Pembina / IVa",
            nama: "SUTADI RONODIPURO, SP., MM.",
            nip: "197610262007011010",
            logoBase64: "" // Base64 image
        };

        // VARIABEL CHART GLOBAL
        let windowBidangChart = null;
        let windowKecamatanChart = null;

        let currentCaptcha = ""; 
        
        // VARIABEL STATE PAGINATION & FILTER
        let isVsMode = false;
        let publicPage = 1;
        let publicLimit = 10;
        
        let adminPoktanPage = 1;
        let adminPoktanLimit = 10;

        let adminBantuanPage = 1;
        let adminBantuanLimit = 10;

        // DATA TAHUN DINAMIS (BARU)
        let daftarTahun = [2026, 2025, 2024, 2023];

        document.getElementById('current-year').innerText = new Date().getFullYear();
