        function switchView(viewId) {
            document.getElementById('public-view').classList.add('hidden');
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('admin-view').classList.add('hidden');
            document.getElementById(viewId).classList.remove('hidden');
            window.scrollTo(0, 0);
            if(viewId === 'public-view') renderPublicTable();
        }

        function normalizeLoginValue(value) {
            return String(value ?? '')
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/\u00A0/g, ' ')
                .trim();
        }

        function normalizeUserKey(key) {
            return normalizeLoginValue(key).toLowerCase().replace(/[\s-]+/g, '_');
        }

        function getUserField(user, aliases, fallback = '') {
            if(!user) return fallback;
            const normalizedAliases = aliases.map(normalizeUserKey);
            for(const key in user) {
                if(normalizedAliases.includes(normalizeUserKey(key))) {
                    return user[key];
                }
            }
            return fallback;
        }

        function normalizeUserRole(role) {
            const normalized = normalizeLoginValue(role).toLowerCase().replace(/[\s-]+/g, '_');
            if(normalized.includes('super')) return 'super_admin';
            if(normalized.includes('operator')) return 'operator';
            return normalized || 'operator';
        }

        function normalizeUserRecord(user) {
            const username = getUserField(user, ['username', 'user', 'nama_user', 'user_name']);
            return {
                ...user,
                id: getUserField(user, ['id', 'ID'], user?.id),
                username: normalizeLoginValue(username),
                password: normalizeLoginValue(getUserField(user, ['password', 'pass', 'sandi', 'kata_sandi'])),
                name: normalizeLoginValue(getUserField(user, ['name', 'nama', 'nama_lengkap', 'full_name'], username)),
                role: normalizeUserRole(getUserField(user, ['role', 'level', 'hak_akses', 'akses'], 'operator'))
            };
        }

        function updateRoleRestrictedControls() {
            const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
            document.querySelectorAll('[data-super-admin-only="import-tools"]').forEach(btn => {
                const tooltipTarget = btn.closest('[data-super-admin-tooltip]') || btn;
                btn.disabled = !isSuperAdmin;
                btn.title = '';
                tooltipTarget.title = isSuperAdmin ? '' : 'Dalam pengembangan / di luar kewenangan';
                btn.setAttribute('aria-disabled', String(!isSuperAdmin));
                btn.classList.toggle('opacity-50', !isSuperAdmin);
                btn.classList.toggle('cursor-not-allowed', !isSuperAdmin);
                btn.classList.toggle('text-slate-700', isSuperAdmin);
                btn.classList.toggle('text-slate-400', !isSuperAdmin);
                btn.classList.toggle('hover:bg-blue-50', isSuperAdmin);
                btn.classList.toggle('hover:text-[#1e3a8a]', isSuperAdmin);
            });
        }

        function handleLogin(e) {
            e.preventDefault();
            const u = normalizeLoginValue(document.getElementById('username').value);
            const p = normalizeLoginValue(document.getElementById('password').value);
            const c = normalizeLoginValue(document.getElementById('captcha-input').value);

            if (c.toLowerCase() !== currentCaptcha.toLowerCase()) {
                showToast("Kode keamanan (CAPTCHA) salah!", "error");
                document.getElementById('captcha-input').value = '';
                generateCaptcha();
                return;
            }

            // CEK DATABASE USER MULTI-ROLE
            const userMatch = dummyUsers.map(normalizeUserRecord).find(user => {
                return user.username.toLowerCase() === u.toLowerCase() && user.password === p;
            });

            if (userMatch) {
                currentUser = userMatch;
                
                // Update Identitas Sidebar
                const initials = userMatch.name.substring(0, 2).toUpperCase();
                document.querySelectorAll('#sidebar-user-initial').forEach(el => el.innerText = initials);
                document.querySelectorAll('#sidebar-user-name').forEach(el => el.innerText = userMatch.name);
                document.querySelectorAll('#sidebar-user-role').forEach(el => el.innerText = userMatch.role === 'super_admin' ? 'Super Admin' : 'Operator Data');
                
                // Logika Pembatasan Tampilan
                const navSistemGroup = document.getElementById('nav-group-sistem');
                const navMobilePengaturan = document.getElementById('nav-mobile-pengaturan');
                
                if (userMatch.role !== 'super_admin') {
                    if(navSistemGroup) navSistemGroup.classList.add('hidden');
                    if(navMobilePengaturan) navMobilePengaturan.classList.add('hidden');
                } else {
                    if(navSistemGroup) navSistemGroup.classList.remove('hidden');
                    if(navMobilePengaturan) navMobilePengaturan.classList.remove('hidden');
                    renderUsersTable(); // Render tabel jika super admin
                }

                updateRoleRestrictedControls();

                showLoading("Membuka ruang kerja...");
                setTimeout(() => {
                    showToast(`Selamat datang, ${userMatch.name}!`, "success");
                    document.getElementById('username').value = '';
                    document.getElementById('password').value = '';
                    document.getElementById('captcha-input').value = '';
                    
                    switchView('admin-view');
                    switchAdminTab('tab-dashboard');
                    hideLoading();
                }, 800);
            } else {
                showToast("Username atau Password salah!", "error");
                document.getElementById('captcha-input').value = '';
                generateCaptcha();
            }
        }

        function handleLogout() {
            currentUser = null;
            updateRoleRestrictedControls();
            showToast("Anda telah keluar dari ruang kerja", "info");
            switchView('public-view');
            generateCaptcha(); 
        }

        function switchAdminTab(tabId) {
            // LAYER KEAMANAN: Blokir Akses jika bukan Super Admin
            if(tabId === 'tab-pengaturan' && (!currentUser || currentUser.role !== 'super_admin')) {
                showToast("Akses Ditolak: Hanya Super Admin yang berhak mengubah Pengaturan Sistem.", "error");
                return;
            }

            document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.admin-nav-btn').forEach(el => {
                el.classList.remove('bg-brand-50', 'text-brand-600');
                el.classList.add('text-slate-500');
            });
            document.getElementById(tabId).classList.remove('hidden');
            
            const activeBtn = document.getElementById('nav-' + tabId);
            if(activeBtn) {
                activeBtn.classList.remove('text-slate-500');
                activeBtn.classList.add('bg-brand-50', 'text-brand-600');
            }

            const titles = {
                'tab-dashboard': 'Dashboard Overview',
                'tab-poktan': 'Data Master Poktan',
                'tab-bantuan': 'Data Penyaluran',
                'tab-pengaturan': 'Sistem Pengaturan'
            };
            document.getElementById('admin-header-title').innerText = titles[tabId];
        }

        function toggleMenu() {
            const mobilePanel = document.getElementById('mobile-sidebar');
            const innerPanel = document.getElementById('mobile-sidebar-panel');
            if (!mobilePanel.classList.contains('hidden')) {
                innerPanel.classList.add('-translate-x-full');
                setTimeout(() => mobilePanel.classList.add('hidden'), 300);
                return;
            }
            if (window.innerWidth >= 768) {
                // Desktop Smooth Sliding Animation
                const sidebar = document.getElementById('sidebar');
                if (sidebar.classList.contains('w-72')) {
                    sidebar.classList.remove('w-72', 'border-r');
                    sidebar.classList.add('w-0');
                } else {
                    sidebar.classList.remove('w-0');
                    sidebar.classList.add('w-72', 'border-r');
                }
            } else {
                mobilePanel.classList.remove('hidden');
                setTimeout(() => innerPanel.classList.remove('-translate-x-full'), 10);
            }
        }

        // ==========================================
        // FUNGSI MULTI ROLE (BARU)
        // ==========================================
        
        function openProfileModal() {
            if(!currentUser) return;
            document.getElementById('profil-nama').value = currentUser.name;
            document.getElementById('profil-password').value = '';
            document.getElementById('modal-profil-initial').innerText = currentUser.name.substring(0,2).toUpperCase();
            
            let badge = document.getElementById('modal-profil-role-badge');
            if(currentUser.role === 'super_admin') {
                badge.innerText = 'Super Admin';
                badge.className = 'text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide';
            } else {
                badge.innerText = 'Operator Data';
                badge.className = 'text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide';
            }
            
            document.getElementById('modal-profil').classList.remove('hidden');
        }

        async function handleUpdateProfile(e) {
            e.preventDefault();
            showConfirm(
                "Simpan Perubahan Profil?", 
                "Apakah Anda yakin ingin menyimpan perubahan detail nama dan sandi akun ini?",
                async () => {
                    showLoading("Memperbarui profil Anda...");
                    const newName = document.getElementById('profil-nama').value;
                    const newPass = document.getElementById('profil-password').value;
                    
                    let payload = { ...currentUser };
                    payload.name = newName;
                    if(newPass.trim() !== '') payload.password = newPass;

                    try {
                        let res = await gasAPI('saveUser', payload);
                        if(res.status === 'success' || IS_PREVIEW) {
                            let userInDb = dummyUsers.find(u => u.id === currentUser.id);
                            if(userInDb) {
                                userInDb.name = newName;
                                if(newPass.trim() !== '') userInDb.password = newPass;
                            }
                            currentUser.name = newName;
                            if(newPass.trim() !== '') currentUser.password = newPass;
                            
                            const initials = currentUser.name.substring(0, 2).toUpperCase();
                            document.querySelectorAll('#sidebar-user-initial').forEach(el => el.innerText = initials);
                            document.querySelectorAll('#sidebar-user-name').forEach(el => el.innerText = currentUser.name);

                            showToast("Profil Anda berhasil diperbarui!", "success");
                            closeModal('modal-profil');
                        }
                    } catch(err) {
                        showToast("Gagal terhubung ke server", "error");
                    }
                    hideLoading();
                }
            );
        }

        function renderUsersTable() {
            const tbody = document.getElementById('tbody-users');
            let html = '';
            dummyUsers.map(normalizeUserRecord).forEach(u => {
                let isMe = currentUser && String(currentUser.id) === String(u.id);
                let badgeClass = u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700';
                let roleName = u.role === 'super_admin' ? 'Super Admin' : 'Operator';
                
                html += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-2.5 px-3">
                        <p class="font-bold text-slate-800 text-[11px]">${u.name} ${isMe ? '<span class="text-[9px] text-amber-600 ml-1 font-black">(Anda)</span>' : ''}</p>
                        <p class="text-[10px] text-slate-500">@${u.username}</p>
                    </td>
                    <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded text-[9px] font-bold ${badgeClass} uppercase tracking-wider">${roleName}</span>
                    </td>
                    <td class="py-2.5 px-3 text-right">
                        ${isMe ? 
                            `<span class="text-[10px] text-slate-400 italic">No Action</span>` : 
                            `<button type="button" onclick="deleteUser(${u.id})" class="text-slate-400 hover:text-red-500 w-7 h-7 rounded bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors inline-flex items-center justify-center"><i class="fa-solid fa-trash text-[10px]"></i></button>`
                        }
                    </td>
                </tr>`;
            });
            if (tbody) tbody.innerHTML = html;
        }

        function handleAddUser(e) {
            e.preventDefault();
            const uname = normalizeLoginValue(document.getElementById('add-user-username').value);
            // Pengecekan username unik
            if(dummyUsers.map(normalizeUserRecord).find(u => u.username.toLowerCase() === uname.toLowerCase())) {
                showToast("Gagal: Username tersebut sudah digunakan!", "error");
                return;
            }

            showConfirm(
                "Buat Akun Baru?", 
                "Apakah Anda yakin ingin menambahkan akses baru untuk sistem ini?",
                async () => {
                    showLoading("Membuat akses akun baru...");
                    const payload = {
                        id: Date.now(),
                        username: uname,
                        password: document.getElementById('add-user-password').value,
                        name: document.getElementById('add-user-name').value,
                        role: document.getElementById('add-user-role').value
                    };

                    try {
                        let res = await gasAPI('saveUser', payload);
                        if(res.status === 'success' || IS_PREVIEW) {
                            dummyUsers.push(IS_PREVIEW ? payload : res.data);
                            showToast("Akses akun baru berhasil ditambahkan!", "success");
                            
                            document.getElementById('add-user-name').value = '';
                            document.getElementById('add-user-username').value = '';
                            document.getElementById('add-user-password').value = '';
                            document.getElementById('add-user-role').value = '';
                            
                            renderUsersTable();
                        }
                    } catch(err) {
                        showToast("Gagal terhubung ke server", "error");
                    }
                    hideLoading();
                }
            );
        }

        function deleteUser(id) {
            const userToDelete = normalizeUserRecord(dummyUsers.find(u => String(normalizeUserRecord(u).id) === String(id)));
            
            // Cegah penghapusan Super Admin terakhir di sistem
            const adminCount = dummyUsers.map(normalizeUserRecord).filter(u => u.role === 'super_admin').length;
            if(userToDelete.role === 'super_admin' && adminCount <= 1) {
                showToast("Aksi Ditolak: Harus tersisa minimal 1 Super Admin di sistem!", "error");
                return;
            }

            showConfirm(
                "Hapus Pengguna?", 
                `Apakah Anda yakin ingin mencabut akses akun milik ${userToDelete.name}?`,
                async () => {
                    showLoading("Menghapus data pengguna...");
                    try {
                        let res = await gasAPI('deleteUser', {id: id});
                        if(res.status === 'success' || IS_PREVIEW) {
                            dummyUsers = dummyUsers.filter(u => String(normalizeUserRecord(u).id) !== String(id));
                            showToast(`Akses untuk ${userToDelete.name} berhasil dihapus.`, "success");
                            renderUsersTable();
                        }
                    } catch(err) {
                        showToast("Gagal terhubung ke server", "error");
                    }
                    hideLoading();
                }
            );
        }

        // FUNGSI TOGGLE ACCORDION TABEL
        function toggleDetail(id) {
            const el = document.getElementById(id);
            const icon = document.getElementById('icon-' + id);
            if(el.classList.contains('hidden')) {
                el.classList.remove('hidden');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                el.classList.add('hidden');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        }
