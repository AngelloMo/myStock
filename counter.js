// Counter API logic for visitor tracking
const NAMESPACE = 'mystock-dashboard-2026';

// Helper to get local date in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

async function incrementVisit() {
    const todayStr = getLocalDateString();
    const ts = Date.now();
    
    try {
        console.log('[CounterAPI] Attempting to increment visit for:', todayStr);
        
        // Sequential increment for stability
        // 1. Total Count
        const tRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/up?t=${ts}`);
        if (tRes.ok) {
            const tData = await tRes.json();
            console.log('[CounterAPI] Total incremented:', tData.count);
        }

        // 2. Daily Count
        const dRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/up?t=${ts}`);
        if (dRes.ok) {
            const dData = await dRes.json();
            console.log('[CounterAPI] Daily incremented:', dData.count);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[CounterAPI] Error incrementing visit:', error);
        return false;
    }
}

async function getVisitStats() {
    const todayStr = getLocalDateString();
    const ts = Date.now();
    try {
        const [tRes, dRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total?t=${ts}`),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}?t=${ts}`)
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

        console.log('[CounterAPI] Fetched stats:', { total, daily });
        return { total, daily };
    } catch (error) {
        console.error('[CounterAPI] Error fetching stats:', error);
        return { total: 0, daily: 0 };
    }
}

async function getVisitTrend() {
    const trend = [];
    const today = new Date();
    const ts = Date.now();
    
    // Restoration of dummy data for previous 3 days + today's real data
    const dummyCounts = [124, 156, 189];
    
    for (let i = 3; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        
        if (i === 0) {
            // Real data for today
            try {
                const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${dateStr}?t=${ts}`);
                let count = 0;
                if (res.ok) {
                    const data = await res.json();
                    count = data.count || 0;
                }
                trend.push({ date: dateStr, count: count });
            } catch (e) {
                trend.push({ date: dateStr, count: 0 });
            }
        } else {
            // Restored dummy data
            trend.push({ date: dateStr, count: dummyCounts[3-i] });
        }
    }
    return trend;
}

// Global Execution Hook
(function() {
    const path = window.location.pathname.toLowerCase();
    
    // Do not count visits on the admin page
    if (path.includes('admin.html')) {
        console.log('[CounterAPI] Admin page detected. Skipping increment.');
        return;
    }

    const todayStr = getLocalDateString();
    // v3 key to ensure a fresh session check
    const sessionKey = `v3_visited_${NAMESPACE}_${todayStr}`;
    
    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit().then(success => {
            if (success) {
                sessionStorage.setItem(sessionKey, 'true');
                console.log('[CounterAPI] New session recorded for today.');
            }
        });
    } else {
        console.log('[CounterAPI] Session already recorded for today.');
    }
})();
