        // KONFIGURASI APLIKASI
        // UBAH IS_PREVIEW KE false JIKA AKAN DI-DEPLOY KE CLOUDFLARE/BLOGGER
        const IS_PREVIEW = false; 
        const GAS_URL = "https://script.google.com/macros/s/AKfycbwSfFtj38_4aQa_QcRN5AKvF5C1MwEn3z_Jwvlm-qv3tNt6zcTg1hVQHhAxjk2aamcDgA/exec";
        const APP_ASSETS = {
            favicon: './assets/brand/favicon.png',
            logoMark: './assets/brand/logo-mark.png',
            logoLogin: './assets/brand/logo-login.png',
            logoMarkFallback: 'https://i.imgur.com/4IeAh8Z.png',
            logoLoginFallback: 'https://i.imgur.com/O2s0oyH.png'
        };
        let ADMIN_GLOBAL_YEAR = new Date().getFullYear(); // State Tahun Global
