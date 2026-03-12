// Counter API logic for visitor tracking
const NAMESPACE = 'mystock-final-v7';

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
        const options = { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        };

        const [tRes, dRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/up`, options),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/up`, options)
        ]);
        
        if (tRes.ok && dRes.ok) {
            console.log('[CounterAPI] Increment Success');
            return true;
        }
    } catch (e) {
        console.error('[CounterAPI] Increment error:', e);
    }
    return false;
}

async function getVisitStats() {
    const todayStr = getLocalDateString();
    try {
        const options = { method: 'GET', mode: 'cors', cache: 'no-cache' };
        const [tRes, dRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total`, options),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}`, options)
        ]);

        let total = 0, daily = 0;
        if (tRes.ok) total = (await tRes.json()).count || 0;
        if (dRes.ok) daily = (await dRes.json()).count || 0;

        return { total: Number(total), daily: Number(daily) };
    } catch (e) {
        console.error('[CounterAPI] Fetch error:', e);
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
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        
        if (i === 0) {
            try {
                const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${dateStr}`, { cache: 'no-cache' });
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
    if (window.location.href.includes('admin.html')) return;

    const todayStr = getLocalDateString();
    const sessionKey = `v7_visited_${todayStr}`;
    
    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit().then(success => {
            if (success) sessionStorage.setItem(sessionKey, 'true');
        });
    }
})();
