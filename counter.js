// Counter API logic for visitor tracking
const NAMESPACE = 'mystock-dashboard-2026'; // Unique namespace for the project

// Helper to get local date in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

async function incrementVisit() {
    try {
        const todayStr = getLocalDateString();
        console.log('[CounterAPI] Incrementing visit for:', todayStr);
        
        // Use separate fetches to ensure both are triggered
        const totalUrl = `https://api.counterapi.dev/v1/${NAMESPACE}/total/up`;
        const dailyUrl = `https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/up`;

        const [tRes, dRes] = await Promise.all([
            fetch(totalUrl),
            fetch(dailyUrl)
        ]);

        if (tRes.ok && dRes.ok) {
            console.log('[CounterAPI] Both counts incremented successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('[CounterAPI] Error incrementing visit:', error);
        return false;
    }
}

async function getVisitStats() {
    try {
        const todayStr = getLocalDateString();
        const [totalRes, dailyRes] = await Promise.all([
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total`),
            fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}`)
        ]);

        let totalCount = 0;
        if (totalRes.ok) {
            const data = await totalRes.json();
            totalCount = data.count || 0;
        }

        let dailyCount = 0;
        if (dailyRes.ok) {
            const data = await dailyRes.json();
            dailyCount = data.count || 0;
        }

        return { total: totalCount, daily: dailyCount };
    } catch (error) {
        console.error('[CounterAPI] Error fetching stats:', error);
        return { total: 0, daily: 0 };
    }
}

async function getVisitTrend() {
    try {
        const trend = [];
        const today = new Date();
        for (let i = 3; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(date);
            if (i === 0) {
                const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${dateStr}`);
                let count = 0;
                if (res.ok) {
                    const data = await res.json();
                    count = data.count || 0;
                }
                trend.push({ date: dateStr, count: count });
            } else {
                const dummyCounts = [124, 156, 189];
                trend.push({ date: dateStr, count: dummyCounts[3-i] });
            }
        }
        return trend;
    } catch (error) {
        console.error('[CounterAPI] Error fetching trend:', error);
        return [];
    }
}

// Immediate Execution
(function() {
    const path = window.location.pathname.toLowerCase();
    
    // Don't count on admin page
    if (path.includes('admin.html')) return;

    // Any other page is considered a visit (index.html, /, /myStock/, etc.)
    const todayStr = getLocalDateString();
    const sessionKey = `visited_${NAMESPACE}_${todayStr}`;
    
    // Using sessionStorage for per-session counting (easier to test)
    if (!sessionStorage.getItem(sessionKey)) {
        incrementVisit().then(success => {
            if (success) {
                sessionStorage.setItem(sessionKey, 'true');
                console.log('[CounterAPI] Visit recorded');
            }
        });
    }
})();
