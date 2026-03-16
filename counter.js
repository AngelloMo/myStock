// Counter API logic - "High Performance Version 2026.03.16"
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

// 1. 카운트 증가 로직 (빠른 응답을 위해 픽셀 방식 사용)
async function incrementVisit() {
    const todayStr = getKSTDateString(0);
    const ts = Date.now();

    const urls = [
        `https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits/up?t=${ts}`,
        `https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}/up?t=${ts}`
    ];

    urls.forEach(url => {
        // 비동기 실행, 결과 대기하지 않음
        const img = new Image();
        img.src = url;
    });
}

// 2. 최적화된 데이터 패치 (Direct fetch 우선, 실패시 Proxy)
async function fastFetch(url) {
    const ts = Date.now();
    const directUrl = `${url}${url.includes('?') ? '&' : '?'}t=${ts}`;
    
    try {
        // 1. Direct fetch 시도 (CORS 지원하는 경우 가장 빠름)
        const response = await fetch(directUrl, { cache: 'no-store' });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn(`[CounterAPI] Direct fetch failed, trying proxy: ${url}`);
    }

    // 2. Proxy fallback (Direct fetch 실패 시에만 실행)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directUrl)}`;
    try {
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            return typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
        }
    } catch (e) {
        console.error(`[CounterAPI] Proxy fetch failed:`, e);
    }
    
    return { count: 0 }; // 기본값
}

window.getVisitStats = async function() {
    const todayStr = getKSTDateString(0);
    
    // 병렬 실행
    const [totalData, dailyData] = await Promise.all([
        fastFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits`),
        fastFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}`)
    ]);

    return { 
        total: totalData ? Number(totalData.count || 0) : 0, 
        daily: dailyData ? Number(dailyData.count || 0) : 0 
    };
};

window.getVisitTrend = async function() {
    const days = 7;
    const fetchPromises = [];

    for (let i = days - 1; i >= 0; i--) {
        const dStr = getKSTDateString(i);
        const dateDisplay = `${dStr.substring(4,6)}-${dStr.substring(6,8)}`;
        const url = `https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${dStr}`;

        fetchPromises.push(
            fastFetch(url).then(data => ({ 
                date: dateDisplay, 
                count: data ? Number(data.count || 0) : 0 
            }))
        );
    }

    return await Promise.all(fetchPromises);
};

// 자동 실행 (방문수 증가)
(function() {
    if (window.location.pathname.includes('admin.html')) return;

    const todayStr = getKSTDateString(0);
    const sessionKey = `v_pixel_${todayStr}`;

    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit();
        sessionStorage.setItem(sessionKey, 'true');
    }
})();