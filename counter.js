// Counter API logic - Ultra Stable Version
const NAMESPACE = 'mystock2026'; // Pure alphanumeric

function getLocalDateString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`; // Format YYYYMMDD (no separators)
}

async function incrementVisit() {
    const todayStr = getLocalDateString();
    const ts = Date.now();
    try {
        console.log('[CounterAPI] Incrementing...');
        
        // Use standard URLs WITHOUT trailing slashes
        // Adding a timestamp as a query param to bypass cache WITHOUT triggering 400
        const totalRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/up?t=${ts}`);
        const dailyRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily${todayStr}/up?t=${ts}`);
        
        if (totalRes.ok) console.log('[CounterAPI] Total OK');
        if (dailyRes.ok) console.log('[CounterAPI] Daily OK');
        
        return true;
    } catch (e) {
        console.warn('[CounterAPI] Increment failed:', e);
        return false;
    }
}

async function getVisitStats() {
    const todayStr = getLocalDateString();
    const ts = Date.now();
    try {
        const [tRes, dRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total?t=${ts}`),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily${todayStr}?t=${ts}`)
        ]);

        let total = 0;
        if (tRes.ok) {
            const data = await tRes.json();
            total = data.count || 0;
        }

        let daily = 0;
        if (dRes.ok) {
            const data = await dRes.json();
            daily = data.count || 0;
        }

        console.log('[CounterAPI] Stats:', { total, daily });
        return { total: Number(total), daily: Number(daily) };
    } catch (e) {
        console.error('[CounterAPI] Fetch error:', e);
        return { total: 0, daily: 0 };
    }
}

async function getVisitTrend() {
    const trend = [];
    const today = new Date();
    const ts = Date.now();
    const dummyCounts = [124, 156, 189]; 
    
    for (let i = 3; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`; // For display
        const apiDateKey = `${y}${m}${d}`; // For API
        
        if (i === 0) {
            try {
                const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily${apiDateKey}?t=${ts}`);
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

// Global Execution
(function() {
    if (window.location.href.includes('admin.html')) return;

    const todayStr = getLocalDateString();
    const sessionKey = `v10_visited_${NAMESPACE}_${todayStr}`;
    
    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit().then(() => {
            sessionStorage.setItem(sessionKey, 'true');
        });
    }
})();
