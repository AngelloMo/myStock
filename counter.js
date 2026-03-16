// Counter API logic - "Ultra High Performance Version 2026.03.16"
const NAMESPACE = 'mystock_real_2026_final_v2'; 

// KST (UTC+9) 기준 날짜 문자열 생성
function getKSTDateString(offset = 0) {
    const now = new Date();
    // UTC 타임스탬프 계산
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // KST 타임스탬프 계산 (UTC+9)
    const kst = new Date(utc + (3600000 * 9));

    if (offset !== 0) {
        kst.setDate(kst.getDate() - offset);
    }

    const y = kst.getFullYear();
    const m = String(kst.getMonth() + 1).padStart(2, '0');
    const day = String(kst.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}

// 1. 카운트 증가 로직 (중복 카운팅 방지를 위해 단일 방식 사용)
async function incrementVisit() {
    const todayStr = getKSTDateString(0);
    const ts = Date.now();

    const urls = [
        `https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits/up?t=${ts}`,
        `https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}/up?t=${ts}`
    ];

    urls.forEach(url => {
        // 비동기 실행 (Fire-and-forget)
        // fetch와 Image를 동시에 사용하면 중복 카운팅되므로, 가장 안정적인 Image 방식만 사용합니다.
        const img = new Image();
        img.src = url;
    });
}

// 2. 고속 데이터 패치 (병렬 프록시 전략)
async function fastFetch(url) {
    const ts = Date.now();
    const directUrl = `${url}${url.includes('?') ? '&' : '?'}t=${ts}`;
    
    // 1. Direct fetch 시도 (CORS 지원 여부 확인, 800ms 타임아웃)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const response = await fetch(directUrl, { cache: 'no-store', signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) return await response.json();
    } catch (e) {
        // Direct fetch failed or timed out
    }

    // 2. 병렬 프록시 시도 (가장 빠른 응답을 사용)
    const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(directUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(directUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(directUrl)}`
    ];

    const fetchFromProxy = async (pUrl) => {
        const res = await fetch(pUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('Proxy failed');
        const data = await res.json();
        
        let result = data;
        // allorigins는 응답이 { contents: "..." } 형태임
        if (pUrl.includes('allorigins')) {
            result = typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
        }
        
        if (result && (typeof result.count !== 'undefined' || result.message)) {
            return result;
        }
        throw new Error('Invalid data');
    };

    try {
        // Promise.any를 사용하여 가장 먼저 성공하는 프록시 결과 반환
        return await Promise.any(proxies.map(fetchFromProxy));
    } catch (e) {
        console.error('[CounterAPI] All fetch attempts failed:', e);
        return null; // 완전히 실패한 경우 null 반환
    }
}

window.getVisitStats = async function() {
    const todayStr = getKSTDateString(0);
    
    // 병렬 실행
    const [totalData, dailyData] = await Promise.all([
        fastFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/overall_hits`),
        fastFetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_hits_${todayStr}`)
    ]);

    return { 
        total: totalData !== null ? Number(totalData.count || 0) : null, 
        daily: dailyData !== null ? Number(dailyData.count || 0) : null 
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
                count: data !== null ? Number(data.count || 0) : 0 
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