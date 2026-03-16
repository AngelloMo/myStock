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

    // 'total'과 'daily'라는 일반적인 이름 대신 더 구체적인 키 사용
    const urls = [
        `https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits/up?t=${ts}`,
        `https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}/up?t=${ts}`
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
    const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    for (const pUrl of proxies) {
        try {
            const res = await fetch(pUrl);
            if (res.ok) {
                const data = await res.json();
                if (pUrl.includes('allorigins')) {
                    const parsed = JSON.parse(data.contents);
                    if (parsed && typeof parsed.count !== 'undefined') return parsed;
                } else {
                    if (data && typeof data.count !== 'undefined') return data;
                }
            }
        } catch (e) {
            console.warn(`Proxy ${pUrl} failed for ${url}`);
        }
    }
    return { count: 0 }; // 모든 프록시 실패 시 0 반환
}

window.getVisitStats = async function() {
    const todayStr = getLocalDateString(0);
    const ts = Date.now();
    
    // 두 요청을 병렬로 처리
    const [totalData, dailyData] = await Promise.all([
        proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits?t=${ts}`),
        proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}?t=${ts}`)
    ]);

    const total = Number(totalData.count || 0);
    const daily = Number(dailyData.count || 0);

    console.log('[CounterAPI] Stats - Total:', total, 'Daily:', daily);
    return { total, daily };
};

window.getVisitTrend = async function() {
    const trend = [];
    const ts = Date.now();
    const days = 7;
    const fetchPromises = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        const key = `daily_hits_${y}${m}${day}`;

        fetchPromises.push(
            proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${key}?t=${ts}`)
                .then(data => ({ date: dateStr, count: Number(data.count || 0) }))
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