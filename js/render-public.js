        function getPoktanMap() {
            let map = {};
            dummyPoktan.forEach(p => { map[p.id] = p; });
            return map;
        }

        function getBadgeClass(kategori) {
            if(kategori === 'Hibah Uang') return 'bg-violet-100 text-violet-700 border-violet-200';
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }

        function formatRupiah(angka) {
            if(isNaN(angka) || angka === '') return 'Rp 0';
            return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
        }

        function renderBantuanDetailHTML(b, detailId) {
            let badgeType = b.jenis === 'Hibah Uang' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
            
            let html = `<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                                <p class="text-sm font-bold text-[#1e3a8a] mb-1">${b.nama_program}</p>
                                <span class="inline-block px-2.5 py-1 rounded-md border text-[10px] font-extrabold tracking-wide uppercase ${badgeType} mb-1">${b.jenis}</span>
                            </div>
                        </div>`;
            
            if(b.rincian && b.rincian.length > 0) {
                let grandTotal = 0;
                let tableRows = '';
                
                b.rincian.forEach(item => {
                    grandTotal += item.total;
                    tableRows += `<tr>
                                <td class="px-3 py-2 leading-snug">${item.spesifikasi}</td>
                                <td class="px-3 py-2 whitespace-nowrap">${item.volume} ${item.satuan}</td>
                                <td class="px-3 py-2 text-right text-slate-700 font-bold">${formatRupiah(item.total)}</td>
                             </tr>`;
                });
                
                html += `<div class="mt-2 flex items-center flex-wrap gap-2">
                            <span class="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">Total: <span class="text-[#16a34a] font-extrabold text-sm ml-1">${formatRupiah(grandTotal)}</span></span>
                            <button onclick="toggleDetail('${detailId}')" class="text-[10px] bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors flex items-center gap-1 font-bold">
                                <i class="fa-solid fa-list text-slate-400"></i> Rincian (${b.rincian.length}) <i class="fa-solid fa-chevron-down ml-1" id="icon-${detailId}"></i>
                            </button>
                         </div>`;

                html += `<div id="${detailId}" class="hidden mt-3 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300">
                            <table class="w-full text-left text-[11px] sm:text-xs">
                                <thead class="bg-slate-100/80 text-[10px] text-slate-500 uppercase">
                                    <tr>
                                        <th class="px-3 py-2 font-bold w-1/2">Spesifikasi</th>
                                        <th class="px-3 py-2 font-bold">Vol</th>
                                        <th class="px-3 py-2 font-bold text-right">Total (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-600 font-medium">
                                    ${tableRows}
                                </tbody>
                            </table>
                         </div>`;
            }
            return html;
        }

        function renderVsRowHTML(b, poktanInfo, detailId) {
            let grandTotal = b.rincian ? b.rincian.reduce((sum, item) => sum + item.total, 0) : 0;
            let tableRows = '';
            
            if(b.rincian) {
                b.rincian.forEach(item => {
                    tableRows += `<tr>
                        <td class="py-1 text-slate-600 leading-tight">${item.spesifikasi}</td>
                        <td class="py-1 text-right font-bold text-slate-700 whitespace-nowrap ml-2">${formatRupiah(item.total)}</td>
                    </tr>`;
                });
            }

            return `
            <tr class="hover:bg-slate-50/80 transition-colors group">
                <td class="px-4 py-4 align-top">
                    <div class="flex justify-between items-start gap-2">
                        <div>
                            <p class="text-sm font-extrabold text-slate-900 leading-tight">${poktanInfo.nama || '-'}</p>
                            <p class="text-[10px] text-slate-500 mt-0.5">${poktanInfo.desa || '-'} â€¢ <span class="font-bold text-slate-600">${b.nama_program}</span></p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p class="text-sm font-black text-[#16a34a]">${formatRupiah(grandTotal)}</p>
                            <button onclick="toggleDetail('${detailId}')" class="text-[10px] text-slate-400 hover:text-[#1e3a8a] mt-1 flex items-center justify-end gap-1 ml-auto font-bold transition-colors w-full">Detail <i class="fa-solid fa-chevron-down" id="icon-${detailId}"></i></button>
                        </div>
                    </div>
                    <div id="${detailId}" class="hidden mt-3 bg-slate-50/80 rounded-lg border border-slate-100 p-2.5 transition-all">
                        <table class="w-full text-[10px]">
                            <tbody class="divide-y divide-slate-100/50">
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>`;
        }

        function renderPublicTable() {
            const tbodyStandard = document.getElementById('tbody-publik');
            const tbodyVs1 = document.getElementById('tbody-publik-vs1');
            const tbodyVs2 = document.getElementById('tbody-publik-vs2');
            
            const filterTahun1 = document.getElementById('filter-tahun-publik').value;
            const filterTahun2 = document.getElementById('filter-tahun-publik-vs2').value;
            const cari = document.getElementById('search-publik').value.toLowerCase();
            const poktanMap = getPoktanMap();

            const select1El = document.getElementById('filter-tahun-publik');
            
            if(select1El.value !== 'Semua') {
                select1El.classList.add('text-[#16a34a]'); select1El.classList.remove('text-slate-600');
            } else {
                select1El.classList.remove('text-[#16a34a]'); select1El.classList.add('text-slate-600');
            }

            if(isVsMode) {
                document.getElementById('standard-table-container').classList.add('hidden');
                document.getElementById('vs-table-container').classList.remove('hidden');
                document.getElementById('vs-col-title-1').innerText = filterTahun1;
                document.getElementById('vs-col-title-2').innerText = filterTahun2 || '-';
            } else {
                document.getElementById('standard-table-container').classList.remove('hidden');
                document.getElementById('vs-table-container').classList.add('hidden');
            }

            let filteredDataY1 = []; let filteredDataY2 = []; 
            let statY1 = { poktan: new Set(), totalRp: 0 };
            let statY2 = { poktan: new Set(), totalRp: 0 };

            dummyBantuan.forEach(b => {
                let p = poktanMap[b.id_poktan] || {};
                let textToSearch = `${p.nama} ${p.desa} ${p.kec} ${b.nama_program} ${b.bidang} ${b.jenis}`.toLowerCase();
                let matchCari = textToSearch.includes(cari);
                
                if (matchCari) {
                    if (isVsMode) {
                        let grandTotal = b.rincian ? b.rincian.reduce((sum, item) => sum + item.total, 0) : 0;
                        
                        // Perbaikan Bug: Memisahkan pengecekan tahun menjadi blok IF yang mandiri
                        if (b.tahun.toString() === filterTahun1) {
                            filteredDataY1.push(b);
                            statY1.poktan.add(b.id_poktan);
                            statY1.totalRp += grandTotal;
                        }
                        
                        if (filterTahun2 !== "" && b.tahun.toString() === filterTahun2) {
                            filteredDataY2.push(b);
                            statY2.poktan.add(b.id_poktan);
                            statY2.totalRp += grandTotal;
                        }
                    } else {
                        if(filterTahun1 === 'Semua' || b.tahun.toString() === filterTahun1) {
                            filteredDataY1.push(b);
                        }
                    }
                }
            });

            filteredDataY1.sort((a, b) => b.id - a.id);
            filteredDataY2.sort((a, b) => b.id - a.id);

            if (isVsMode) {
                document.getElementById('vs-y1-title').innerText = filterTahun1;
                document.getElementById('vs-y1-poktan').innerText = statY1.poktan.size;
                document.getElementById('vs-y1-rp').innerText = formatRupiah(statY1.totalRp);
                document.getElementById('vs-y2-title').innerText = filterTahun2 || '-';
                document.getElementById('vs-y2-poktan').innerText = statY2.poktan.size;
                document.getElementById('vs-y2-rp').innerText = formatRupiah(statY2.totalRp);
            }

            const maxItems = isVsMode ? Math.max(filteredDataY1.length, filteredDataY2.length) : filteredDataY1.length;
            const startIndex = (publicPage - 1) * publicLimit;
            
            const paginatedY1 = filteredDataY1.slice(startIndex, startIndex + publicLimit);
            const paginatedY2 = isVsMode ? filteredDataY2.slice(startIndex, startIndex + publicLimit) : [];

            if (!isVsMode) {
                let html = '';
                paginatedY1.forEach(b => {
                    let p = poktanMap[b.id_poktan] || {};
                    let detailHtml = renderBantuanDetailHTML(b, 'pub-detail-' + b.id);
                    
                    html += `
                    <tr class="hover:bg-slate-50/80 transition-colors group">
                        <td class="px-6 py-5 align-top">
                            <p class="text-sm font-extrabold text-slate-900 mb-1">${p.nama || '-'}</p>
                            <p class="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <i class="fa-solid fa-location-dot text-slate-300"></i> Desa ${p.desa || '-'}, Kec. ${p.kec || '-'}
                            </p>
                        </td>
                        <td class="px-6 py-5 align-top">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">${b.tahun}</span>
                        </td>
                        <td class="px-6 py-5 align-top">
                            <div class="mb-2">
                                <span class="inline-block px-2.5 py-1 rounded-md border text-[9px] font-extrabold tracking-wide uppercase bg-slate-800 text-white mr-1">${b.bidang}</span>
                            </div>
                            ${detailHtml}
                        </td>
                        <td class="px-6 py-5 text-right align-top">
                            <span class="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">${b.sumber}</span>
                        </td>
                    </tr>`;
                });

                if(html === '') html = '<tr><td colspan="4" class="text-center py-12 text-slate-400 font-medium"><i class="fa-solid fa-folder-open text-3xl mb-3 block text-slate-300"></i>Tidak ada data yang cocok dengan filter</td></tr>';
                tbodyStandard.innerHTML = html;
            } else {
                let htmlVs1 = '';
                paginatedY1.forEach(b => { htmlVs1 += renderVsRowHTML(b, poktanMap[b.id_poktan] || {}, 'vs1-detail-' + b.id); });
                if(htmlVs1 === '') htmlVs1 = '<tr><td class="text-center py-12 text-slate-400 font-medium text-xs"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-slate-300"></i>Data Kosong</td></tr>';
                tbodyVs1.innerHTML = htmlVs1;

                let htmlVs2 = '';
                paginatedY2.forEach(b => { htmlVs2 += renderVsRowHTML(b, poktanMap[b.id_poktan] || {}, 'vs2-detail-' + b.id); });
                if(htmlVs2 === '') {
                    if (filterTahun2 === "") {
                        htmlVs2 = '<tr><td class="text-center py-12 text-slate-400 font-medium text-xs"><i class="fa-solid fa-hand-pointer text-3xl mb-3 block text-slate-300"></i>Silakan pilih tahun pada filter di atas<br>untuk mulai membandingkan.</td></tr>';
                    } else {
                        htmlVs2 = '<tr><td class="text-center py-12 text-slate-400 font-medium text-xs"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-slate-300"></i>Data Kosong</td></tr>';
                    }
                }
                tbodyVs2.innerHTML = htmlVs2;
            }

            renderPublicPagination(maxItems);
        }
