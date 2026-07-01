// =========================================================================
// 🌐 ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ STATE & GLOBAL VARIABLES
// =========================================================================
let selectedGame = '';
let selectedDiamond = '';
let selectedPrice = '';
let checkStatusInterval = null;
const API_URL = "http://localhost:3000";
let isVerified = false;
let verifiedPlayerId = '';
let verifiedZoneId = '';

// 📦 ឃ្លាំងផ្ទុកទិន្នន័យប្ដូរតាមប្រភេទហ្គេម
const gameDatabase = {
    "Mobile Legends": {
        inputs: `
            <input type="number" id="playerId" placeholder="បញ្ចូល Player ID" class="input-field">
            <input type="number" id="zoneId" placeholder="Zone ID" class="input-field" style="margin-top: 12px;">`,
        items: [
            { id: "mlbb_86", qty: "💎 86 Diamonds", price: "$1.50" },
            { id: "mlbb_257", qty: "💎 257 Diamonds", price: "$4.30" },
            { id: "mlbb_706", qty: "💎 706 Diamonds", price: "$11.50" },
            { id: "mlbb_1412", qty: "💎 1412 Diamonds", price: "$22.00" }
        ]
    },
    "PUBG Mobile": {
        inputs: `<input type="number" id="playerId" placeholder="បញ្ចូល Character ID" class="input-field">`,
        items: [
            { id: "pubg_60", qty: "💵 60 UC", price: "$0.99" },
            { id: "pubg_325", qty: "💵 325 UC", price: "$4.99" },
            { id: "pubg_660", qty: "💵 660 UC", price: "$9.99" },
            { id: "pubg_1800", qty: "💵 1800 UC", price: "$24.99" }
        ]
    },
    "Free Fire": {
        inputs: `<input type="number" id="playerId" placeholder="បញ្ចូល Player ID (Free Fire)" class="input-field">`,
        items: [
            { id: "ff_100", qty: "💎 100 Diamonds", price: "$1.00" },
            { id: "ff_210", qty: "💎 210 Diamonds", price: "$2.00" },
            { id: "ff_530", qty: "💎 530 Diamonds", price: "$5.00" },
            { id: "ff_1080", qty: "💎 1080 Diamonds", price: "$10.00" }
        ]
    }
};

// 🔐 មុខងារជំនួយសម្រាប់លាក់រាល់ទំព័រទាំងអស់ (បានកែសម្រួល ID ឱ្យត្រូវនឹង HTML)
function hideAllPages() {
    const pages = ['homePage', 'topupPage', 'profilePage', 'promotionPage', 'gamesPage', 'ordersPage', 'accountInfoPage', 'promoCodesPage'];
    pages.forEach(pageId => {
        const el = document.getElementById(pageId);
        if (el) el.style.display = 'none';
    });
}

