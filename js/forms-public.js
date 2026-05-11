        // ==========================================
        // DYNAMIC FORM LOGIC (Repeater Rincian Spesifikasi)
        // ==========================================
        function toggleSumberLainnya(val) {
            const el = document.getElementById('bantuan-sumber-lainnya');
            if(val === 'Lainnya...') {
                el.classList.remove('hidden');
                el.required = true;
            } else {
                el.classList.add('hidden');
                el.required = false;
            }
        }

        function autoResizeTextarea(el) {
            el.style.height = 'auto'; 
            el.style.height = el.scrollHeight + 'px';
        }

        function addRincianRow(spek = '', vol = '', sat = '', hrg = '', tot = '') {
            const tbody = document.getElementById('tbody-rincian-dinamis');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pr-2 pb-2 align-top">
                    <textarea class="inp-spesifikasi w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#16a34a] focus:outline-none resize-none overflow-hidden" rows="1" placeholder="Nama Barang / Spek" oninput="autoResizeTextarea(this)" required>${spek}</textarea>
                </td>
                <td class="px-1 pb-2 align-top">
                    <input type="number" class="inp-volume w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-[#16a34a] focus:outline-none" value="${vol}" placeholder="0" step="any" min="0" oninput="calculateRowTotal(this)" required>
                </td>
                <td class="px-1 pb-2 align-top">
                    <input type="text" class="inp-satuan w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-[#16a34a] focus:outline-none" value="${sat}" placeholder="Unit/Kg" required>
                </td>
                <td class="px-1 pb-2 align-top">
                    <input type="number" class="inp-harga w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-1 focus:ring-[#16a34a] focus:outline-none" value="${hrg}" placeholder="0" step="any" min="0" oninput="calculateRowTotal(this)" required>
                </td>
                <td class="px-1 pb-2 align-top">
                    <input type="text" class="inp-total w-full px-2 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-right font-bold text-slate-600 focus:outline-none cursor-not-allowed" value="${formatRupiah(tot || 0)}" readonly>
                    <input type="hidden" class="inp-total-raw" value="${tot || 0}">
                </td>
                <td class="pl-2 pb-2 text-center align-top pt-1">
                    <button type="button" onclick="removeRincianRow(this)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center mx-auto">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
            calculateGrandTotal();
            if(spek !== '') {
                const textareas = tbody.querySelectorAll('.inp-spesifikasi');
                setTimeout(() => autoResizeTextarea(textareas[textareas.length - 1]), 10);
            }
        }

        function removeRincianRow(btn) {
            btn.closest('tr').remove();
            calculateGrandTotal();
        }

        function calculateRowTotal(el) {
            const tr = el.closest('tr');
            const vol = parseFloat(tr.querySelector('.inp-volume').value) || 0;
            const hrg = parseFloat(tr.querySelector('.inp-harga').value) || 0;
            const tot = vol * hrg;
            tr.querySelector('.inp-total-raw').value = tot;
            tr.querySelector('.inp-total').value = formatRupiah(tot);
            calculateGrandTotal();
        }

        function calculateGrandTotal() {
            let grandTotal = 0;
            document.querySelectorAll('.inp-total-raw').forEach(inp => grandTotal += parseFloat(inp.value) || 0);
            document.getElementById('grand-total-display').innerText = formatRupiah(grandTotal);
        }

        // ==========================================
        // FUNGSI MODE VS & PAGINATION (PUBLIK)
        // ==========================================
        function triggerFilter() {
            publicPage = 1; 
            renderPublicTable();
        }

        function changePublicLimit(val) {
            publicLimit = parseInt(val);
            publicPage = 1; 
            renderPublicTable();
        }

        function changePublicPage(newPage) {
            publicPage = newPage;
            renderPublicTable();
        }

        function toggleVsMode() {
            isVsMode = !isVsMode;
            const btn = document.getElementById('btn-toggle-vs');
            const sep = document.getElementById('vs-separator');
            const wrapVs2 = document.getElementById('wrapper-vs2');
            const sumCards = document.getElementById('vs-summary-cards');
            const select1 = document.getElementById('filter-tahun-publik');
            const select2 = document.getElementById('filter-tahun-publik-vs2');
            
            if (isVsMode) {
                btn.classList.add('bg-[#1e3a8a]', 'text-white', 'border-[#1e3a8a]');
                btn.classList.remove('bg-slate-50', 'text-slate-600');
                sep.classList.remove('hidden');
                wrapVs2.classList.remove('hidden');
                sumCards.classList.remove('hidden');
                
                // Ambil tahun aktif dari ruang kerja admin agar data dipastikan tidak kosong (Bukan tebak-tebakan 2026)
                let defaultVsYear = ADMIN_GLOBAL_YEAR.toString();
                
                select1.querySelector('option[value="Semua"]').disabled = true;
                select1.value = defaultVsYear;
                select2.value = ""; // Set default kosong ("-- Pilih Tahun --")
            } else {
                btn.classList.remove('bg-[#1e3a8a]', 'text-white', 'border-[#1e3a8a]');
                btn.classList.add('bg-slate-50', 'text-slate-600');
                sep.classList.add('hidden');
                wrapVs2.classList.add('hidden');
                sumCards.classList.add('hidden');
                
                select1.querySelector('option[value="Semua"]').disabled = false;
                select1.value = "Semua"; // Kembalikan ke Semua Tahun
            }
            triggerFilter();
        }

        function renderPublicPagination(totalItems) {
            const container = document.getElementById('public-pagination-container');
            const totalPages = Math.max(1, Math.ceil(totalItems / publicLimit)); // Selalu min 1 hal.

            let html = `<div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white gap-4">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-slate-500">Menampilkan ${totalItems === 0 ? 0 : (publicPage-1)*publicLimit + 1}-${Math.min(publicPage*publicLimit, totalItems)} dari ${totalItems} baris</span>
                    <select onchange="changePublicLimit(this.value)" class="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#16a34a] cursor-pointer shadow-sm">
                        <option value="10" ${publicLimit===10?'selected':''}>10 Baris</option>
                        <option value="50" ${publicLimit===50?'selected':''}>50 Baris</option>
                        <option value="100" ${publicLimit===100?'selected':''}>100 Baris</option>
                        <option value="1000" ${publicLimit===1000?'selected':''}>Semua</option>
                    </select>
                </div>
                <div class="flex items-center gap-1">`;

            html += `<button onclick="changePublicPage(${publicPage - 1})" ${publicPage === 1 ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>`;

            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= publicPage - 1 && i <= publicPage + 1)) {
                    let active = i === publicPage ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
                    html += `<button onclick="changePublicPage(${i})" class="w-8 h-8 flex items-center justify-center rounded-lg border ${active} text-xs font-bold transition-colors">${i}</button>`;
                } else if (i === publicPage - 2 || i === publicPage + 2) {
                    html += `<span class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>`;
                }
            }

            html += `<button onclick="changePublicPage(${publicPage + 1})" ${publicPage === totalPages ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>`;

            html += `</div></div>`;
            container.innerHTML = html;
        }

        // ==========================================
        // OTHER CORE LOGIC
        // ==========================================
        function generateCaptcha() {
            const canvas = document.getElementById('captcha-canvas');
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; 
            currentCaptcha = "";
            for (let i = 0; i < 5; i++) {
                currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for(let i=0; i<4; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
                ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.font = "bold 26px 'Plus Jakarta Sans', Arial";
            ctx.fillStyle = "#1e3a8a";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            
            for(let i=0; i<currentCaptcha.length; i++) {
                ctx.save();
                ctx.translate(25 + i*22, 22);
                ctx.rotate((Math.random() - 0.5) * 0.4); 
                ctx.fillText(currentCaptcha[i], 0, 0);
                ctx.restore();
            }
        }

        function changeGlobalYear(yearVal) {
            ADMIN_GLOBAL_YEAR = parseInt(yearVal);
            updateGlobalYearLabels();
            adminBantuanPage = 1; // Reset page saat ganti tahun
            renderBantuanTable();
            updateDashboardStats();
            updateChartData();
        }

        function updateGlobalYearLabels() {
            if (document.getElementById('stat-tahun-label')) document.getElementById('stat-tahun-label').innerText = ADMIN_GLOBAL_YEAR;
            if (document.getElementById('stat-tahun-active')) document.getElementById('stat-tahun-active').innerText = ADMIN_GLOBAL_YEAR;
            if (document.getElementById('title-tahun-bantuan')) document.getElementById('title-tahun-bantuan').innerText = ADMIN_GLOBAL_YEAR;
            if (document.getElementById('bantuan-tahun')) document.getElementById('bantuan-tahun').value = ADMIN_GLOBAL_YEAR;
            
            // Perbarui seluruh class chart-tahun-label
            document.querySelectorAll('.chart-tahun-label').forEach(el => {
                el.innerText = ADMIN_GLOBAL_YEAR;
            });
        }

        function initWilayahDropdown() {
            const kecSelect = document.getElementById('poktan-kec');
            if (kecSelect) {
                let htmlKec = '<option value="" disabled selected>-- Pilih Kecamatan --</option>';
                const sortedKecamatans = Object.keys(dataWilayah).sort();
                sortedKecamatans.forEach(kec => { htmlKec += `<option value="${kec}">${kec}</option>`; });
                kecSelect.innerHTML = htmlKec;
            }
            const desaSelect = document.getElementById('poktan-desa');
            if (desaSelect) {
                desaSelect.innerHTML = '<option value="" disabled selected>-- Pilih Desa / Kel. --</option>';
            }
        }

        function updateDesaDropdown(selectedDesa = null) {
            const kecSelect = document.getElementById('poktan-kec');
            const desaSelect = document.getElementById('poktan-desa');
            if (!kecSelect || !desaSelect) return;
            
            const kec = kecSelect.value;
            let htmlDesa = '<option value="" disabled selected>-- Pilih Desa / Kel. --</option>';
            if (kec && dataWilayah[kec]) {
                const sortedDesas = dataWilayah[kec].slice().sort();
                sortedDesas.forEach(desa => {
                    const isSelected = (desa === selectedDesa) ? 'selected' : '';
                    htmlDesa += `<option value="${desa}" ${isSelected}>${desa}</option>`;
                });
                desaSelect.disabled = false;
            } else {
                desaSelect.disabled = true;
            }
            desaSelect.innerHTML = htmlDesa;
        }
