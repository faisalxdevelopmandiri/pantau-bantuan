        // ==========================================
        // FITUR GLOBAL LOADING MODAL (BARU)
        // ==========================================
        function showLoading(message = "Memproses...") {
            document.getElementById('loading-text').innerText = message;
            const modal = document.getElementById('loading-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function hideLoading() {
            const modal = document.getElementById('loading-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        // ==========================================
        // CUSTOM TOAST & MODAL CONFIRMATION
        // ==========================================
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            let bgClass = 'bg-white';
            let icon = '<i class="fa-solid fa-circle-info text-blue-500"></i>';
            let borderClass = 'border-blue-200';

            if(type === 'success') {
                icon = '<i class="fa-solid fa-circle-check text-green-500"></i>';
                borderClass = 'border-green-200';
            } else if(type === 'error') {
                icon = '<i class="fa-solid fa-circle-xmark text-red-500"></i>';
                borderClass = 'border-red-200';
            }

            toast.className = `flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border ${borderClass} transform translate-x-full transition-all duration-300 pointer-events-auto w-max max-w-sm ml-auto`;
            toast.innerHTML = `<div class="text-xl flex-shrink-0">${icon}</div><p class="text-sm font-bold text-slate-700 leading-tight">${message}</p>`;
            
            container.appendChild(toast);
            
            // Animate In
            setTimeout(() => { toast.classList.remove('translate-x-full'); }, 10);
            
            // Animate Out & Remove
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        let confirmActionCallback = null;
        function showConfirm(title, message, callback) {
            document.getElementById('confirm-title').innerText = title;
            document.getElementById('confirm-message').innerText = message;
            confirmActionCallback = callback;
            
            const modal = document.getElementById('custom-confirm-modal');
            const box = document.getElementById('confirm-modal-box');
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => { box.classList.remove('scale-95'); box.classList.add('scale-100'); }, 10);

            document.getElementById('confirm-yes-btn').onclick = () => {
                let aksi = confirmActionCallback; // Ingat aksinya terlebih dahulu
                closeConfirm();                   // Tutup modal dan reset callback
                if(aksi) aksi();                  // Eksekusi aksi yang diingat!
            };
        }

        function closeConfirm() {
            const modal = document.getElementById('custom-confirm-modal');
            const box = document.getElementById('confirm-modal-box');
            box.classList.remove('scale-100'); box.classList.add('scale-95');
            setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 200);
            confirmActionCallback = null;
        }

        function confirmLogout() {
            showConfirm(
                "Akhiri Sesi?", 
                "Apakah Anda yakin ingin keluar dari ruang kerja?",
                () => { 
                    showLoading("Menutup sesi Anda...");
                    setTimeout(() => {
                        handleLogout();
                        hideLoading();
                    }, 1000);
                }
            );
        }

        // ==========================================
        // DROPDOWN MENU LOGIC
        // ==========================================
        function toggleDropdown(id) {
            const el = document.getElementById(id);
            if (el.classList.contains('hidden')) {
                // Tutup semua dropdown lain terlebih dahulu
                document.querySelectorAll('.dropdown-menu-content').forEach(menu => menu.classList.add('hidden'));
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }

        // Tutup dropdown jika mengklik area luar
        window.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown-container')) {
                document.querySelectorAll('.dropdown-menu-content').forEach(menu => menu.classList.add('hidden'));
            }
        });
