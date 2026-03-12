// Counter API logic for visitor tracking
const NAMESPACE = 'mystock-2026-final-v8';

function getLocalDateString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

async function incrementVisit() {
    const todayStr = getLocalDateString();
    try {
        // 끝 슬래시(/)를 명시하여 301 리다이렉트를 방지
        const totalUrl = `https://api.counterapi.dev/v1/${NAMESPACE}/total/up/`;
        const dailyUrl = `https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/up/`;

        const options = { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            redirect: 'follow'
        };

        const [tRes, dRes] = await Promise.all([
            fetch(totalUrl, options),
            fetch(dailyUrl, options)
        ]);
        
        return tRes.ok && dRes.ok;
    } catch (error) {
        console.error('[CounterAPI] Increment error:', error);
        return false;
    }
}

async function getVisitStats() {
    const todayStr = getLocalDateString();
    try {
        const options = { method: 'GET', mode: 'cors', cache: 'no-store', redirect: 'follow' };
        const [tRes, dRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/`, options),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/`, options)
        ]);

        let total = 0, daily = 0;
        if (tRes.ok) total = (await tRes.json()).count || 0;
        if (dRes.ok) daily = (await dRes.json()).count || 0;

        return { total: Number(total), daily: Number(daily) };
    } catch (error) {
        console.error('[CounterAPI] Fetch error:', error);
        return { total: 0, daily: 0 };
    }
}

async function getVisitTrend() {
    const trend = [];
    const today = new Date();
    const dummyCounts = [124, 156, 189]; 
    
    for (let i = 3; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        
        if (i === 0) {
            try {
                const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${dateStr}/`, { cache: 'no-store', redirect: 'follow' });
                const count = res.ok ? (await res.json()).count : 0;
                trend.push({ date: dateStr, count: Number(count || 0) });
            } catch (e) {
                trend.push({ date: dateStr, count: 0 });
            }
        } else {
            trend.push({ date: dateStr, count: dummyCounts[3-i] });
        }
    }
    return trend;
}

(function() {
    const isLoginPage = window.location.href.includes('admin.html');
    if (isLoginPage) return;

    const todayStr = getLocalDateString();
    const sessionKey = `v8_final_visited_${todayStr}`;
    
    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit().then(success => {
            if (success) sessionStorage.setItem(sessionKey, 'true');
        });
    }
})();
