        // ==========================================
        // FUNGSI PAGINASI & FILTER ADMIN POKTAN
        // ==========================================
        function triggerAdminPoktanFilter() {
            adminPoktanPage = 1;
            renderPoktanTable();
        }

        function changeAdminPoktanLimit(val) {
            adminPoktanLimit = parseInt(val);
            adminPoktanPage = 1;
            renderPoktanTable();
        }

        function changeAdminPoktanPage(newPage) {
            adminPoktanPage = newPage;
            renderPoktanTable();
        }

        function renderAdminPoktanPagination(totalItems) {
            const container = document.getElementById('admin-poktan-pagination-container');
            const totalPages = Math.max(1, Math.ceil(totalItems / adminPoktanLimit)); 

            let html = `<div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white gap-4 rounded-b-3xl">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-slate-500">Menampilkan ${totalItems === 0 ? 0 : (adminPoktanPage-1)*adminPoktanLimit + 1}-${Math.min(adminPoktanPage*adminPoktanLimit, totalItems)} dari ${totalItems} baris</span>
                    <select onchange="changeAdminPoktanLimit(this.value)" class="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] cursor-pointer shadow-sm">
                        <option value="10" ${adminPoktanLimit===10?'selected':''}>10 Baris</option>
                        <option value="50" ${adminPoktanLimit===50?'selected':''}>50 Baris</option>
                        <option value="100" ${adminPoktanLimit===100?'selected':''}>100 Baris</option>
                        <option value="1000" ${adminPoktanLimit===1000?'selected':''}>Semua</option>
                    </select>
                </div>
                <div class="flex items-center gap-1">`;

            html += `<button onclick="changeAdminPoktanPage(${adminPoktanPage - 1})" ${adminPoktanPage === 1 ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>`;

            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= adminPoktanPage - 1 && i <= adminPoktanPage + 1)) {
                    let active = i === adminPoktanPage ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
                    html += `<button onclick="changeAdminPoktanPage(${i})" class="w-8 h-8 flex items-center justify-center rounded-lg border ${active} text-xs font-bold transition-colors">${i}</button>`;
                } else if (i === adminPoktanPage - 2 || i === adminPoktanPage + 2) {
                    html += `<span class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>`;
                }
            }

            html += `<button onclick="changeAdminPoktanPage(${adminPoktanPage + 1})" ${adminPoktanPage === totalPages ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>`;
            html += `</div></div>`;
            container.innerHTML = html;
        }

        function renderPoktanTable() {
            const tbody = document.getElementById('tbody-poktan');
            const cari = document.getElementById('search-admin-poktan')?.value.toLowerCase() || '';
            let html = '';
            
            // Filter Search
            let filteredData = dummyPoktan.filter(p => {
                let textToSearch = `${p.nama} ${p.ketua} ${p.desa} ${p.kec}`.toLowerCase();
                return textToSearch.includes(cari);
            });

            // Pagination Slice
            const totalItems = filteredData.length;
            const startIndex = (adminPoktanPage - 1) * adminPoktanLimit;
            const paginatedData = filteredData.slice(startIndex, startIndex + adminPoktanLimit);

            paginatedData.forEach((p) => {
                html += `
                <tr class="hover:bg-slate-50/80 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold"><i class="fa-solid fa-users"></i></div>
                            <div>
                                <span class="text-sm font-bold text-slate-900 block">${p.nama}</span>
                                <span class="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">${p.kode_poktan || 'KT-XXX'}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-slate-600">${p.ketua}</td>
                    <td class="px-6 py-4">
                        <span class="text-sm font-medium text-slate-600">${p.desa}</span>
                        <span class="text-[11px] text-slate-400 block">Kec. ${p.kec}</span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                        <button onclick="editPoktan(${p.id})" class="text-slate-400 hover:text-[#1e3a8a] mx-1 w-8 h-8 rounded-lg hover:bg-blue-50 transition-colors"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deletePoktan(${p.id})" class="text-slate-400 hover:text-red-600 mx-1 w-8 h-8 rounded-lg hover:bg-red-50 transition-colors"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            });
            if(html === '') html = '<tr><td colspan="4" class="text-center py-12 text-slate-400 font-medium"><i class="fa-solid fa-folder-open text-3xl mb-3 block text-slate-300"></i>Data tidak ditemukan</td></tr>';
            tbody.innerHTML = html;

            renderAdminPoktanPagination(totalItems);
            populatePoktanSelect();
        }

        // ==========================================
        // FUNGSI PAGINASI & FILTER ADMIN BANTUAN
        // ==========================================
        function triggerAdminBantuanFilter() { adminBantuanPage = 1; renderBantuanTable(); }
        function changeAdminBantuanLimit(val) { adminBantuanLimit = parseInt(val); adminBantuanPage = 1; renderBantuanTable(); }
        function changeAdminBantuanPage(newPage) { adminBantuanPage = newPage; renderBantuanTable(); }

        function renderAdminBantuanPagination(totalItems) {
            const container = document.getElementById('admin-bantuan-pagination-container');
            const totalPages = Math.max(1, Math.ceil(totalItems / adminBantuanLimit)); 

            let html = `<div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white gap-4 rounded-b-3xl">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-slate-500">Menampilkan ${totalItems === 0 ? 0 : (adminBantuanPage-1)*adminBantuanLimit + 1}-${Math.min(adminBantuanPage*adminBantuanLimit, totalItems)} dari ${totalItems} baris</span>
                    <select onchange="changeAdminBantuanLimit(this.value)" class="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#16a34a] cursor-pointer shadow-sm">
                        <option value="10" ${adminBantuanLimit===10?'selected':''}>10 Baris</option>
                        <option value="50" ${adminBantuanLimit===50?'selected':''}>50 Baris</option>
                        <option value="100" ${adminBantuanLimit===100?'selected':''}>100 Baris</option>
                        <option value="1000" ${adminBantuanLimit===1000?'selected':''}>Semua</option>
                    </select>
                </div>
                <div class="flex items-center gap-1">`;

            html += `<button onclick="changeAdminBantuanPage(${adminBantuanPage - 1})" ${adminBantuanPage === 1 ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>`;

            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= adminBantuanPage - 1 && i <= adminBantuanPage + 1)) {
                    let active = i === adminBantuanPage ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
                    html += `<button onclick="changeAdminBantuanPage(${i})" class="w-8 h-8 flex items-center justify-center rounded-lg border ${active} text-xs font-bold transition-colors">${i}</button>`;
                } else if (i === adminBantuanPage - 2 || i === adminBantuanPage + 2) {
                    html += `<span class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>`;
                }
            }

            html += `<button onclick="changeAdminBantuanPage(${adminBantuanPage + 1})" ${adminBantuanPage === totalPages ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>`;
            html += `</div></div>`;
            container.innerHTML = html;
        }

        function renderBantuanTable() {
            const tbody = document.getElementById('tbody-bantuan');
            const poktanMap = getPoktanMap();
            const cari = document.getElementById('search-admin-bantuan')?.value.toLowerCase() || '';
            let html = '';
            
            let filteredData = dummyBantuan.filter(b => {
                if(b.tahun !== ADMIN_GLOBAL_YEAR) return false;
                let p = poktanMap[b.id_poktan] || {nama: 'Terhapus', desa: 'Terhapus'};
                let textToSearch = `${p.nama} ${p.desa} ${p.kec} ${b.nama_program} ${b.bidang} ${b.jenis}`.toLowerCase();
                return textToSearch.includes(cari);
            });

            let sortedData = filteredData.slice().reverse(); 

            const totalItems = sortedData.length;
            const startIndex = (adminBantuanPage - 1) * adminBantuanLimit;
            const paginatedData = sortedData.slice(startIndex, startIndex + adminBantuanLimit);

            paginatedData.forEach((b) => {
                let p = poktanMap[b.id_poktan] || {nama: 'Terhapus', desa: 'Terhapus'};
                let detailHtml = renderBantuanDetailHTML(b, 'adm-detail-' + b.id);

                html += `
                <tr class="hover:bg-slate-50/80 transition-colors group">
                    <td class="px-6 py-4 align-top">
                        <p class="text-sm font-bold text-slate-900">${p.nama}</p>
                        <span class="inline-block mt-1 px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase bg-slate-800 text-white">${b.bidang}</span>
                    </td>
                    <td class="px-6 py-4 align-top">
                        ${detailHtml}
                    </td>
                    <td class="px-6 py-4 text-xs font-bold text-slate-500 align-top">${b.sumber}</td>
                    <td class="px-6 py-4 text-right whitespace-nowrap align-top">
                        <button onclick="editBantuan(${b.id})" class="text-slate-400 hover:text-[#1e3a8a] mx-1 w-8 h-8 rounded-lg hover:bg-blue-50 transition-colors"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteBantuan(${b.id})" class="text-slate-400 hover:text-red-600 mx-1 w-8 h-8 rounded-lg hover:bg-red-50 transition-colors"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            });
            
            if(html === '') html = `<tr><td colspan="4" class="text-center py-12 text-slate-400 font-medium"><i class="fa-solid fa-box-open text-3xl mb-3 block text-slate-300"></i>Data tidak ditemukan</td></tr>`;
            tbody.innerHTML = html;

            renderAdminBantuanPagination(totalItems);
        }
