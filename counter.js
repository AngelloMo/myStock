// Counter API logic for visitor tracking
const NAMESPACE = 'mystock-dashboard-2026'; // Unique namespace for the project

async function incrementVisit() {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Increment Total Count
        await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total/up`);
        // Increment Daily Count
        await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${today}/up`);
    } catch (error) {
        console.error('Error incrementing visit:', error);
    }
}

async function getVisitStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch Total Count
        const totalRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/total`);
        const totalData = await totalRes.json();
        const totalCount = totalData.count || 0;

        // Fetch Daily Count
        let dailyCount = 0;
        try {
            const dailyRes = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/daily_${today}`);
            if (dailyRes.ok) {
                const dailyData = await dailyRes.json();
                dailyCount = dailyData.count || 0;
            }
        } catch (e) {
            // Daily key might not exist yet for today
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

// If this is index.html, increment the visit count
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    // Only count once per session
    if (!sessionStorage.getItem('visited')) {
        incrementVisit();
        sessionStorage.setItem('visited', 'true');
    }
}
