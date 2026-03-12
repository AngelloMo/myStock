// Counter API logic for visitor tracking
const NAMESPACE = 'mystock-dashboard-2026'; // Unique namespace for the project

// Helper to get local date in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
}

async function incrementVisit() {
    try {
        const todayStr = getLocalDateString();
        console.log('Incrementing visit for:', todayStr);
        // Increment Total Count
        await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/up`);
        // Increment Daily Count
        await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}/up`);
    } catch (error) {
        console.error('Error incrementing visit:', error);
    }
}

async function getVisitStats() {
    try {
        const todayStr = getLocalDateString();
        console.log('Fetching stats for:', todayStr);
        
        // Fetch Total Count
        const totalRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total`);
        const totalData = await totalRes.json();
        const totalCount = totalData.count || 0;

        // Fetch Daily Count
        let dailyCount = 0;
        try {
            const dailyRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${todayStr}`);
            if (dailyRes.ok) {
                const dailyData = await dailyRes.json();
                dailyCount = dailyData.count || 0;
            }
        } catch (e) {
            console.warn('Daily count fetch failed (might not exist yet):', e);
            dailyCount = 0;
        }

        return {
            total: totalCount,
            daily: dailyCount
        };
    } catch (error) {
        console.error('Error fetching visit stats:', error);
        return { total: 'N/A', daily: 'N/A' };
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
                // Real data for today
                try {
                    const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${dateStr}`);
                    if (res.ok) {
                        const data = await res.json();
                        trend.push({ date: dateStr, count: data.count || 0 });
                    } else {
                        trend.push({ date: dateStr, count: 0 });
                    }
                } catch (e) {
                    trend.push({ date: dateStr, count: 0 });
                }
            } else {
                // Dummy data for previous 3 days
                const dummyCounts = [124, 156, 189];
                trend.push({ date: dateStr, count: dummyCounts[3-i] });
            }
        }
        return trend;
    } catch (error) {
        console.error('Error fetching visit trend:', error);
        return [];
    }
}

// Logic to run on page load
(function() {
    const path = window.location.pathname;
    const isMainPage = path.endsWith('index.html') || path === '/' || path.endsWith('/') || path === '/mystock/' || path.endsWith('/index.html');
    
    if (isMainPage) {
        if (!sessionStorage.getItem('visited')) {
            incrementVisit();
            sessionStorage.setItem('visited', 'true');
        }
    }
})();
