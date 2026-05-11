        // ==========================================
        // ENGINE API GOOGLE APPS SCRIPT (Ditambahkan)
        // ==========================================
        async function gasAPI(action, payload = {}) {
            if (IS_PREVIEW) return { status: 'success', data: payload };
            
            try {
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: action, payload: payload })
                });
                return await response.json();
            } catch(e) {
                console.error("GAS API Error:", e);
                throw e;
            }
        }
