// Counter API logic - "The Bulletproof Version 2026"
const NAMESPACE = 'mystock_real_2026_final_v2'; 

function getLocalDateString(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}

// 1. 카운트 증가 로직 (fetch no-cors + Image fallback)
async function incrementVisit() {
    const todayStr = getLocalDateString(0);
    const ts = Date.now();

    const urls = [
        `https://api.counterapi.dev/v1/${NAMESPACE}/total/up?t=${ts}`,
        `https://api.counterapi.dev/v1/${NAMESPACE}/daily${todayStr}/up?t=${ts}`
    ];

    urls.forEach(url => {
        // Method 1: Fetch no-cors
        fetch(url, { mode: 'no-cors' }).catch(() => {
            // Method 2: Image Pixel Fallback
            const img = new Image();
            img.src = url;
        });
    });

    console.log('[CounterAPI] Visit increment requested for:', todayStr);
}

// 2. CORS 프록시를 사용하여 데이터 읽기
async function proxyFetch(url) {
    // 여러 프록시를 시도할 수 있도록 구성
    const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    for (const pUrl of proxies) {
        try {
            const res = await fetch(pUrl);
            if (res.ok) {
                const data = await res.json();
                // allorigins returns { contents: "..." }
                if (pUrl.includes('allorigins')) {
                    return JSON.parse(data.contents);
                }
                return data;
            }
        } catch (e) {
            console.warn(`Proxy ${pUrl} failed, trying next...`);
        }
    }
    throw new Error('All proxies failed');
}

window.getVisitStats = async function() {
    const todayStr = getLocalDateString(0);
    const ts = Date.now();
    let total = 0;
    let daily = 0;

    try {
        const totalData = await proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total?t=${ts}`);
        total = Number(totalData.count || 0);
        console.log('[CounterAPI] Total views fetched:', total);
    } catch (e) {
        console.error('[CounterAPI] Total stats error:', e);
    }

    try {
        const dailyData = await proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily${todayStr}?t=${ts}`);
        daily = Number(dailyData.count || 0);
        console.log('[CounterAPI] Daily views fetched:', daily);
    } catch (e) {
        console.error('[CounterAPI] Daily stats error:', e);
    }

    return { total, daily };
};

window.getVisitTrend = async function() {
    const trend = [];
    const ts = Date.now();

    // 최근 7일간의 데이터를 순차적으로 호출 (실제 값)
    const days = 7;
    const fetchPromises = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        const key = `daily${y}${m}${day}`;

        fetchPromises.push(
            proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${key}?t=${ts}`)
                .then(data => ({ date: dateStr, count: Number(data.count || 0) }))
                .catch(() => ({ date: dateStr, count: 0 }))
        );
    }

    return await Promise.all(fetchPromises);
};

// Auto-run (Avoid admin page)
(function() {
    if (window.location.pathname.includes('admin.html')) return;

    const todayStr = getLocalDateString(0);
    const sessionKey = `v_pixel_${todayStr}`;

    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit();
        sessionStorage.setItem(sessionKey, 'true');
    }
})();