// 🔄 ១. មុខងារបើកទំព័រ Top-up ឌីណាមិក
function openTopUp(gameName) {
    const gameBanners = {
        'Mobile Legends': 'ml-banner.jpg',     
        'Free Fire': 'ff-banner.jpg',           
        'PUBG Mobile': 'pubg-banner.jpg',       
        'Call of Duty': 'cod-banner.jpg',       
        'Where Winds Meet': 'wwm-banner.jpg', 
        'Valorant': 'valorant-banner.jpg',     
        'Blood Strike': 'blood-banner.jpg',
        'Honor of Kings': 'honor-banner.jpg'
    };

    const bannerElement = document.getElementById('topupGameBanner');
    if (bannerElement) {
        bannerElement.src = gameBanners[gameName] || 'banner1.png';
    }

    selectedGame = gameName;
    const titleEl = document.getElementById('currentGameName');
    if (titleEl) titleEl.textContent = gameName;
    
    hideAllPages();
    const topupPage = document.getElementById('topupPage');
    if (topupPage) topupPage.style.display = 'block';
    
    const game = gameDatabase[gameName] || {
        inputs: `<input type="number" id="playerId" placeholder="បញ្ចូល Player ID" class="input-field">`,
        items: [
            { id: "gen_1", qty: "📦 កញ្ចប់ធម្មតាទី១", price: "$1.00" },
            { id: "gen_2", qty: "📦 កញ្ចប់ធម្មតាទី២", price: "$5.00" }
        ]
    };

    const dynInputs = document.getElementById('dynamic-inputs');
    if (dynInputs) dynInputs.innerHTML = game.inputs;

    let itemsHTML = '';
    game.items.forEach(item => {
        itemsHTML += `
            <div class="diamond-item" onclick="selectDiamond(this, '${item.qty}', '${item.price}')">
                <h4>${item.qty}</h4>
                <p style="color:#0ea5e9; font-weight:bold; margin-top:5px;">${item.price}</p>
            </div>`;
    });
    
    const dynItems = document.getElementById('dynamic-items');
    if (dynItems) dynItems.innerHTML = itemsHTML;

    selectedDiamond = '';
    selectedPrice = '';
    isVerified = false;
    verifiedPlayerId = '';
    verifiedZoneId = '';
    
    if(document.getElementById('displayTotalPrice')) document.getElementById('displayTotalPrice').textContent = '$0.00';
    if(document.getElementById('displaySelectedProduct')) document.getElementById('displaySelectedProduct').textContent = '-';
    if(document.getElementById('verify-result')) document.getElementById('verify-result').style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 💎 ២. មុខងារបញ្ជាពេលចុចលើកាតតម្លៃពេជ្រ
function selectDiamond(element, diamondName, price) {
    document.querySelectorAll('.diamond-item').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    selectedDiamond = diamondName;
    selectedPrice = price;

    if(document.getElementById('displayTotalPrice')) document.getElementById('displayTotalPrice').textContent = price;
    if(document.getElementById('displaySelectedProduct')) document.getElementById('displaySelectedProduct').textContent = diamondName;
}

// 🔙 ៣. មុខងារបិទទំព័រត្រឡប់ទៅក្រោយវិញ
function closeTopUp() {
    hideAllPages();
    if(document.getElementById('homePage')) document.getElementById('homePage').style.display = 'block';
    loadOrderHistory();
}

// 📋 មុខងារបើកមើលប្រវត្តិទិញដូរ (ដោះស្រាយបញ្ហាគាំងប៊ូតុងនៅលើ HTML)
function openOrders() {
    hideAllPages();
    const ordersPage = document.getElementById('ordersPage');
    if (ordersPage) ordersPage.style.display = 'block';
    loadOrderHistory();
}

function returnToProfile() {
    hideAllPages();
    const profilePage = document.getElementById('profilePage');
    if (profilePage) profilePage.style.display = 'block';
}

// 📋 មុខងារទាញយកប្រវត្តិនៃការកុម្មង់
async function loadOrderHistory() {
    const tbody = document.getElementById('orderHistory') || document.getElementById('orderList');
    if (!tbody) return; 
    try {
        const res = await fetch(`${API_URL}/api/orders`);
        const orders = await res.json();
        tbody.innerHTML = '';
        orders.reverse().slice(0, 5).forEach(order => {
            const div = document.createElement('div');
            div.style = "background:#111a2e; padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;";
            div.innerHTML = `
                <p style="margin:0; color:#fff;"><strong>ហ្គេម៖</strong> ${order.game}</p>
                <p style="margin:5px 0; color:#9ca3af;"><strong>ID៖</strong> ${order.playerId}</p>
                <p style="margin:0; color:#00e1ff;"><strong>តម្លៃ៖</strong> ${order.price} | <span class="status-${order.status.toLowerCase()}">${order.status}</span></p>
            `;
            tbody.appendChild(div);
        });
    } catch (e) {
        tbody.innerHTML = `<p style="text-align:center; color:#9ca3af; padding:20px;">មិនទាន់មានប្រវត្តិកុម្មង់នៅឡើយទេ</p>`;
    }
}

// =========================================================================
// 🌐 ដំណើរការប្រព័ន្ធរួមពេល Web ដើរពេញលេញ (CORE RUNTIME)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadOrderHistory();
    resetSliderTimer();
    startFlashSaleTimer();

    // 🔍 មុខងារស្វែងរកហ្គេម
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const gameCards = document.querySelectorAll('.game-card');
            gameCards.forEach(card => {
                const gameName = card.querySelector('span').innerText.toLowerCase();
                card.style.display = gameName.includes(keyword) ? 'flex' : 'none';
            });
        });
    }

    // ៤. មុខងារចុចប៊ូតុង ពិនិត្យឈ្មោះគណនី
    const btnVerify = document.getElementById('btnVerify');
    if (btnVerify) {
        btnVerify.addEventListener('click', async () => {
            const playerIdInput = document.getElementById('playerId');
            const zoneIdInput = document.getElementById('zoneId');
            const playerId = playerIdInput ? playerIdInput.value.trim() : '';
            const zoneId = zoneIdInput ? zoneIdInput.value.trim() : '';

            if (!playerId) return alert('សូមបញ្ចូលលេខសម្គាល់គណនី (Player ID) ជាមុនសិន!');
            if (selectedGame === 'Mobile Legends' && !zoneId) return alert('សូមបញ្ចូលលេខតំបន់ (Zone ID) របស់ Mobile Legends!');

            btnVerify.disabled = true;
            btnVerify.innerHTML = '⏳ កំពុងពិនិត្យ...';

            try {
                const res = await fetch(`${API_URL}/api/games/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ game: selectedGame, playerId, zoneId })
                });
                const data = await res.json();
                if (data.success) {
                    document.getElementById('verifiedNickname').textContent = data.nickname;
                    document.getElementById('verify-result').style.display = 'block';
                    isVerified = true; verifiedPlayerId = playerId; verifiedZoneId = zoneId;
                } else {
                    alert(data.message || 'រកមិនឃើញគណនីទេ!');
                    isVerified = false;
                }
            } catch (error) {
                if(document.getElementById('verifiedNickname')) document.getElementById('verifiedNickname').textContent = "FONG USER_TEST";
                if(document.getElementById('verify-result')) document.getElementById('verify-result').style.display = 'block';
                isVerified = true; verifiedPlayerId = playerId; verifiedZoneId = zoneId;
            } finally {
                btnVerify.disabled = false;
                btnVerify.innerHTML = '<i class="fa fa-search"></i> ពិនិត្យឈ្មោះគណនី (Verify Name)';
            }
        });
    }

    // ៥. ប៊ូតុងរបារខាងក្រោម (Bottom Navigation)
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            const txt = item.querySelector('span').innerText.trim();
            hideAllPages();
            
            if (txt === 'Home') document.getElementById('homePage').style.display = 'block';
            else if (txt === 'Promotion') document.getElementById('promotionPage').style.display = 'block';
            else if (txt === 'Games') document.getElementById('gamesPage').style.display = 'block';
            else if (txt === 'Order') { document.getElementById('ordersPage').style.display = 'block'; loadOrderHistory(); }
            else if (txt === 'Profile') document.getElementById('profilePage').style.display = 'block';
        });
    });

    // ៦. ចុចប៊ូតុងបញ្ជាទិញ (Submit Order)
    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            const playerIdInput = document.getElementById('playerId');
            const zoneIdInput = document.getElementById('zoneId');
            const playerId = playerIdInput ? playerIdInput.value.trim() : '';
            const zoneId = zoneIdInput ? zoneIdInput.value.trim() : '';

            if (!isVerified || playerId !== verifiedPlayerId || zoneId !== verifiedZoneId) {
                return alert('សូមចុចប៊ូតុង "ពិនិត្យឈ្មោះគណនី" ដើម្បីផ្ទៀងផ្ទាត់ឈ្មោះជាមុនសិន!');
            }
            if (!selectedDiamond) return alert('សូមជ្រើសរើសកញ្ចប់ពេជ្រដែលចង់បាន!');

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '⏳ កំពុងបង្កើតការកុម្មង់...';

            try {
                const res = await fetch(`${API_URL}/api/orders/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ game: selectedGame, playerId, zoneId: selectedGame === 'Mobile Legends' ? zoneId : '', diamond: selectedDiamond, price: selectedPrice })
                });
                const data = await res.json();
                if (data.success) {
                    openPaymentModal(data.order.game, data.order.diamond, data.order.price, data.order.id);
                }
            } catch (error) {
                openPaymentModal(selectedGame, selectedDiamond, selectedPrice, 999);
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa-solid fa-wallet"></i> Pay Now';
            }
        });
    }

    function openPaymentModal(game, diamond, price, id) {
        if(document.getElementById('modalGame')) document.getElementById('modalGame').textContent = game;
        if(document.getElementById('modalDiamond')) document.getElementById('modalDiamond').textContent = diamond;
        if(document.getElementById('modalPrice')) document.getElementById('modalPrice').textContent = price;
        if(document.getElementById('paymentModal')) document.getElementById('paymentModal').style.display = 'flex';
        startPollingStatus(id);
    }

    // ៧. ឆែកមើលស្ថានភាពលុយ (Polling)
    function startPollingStatus(orderId) {
        if (checkStatusInterval) clearInterval(checkStatusInterval);
        const btnConfirm = document.getElementById('btnConfirmPayment');
        
        checkStatusInterval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders/status/${orderId}`);
                const data = await res.json();
                if (!btnConfirm) return;
                
                if (data.status === 'Pending') btnConfirm.innerText = '⏳ រង់ចាំការស្កែនទូទាត់ប្រាក់...';
                else if (data.status === 'Processing') { btnConfirm.innerText = '🤖 ទទួលបានលុយហើយ! កំពុងបុកហ្គេម...'; btnConfirm.style.backgroundColor = '#fbbf24'; }
                else if (data.status === 'Completed') {
                    clearInterval(checkStatusInterval);
                    btnConfirm.innerText = '✅ បុកហ្គេមជោគជ័យពេញលេញ!'; btnConfirm.style.backgroundColor = '#10b981';
                    setTimeout(() => { if(document.getElementById('paymentModal')) document.getElementById('paymentModal').style.display = 'none'; closeTopUp(); }, 1500);
                }
            } catch (err) { 
                if (!btnConfirm) return;
                setTimeout(() => { btnConfirm.innerText = '🤖 កំពុងបុកហ្គេម (Test)...'; btnConfirm.style.backgroundColor = '#fbbf24'; }, 2000);
                setTimeout(() => { clearInterval(checkStatusInterval); btnConfirm.innerText = '✅ ជោគជ័យ!'; btnConfirm.style.backgroundColor = '#10b981'; }, 4000);
                setTimeout(() => { if(document.getElementById('paymentModal')) document.getElementById('paymentModal').style.display = 'none'; closeTopUp(); }, 5500);
            }
        }, 2000);
    }

    // ៩. បិទ Modal ទូទាត់ប្រាក់
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if(document.getElementById('paymentModal')) document.getElementById('paymentModal').style.display = 'none';
            if (checkStatusInterval) clearInterval(checkStatusInterval);
        });
    }
});

// =========================================================================
// 🎠 ប្រព័ន្ធបញ្ជា BANNER SLIDER
// =========================================================================
let currentSlideIndex = 0;
let slideIntervalTimer;

function showBannerSlides(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dots .dot');
    if (slides.length === 0) return; 
    if (index >= slides.length) { currentSlideIndex = 0; }
    else if (index < 0) { currentSlideIndex = slides.length - 1; }
    else { currentSlideIndex = index; }
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    if (slides[currentSlideIndex]) slides[currentSlideIndex].classList.add('active');
    if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add('active');
}

function nextBannerSlide() { currentSlideIndex++; showBannerSlides(currentSlideIndex); }
function currentSlide(index) { currentSlideIndex = index; showBannerSlides(currentSlideIndex); resetSliderTimer(); }
function resetSliderTimer() { clearInterval(slideIntervalTimer); slideIntervalTimer = setInterval(nextBannerSlide, 4000); }

// =========================================================================
// ⏰ ប្រព័ន្ធរាប់ថយក្រោយ FLASH SALE
// =========================================================================
const COUNTDOWN_DURATION = 12600; 
let timeLeft = COUNTDOWN_DURATION;

function startFlashSaleTimer() {
    const hoursEl = document.getElementById('flash-hours');
    const minutesEl = document.getElementById('flash-minutes'); 
    const secondsEl = document.getElementById('flash-seconds');
    if (!hoursEl || !minutesEl || !secondsEl) return;

    setInterval(() => {
        let hrs = Math.floor(timeLeft / 3600);
        let mins = Math.floor((timeLeft % 3600) / 60);
        let secs = timeLeft % 60;
        hoursEl.textContent = hrs < 10 ? '0' + hrs : hrs;
        minutesEl.textContent = mins < 10 ? '0' + mins : mins;
        secondsEl.textContent = secs < 10 ? '0' + secs : secs;
        if (timeLeft === 0) timeLeft = COUNTDOWN_DURATION; else timeLeft--;
    }, 1000);
}
