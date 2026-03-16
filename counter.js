// Counter API logic - "The Bulletproof Version 2026.03.16"
const NAMESPACE = 'mystock_real_2026_final_v2'; 

// KST (UTC+9) 기준 날짜 문자열 생성
function getKSTDateString(offset = 0) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kst = new Date(utc + (3600000 * 9));

    if (offset !== 0) {
        kst.setDate(kst.getDate() - offset);
    }

    const y = kst.getFullYear();
    const m = String(kst.getMonth() + 1).padStart(2, '0');
    const day = String(kst.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}

// 1. 카운트 증가 로직
async function incrementVisit() {
    const todayStr = getKSTDateString(0);
    const ts = Date.now();

    const urls = [
        `https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits/up?t=${ts}`,
        `https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}/up?t=${ts}`
    ];

    urls.forEach(url => {
        fetch(url, { mode: 'no-cors', cache: 'no-store' }).catch(() => {
            const img = new Image();
            img.src = url;
        });
    });

    console.log('[CounterAPI] Visit increment requested (KST):', todayStr);
}

// 2. 캐시 방지 및 프록시를 사용하여 데이터 읽기
async function proxyFetch(url) {
    const ts = Date.now();
    const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_=${ts}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    for (const pUrl of proxies) {
        try {
            const res = await fetch(pUrl, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                let result = null;

                if (pUrl.includes('allorigins')) {
                    result = typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
                } else {
                    result = data;
                }

                // API returns { count: value } on success
                if (result && typeof result.count !== 'undefined') {
                    return result;
                }

                // API might return error message if key doesn't exist
                if (result && result.message && result.message.includes('not found')) {
                    return { count: 0 };
                }
            }
        } catch (e) {
            console.warn(`Proxy ${pUrl} failed or returned invalid data:`, e);
        }
    }
    return null; 
}

window.getVisitStats = async function() {
    const todayStr = getKSTDateString(0);
    const ts = Date.now();

    const [totalData, dailyData] = await Promise.all([
        proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits?t=${ts}`),
        proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}?t=${ts}`)
    ]);

    return { 
        total: totalData !== null ? Number(totalData.count) : null, 
        daily: dailyData !== null ? Number(dailyData.count) : null 
    };
};

window.getVisitTrend = async function() {
    const ts = Date.now();
    const days = 7;
    const fetchPromises = [];

    for (let i = days - 1; i >= 0; i--) {
        const dStr = getKSTDateString(i);
        // MM-DD format for cleaner chart
        const dateDisplay = `${dStr.substring(4,6)}-${dStr.substring(6,8)}`;
        const key = `daily_hits_${dStr}`;

        fetchPromises.push(
            proxyFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${key}?t=${ts}`)
                .then(data => ({ 
                    date: dateDisplay, 
                    count: data !== null ? Number(data.count) : 0 
                }))
        );
    }

    return await Promise.all(fetchPromises);
};

// Auto-run (Avoid admin page)
(function() {
    if (window.location.pathname.includes('admin.html')) return;

    const todayStr = getKSTDateString(0);
    const sessionKey = `v_pixel_${todayStr}`;

    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit();
        sessionStorage.setItem(sessionKey, 'true');
    }
})();