// Counter API logic - Robust Implementation
const NAMESPACE = 'mystock_final_2026'; // Simple namespace, underscores only

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
        console.log('[CounterAPI] Incrementing...');
        
        // 1. Total Up (Sequential to avoid race conditions/400 errors)
        const tRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/up/`, { cache: 'no-store' });
        if (tRes.ok) console.log('[CounterAPI] Total Up OK');

        // 2. Daily Up
        const dRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/up/`, { cache: 'no-store' });
        if (dRes.ok) console.log('[CounterAPI] Daily Up OK');
        
        return true;
    } catch (e) {
        console.warn('[CounterAPI] Increment skipped/failed:', e);
        return false;
    }
}

async function getVisitStats() {
    const todayStr = getLocalDateString();
    try {
        // Use trailing slashes everywhere to avoid 301/CORS redirects
        const [tRes, dRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/`, { cache: 'no-store' }),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/`, { cache: 'no-store' })
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

        console.log('[CounterAPI] Fetched:', { total, daily });
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
        const dateStr = getLocalDateString(date);
        
        if (i === 0) {
            try {
                // Today's real data
                const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${dateStr}/`, { cache: 'no-store' });
                const count = res.ok ? (await res.json()).count : 0;
                trend.push({ date: dateStr, count: Number(count || 0) });
            } catch (e) {
                trend.push({ date: dateStr, count: 0 });
            }
        } else {
            // Simulated data
            trend.push({ date: dateStr, count: dummyCounts[3-i] });
        }
    }
    return trend;
}

// Global Execution
(function() {
    // Basic guard: don't count admin page
    if (window.location.href.includes('admin.html')) return;

    const todayStr = getLocalDateString();
    const sessionKey = `v_robust_${NAMESPACE}_${todayStr}`;
    
    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit().then(() => {
            sessionStorage.setItem(sessionKey, 'true');
        });
    }
})();
