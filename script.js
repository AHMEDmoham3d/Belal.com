// المتغيرات العامة
let currentUser = null;
let currentUserType = null; // 'player' أو 'coach'
let currentChatUserId = null;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // التحقق من وجود رابط المدرب في URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const accessParam = urlParams.get('access');
    
    if (adminParam === systemData.coach.id && accessParam === 'full') {
        showCoachLogin();
        return;
    }
    
    // إعداد أحداث تسجيل الدخول
    setupLoginEvents();
    
    // إعداد النوافذ المنبثقة
    setupModals();
    
    // إعداد التصفح في صفحة المدرب
    setupCoachNavigation();
    
    // تحديث البيانات عند تحميل الصفحة
    updatePlayerRanks();
}

function setupLoginEvents() {
    const loginForm = document.getElementById('loginForm');
    const adminLink = document.getElementById('adminLink');
    
    loginForm.addEventListener('submit', handleLogin);
    adminLink.addEventListener('click', handleAdminClick);
}

function handleLogin(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value.trim();
    
    if (!userId) {
        showError('يرجى إدخال رقم الهوية');
        return;
    }
    
    // التحقق من وجود اللاعب
    const player = getPlayerById(userId);
    
    if (!player) {
        showError('رقم الهوية غير صحيح أو غير مسجل');
        shakeElement(document.getElementById('userId'));
        return;
    }
    
    if (player.isBlocked) {
        showError('تم حظر هذا الحساب. يرجى التواصل مع المدرب');
        return;
    }
    
    // تسجيل دخول ناجح
    currentUser = player;
    currentUserType = 'player';
    
    showPlayerDashboard();
}

function handleAdminClick(e) {
    e.preventDefault();
    
    const coachId = prompt('أدخل رقم هوية المدرب:');
    
    if (coachId === systemData.coach.id) {
        currentUser = systemData.coach;
        currentUserType = 'coach';
        showCoachDashboard();
    } else {
        showError('رقم هوية المدرب غير صحيح');
    }
}

function showCoachLogin() {
    const coachId = prompt('مرحباً بك في لوحة التحكم\nأدخل رقم هوية المدرب للتأكيد:');
    
    if (coachId === systemData.coach.id) {
        currentUser = systemData.coach;
        currentUserType = 'coach';
        showCoachDashboard();
    } else {
        showError('رقم هوية المدرب غير صحيح');
        window.location.href = window.location.pathname;
    }
}

function showPlayerDashboard() {
    hideAllPages();
    document.getElementById('playerPage').classList.add('active');
    
    // تحديث معلومات اللاعب
    updatePlayerInfo();
    
    // تحديث المحتوى
    updateChampionInfo();
    updateRankings();
    updatePlayerMessages();
    updatePlayerPosts();
}

function showCoachDashboard() {
    hideAllPages();
    document.getElementById('coachPage').classList.add('active');
    
    // إظهار قسم اللاعبين بشكل افتراضي
    showSection('players');
    
    // تحديث المحتوى
    updatePlayersGrid();
    updateCoachPosts();
    updatePlayersForChat();
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

function updatePlayerInfo() {
    if (!currentUser || currentUserType !== 'player') return;
    
    document.getElementById('playerName').textContent = `مرحباً، ${currentUser.name}`;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRank').textContent = `المرتبة: #${currentUser.rank}`;
    document.getElementById('profilePoints').textContent = currentUser.points;
    document.getElementById('profileAbsences').textContent = currentUser.absences;
}

function updateChampionInfo() {
    const championInfo = document.getElementById('championInfo');
    const championName = document.getElementById('championName');
    
    if (systemData.championOfWeek && systemData.championOfWeek.playerId) {
        const champion = getPlayerById(systemData.championOfWeek.playerId);
        if (champion) {
            championName.textContent = champion.name;
            
            // إضافة تأثير خاص إذا كان اللاعب الحالي هو البطل
            if (currentUser && currentUser.id === champion.id) {
                championInfo.style.border = '3px solid #FFD700';
                championInfo.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
                championInfo.style.color = 'white';
            }
        }
    } else {
        championName.textContent = 'لم يتم الإعلان بعد';
    }
}

function updateRankings() {
    const rankingsList = document.getElementById('rankingsList');
    
    // ترتيب اللاعبين حسب الترتيب
    const sortedPlayers = [...systemData.players]
        .filter(player => !player.isBlocked)
        .sort((a, b) => a.rank - b.rank);
    
    rankingsList.innerHTML = '';
    
    sortedPlayers.forEach((player, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        // إضافة تأثير خاص للاعب الحالي
        if (currentUser && currentUser.id === player.id) {
            rankingItem.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
            rankingItem.style.color = 'white';
        }
        
        rankingItem.innerHTML = `
            <div class="ranking-position">${index + 1}</div>
            <div class="ranking-info">
                <div class="ranking-name">${player.name}</div>
                <div class="ranking-points">${player.points} نقطة - ${player.absences} غياب</div>
            </div>
        `;
        
        rankingsList.appendChild(rankingItem);
    });
}

function updatePlayerMessages() {
    if (!currentUser || currentUserType !== 'player') return;
    
    const messagesList = document.getElementById('messagesList');
    const messages = getChatMessages(systemData.coach.id, currentUser.id);
    
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="no-messages">لا توجد رسائل</div>';
        return;
    }
    
    // إظهار آخر 3 رسائل فقط
    const recentMessages = messages.slice(-3);
    
    recentMessages.forEach(message => {
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        
        const messageTime = new Date(message.timestamp).toLocaleString('ar-EG');
        
        messageItem.innerHTML = `
            <div class="message-sender">${message.senderName}</div>
            <div class="message-content">${message.content}</div>
            <div class="message-time">${messageTime}</div>
        `;
        
        messagesList.appendChild(messageItem);
    });
}

function updatePlayerPosts() {
    const postsList = document.getElementById('postsList');
    
    postsList.innerHTML = '';
    
    systemData.posts.forEach(post => {
        const postItem = createPostElement(post);
        postsList.appendChild(postItem);
    });
}

function createPostElement(post) {
    const postItem = document.createElement('div');
    postItem.className = 'post-item';
    
    const postTime = new Date(post.timestamp).toLocaleString('ar-EG');
    const isLiked = currentUser && post.likes.includes(currentUser.id);
    
    let mediaHTML = '';
    if (post.mediaUrl) {
        switch (post.mediaType) {
            case 'image':
                mediaHTML = `<img src="${post.mediaUrl}" alt="صورة المنشور" class="post-media">`;
                break;
            case 'video':
                mediaHTML = `<video controls class="post-media"><source src="${post.mediaUrl}"></video>`;
                break;
            case 'audio':
                mediaHTML = `<audio controls class="post-media"><source src="${post.mediaUrl}"></audio>`;
                break;
            case 'youtube':
                const videoId = extractYouTubeId(post.mediaUrl);
                if (videoId) {
                    mediaHTML = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="post-media"></iframe>`;
                }
                break;
        }
    }
    
    postItem.innerHTML = `
        <div class="post-header">
            <div class="post-author">${post.authorName}</div>
            <div class="post-time">${postTime}</div>
        </div>
        <div class="post-content">${post.content}</div>
        ${mediaHTML}
        <div class="post-actions">
            <button class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes.length}</span>
            </button>
            <button class="post-action" onclick="showComments('${post.id}')">
                <i class="fas fa-comment"></i>
                <span>${post.comments.length}</span>
            </button>
        </div>
    `;
    
    return postItem;
}

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function toggleLike(postId) {
    if (!currentUser) return;
    
    const result = togglePostLike(postId, currentUser.id);
    if (result.success) {
        updatePlayerPosts();
        if (currentUserType === 'coach') {
            updateCoachPosts();
        }
    }
}

function showComments(postId) {
    // يمكن إضافة نافذة منبثقة للتعليقات لاحقاً
    alert('ميزة التعليقات ستكون متاحة قريباً');
}

// إدارة اللاعبين (المدرب)
function updatePlayersGrid() {
    const playersGrid = document.getElementById('playersGrid');
    
    playersGrid.innerHTML = '';
    
    systemData.players.forEach(player => {
        const playerCard = createPlayerCard(player);
        playersGrid.appendChild(playerCard);
    });
}

function createPlayerCard(player) {
    const playerCard = document.createElement('div');
    playerCard.className = `player-card ${player.isBlocked ? 'blocked' : ''}`;
    
    const joinDate = new Date(player.joinDate).toLocaleDateString('ar-EG');
    
    playerCard.innerHTML = `
        <div class="player-info">
            <div class="player-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="player-name">${player.name}</div>
            <div class="player-id">ID: ${player.id}</div>
        </div>
        
        <div class="player-stats">
            <div class="player-stat">
                <span class="stat-value">${player.points}</span>
                <span class="stat-label">النقاط</span>
            </div>
            <div class="player-stat">
                <span class="stat-value">${player.absences}</span>
                <span class="stat-label">الغيابات</span>
            </div>
            <div class="player-stat">
                <span class="stat-value">#${player.rank}</span>
                <span class="stat-label">الترتيب</span>
            </div>
        </div>
        
        <div class="player-actions">
            <button class="action-btn points-btn" onclick="updatePoints('${player.id}', 5)" title="إضافة 5 نقاط">
                <i class="fas fa-plus"></i> نقاط
            </button>
            <button class="action-btn points-btn" onclick="updatePoints('${player.id}', -5)" title="خصم 5 نقاط">
                <i class="fas fa-minus"></i> نقاط
            </button>
            <button class="action-btn absence-btn" onclick="updateAbsences('${player.id}', 1)" title="إضافة غياب">
                <i class="fas fa-plus"></i> غياب
            </button>
            <button class="action-btn champion-btn" onclick="setChampion('${player.id}')" title="تعيين بطل الأسبوع">
                <i class="fas fa-crown"></i> بطل
            </button>
            <button class="action-btn chat-btn-small" onclick="openPlayerChat('${player.id}')" title="إرسال رسالة">
                <i class="fas fa-comment"></i>
            </button>
            <button class="action-btn block-btn" onclick="toggleBlock('${player.id}')" title="${player.isBlocked ? 'إلغاء الحظر' : 'حظر'}">
                <i class="fas fa-${player.isBlocked ? 'unlock' : 'ban'}"></i>
            </button>
        </div>
    `;
    
    if (player.isBlocked) {
        playerCard.style.opacity = '0.6';
        playerCard.style.filter = 'grayscale(50%)';
    }
    
    return playerCard;
}

function updatePoints(playerId, change) {
    const result = updatePlayerPoints(playerId, change);
    if (result.success) {
        showSuccess(result.message);
        updatePlayersGrid();
        // تحديث الترتيب في صفحة اللاعب إذا كانت مفتوحة
        updateRankings();
    } else {
        showError(result.message);
    }
}

function updateAbsences(playerId, change) {
    const result = updatePlayerAbsences(playerId, change);
    if (result.success) {
        showSuccess(result.message);
        updatePlayersGrid();
        updateRankings();
    } else {
        showError(result.message);
    }
}

function setChampion(playerId) {
    const result = setChampionOfWeek(playerId);
    if (result.success) {
        showSuccess(result.message);
        updateChampionInfo();
    } else {
        showError(result.message);
    }
}

function toggleBlock(playerId) {
    const result = togglePlayerBlock(playerId);
    if (result.success) {
        showSuccess(result.message);
        updatePlayersGrid();
    } else {
        showError(result.message);
    }
}

// النوافذ المنبثقة
function setupModals() {
    const modalOverlay = document.getElementById('modalOverlay');
    const addPlayerForm = document.getElementById('addPlayerForm');
    const addPostForm = document.getElementById('addPostForm');
    
    // إغلاق النافذة عند النقر على الخلفية
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // نموذج إضافة لاعب
    addPlayerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('playerNameInput').value.trim();
        const id = document.getElementById('playerIdInput').value.trim();
        
        if (!name || !id) {
            showError('يرجى ملء جميع الحقول');
            return;
        }
        
        const result = addPlayer(name, id);
        if (result.success) {
            showSuccess(result.message);
            closeModal();
            updatePlayersGrid();
            addPlayerForm.reset();
        } else {
            showError(result.message);
        }
    });
    
    // نموذج إضافة منشور
    addPostForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddPost();
    });
}

function showAddPlayerModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addPlayerModal').style.display = 'block';
    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('chatModal').style.display = 'none';
}

function showAddPostModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addPlayerModal').style.display = 'none';
    document.getElementById('addPostModal').style.display = 'block';
    document.getElementById('chatModal').style.display = 'none';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    setTimeout(() => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }, 300);
}

function handleAddPost() {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content) {
        showError('يرجى كتابة محتوى المنشور');
        return;
    }
    
    let mediaType = null;
    let mediaUrl = null;
    
    // التحقق من الوسائط
    const imageInput = document.getElementById('imageInput');
    const videoInput = document.getElementById('videoInput');
    const audioInput = document.getElementById('audioInput');
    const youtubeInput = document.getElementById('youtubeInput');
    
    if (imageInput.files[0]) {
        mediaType = 'image';
        mediaUrl = URL.createObjectURL(imageInput.files[0]);
    } else if (videoInput.files[0]) {
        mediaType = 'video';
        mediaUrl = URL.createObjectURL(videoInput.files[0]);
    } else if (audioInput.files[0]) {
        mediaType = 'audio';
        mediaUrl = URL.createObjectURL(audioInput.files[0]);
    } else if (youtubeInput.value.trim()) {
        mediaType = 'youtube';
        mediaUrl = youtubeInput.value.trim();
    }
    
    const result = addPost(currentUser.id, currentUser.name, content, mediaType, mediaUrl);
    
    if (result.success) {
        showSuccess(result.message);
        closeModal();
        updatePlayerPosts();
        updateCoachPosts();
        document.getElementById('addPostForm').reset();
        
        // إخفاء حقل يوتيوب
        youtubeInput.style.display = 'none';
    } else {
        showError(result.message);
    }
}

// التنقل في صفحة المدرب
function setupCoachNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(section);
        });
    });
}

function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.coach-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الحالة النشطة من جميع الأزرار
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // تفعيل الزر المناسب
    const targetButton = document.querySelector(`[onclick*="${sectionName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // تحديث المحتوى حسب القسم
    switch (sectionName) {
        case 'players':
            updatePlayersGrid();
            break;
        case 'posts':
            updateCoachPosts();
            break;
        case 'messages':
            updatePlayersForChat();
            break;
    }
}

function updateCoachPosts() {
    const coachPostsList = document.getElementById('coachPostsList');
    
    coachPostsList.innerHTML = '';
    
    systemData.posts.forEach(post => {
        const postItem = createPostElement(post);
        coachPostsList.appendChild(postItem);
    });
}

// نظام المراسلة
function updatePlayersForChat() {
    const playersForChat = document.getElementById('playersForChat');
    
    playersForChat.innerHTML = '';
    
    systemData.players.filter(player => !player.isBlocked).forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'chat-player-item';
        playerItem.onclick = () => openPlayerChat(player.id);
        
        playerItem.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${player.name}</span>
        `;
        
        playersForChat.appendChild(playerItem);
    });
}

function openPlayerChat(playerId) {
    currentChatUserId = playerId;
    const player = getPlayerById(playerId);
    
    if (!player) return;
    
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addPlayerModal').style.display = 'none';
    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('chatModal').style.display = 'block';
    
    document.getElementById('chatTitle').innerHTML = `<i class="fas fa-comments"></i> محادثة مع ${player.name}`;
    
    updateChatMessages();
}

function openChat() {
    if (currentUserType !== 'player') return;
    
    currentChatUserId = systemData.coach.id;
    
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addPlayerModal').style.display = 'none';
    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('chatModal').style.display = 'block';
    
    document.getElementById('chatTitle').innerHTML = `<i class="fas fa-comments"></i> محادثة مع ${systemData.coach.name}`;
    
    updateChatMessages();
}

function updateChatMessages() {
    if (!currentChatUserId) return;
    
    const chatMessages = document.getElementById('chatMessages');
    const messages = getChatMessages(currentUser.id, currentChatUserId);
    
    chatMessages.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.senderId === currentUser.id ? 'own' : ''}`;
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${message.content}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
    });
    
    // التمرير إلى أسفل
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentChatUserId) return;
    
    const result = sendMessage(currentUser.id, currentUser.name, currentChatUserId, content);
    
    if (result.success) {
        messageInput.value = '';
        updateChatMessages();
        
        // تحديث الرسائل في لوحة اللاعب إذا كانت مفتوحة
        if (currentUserType === 'player') {
            updatePlayerMessages();
        }
    }
}

// التعامل مع Enter في حقل الرسالة
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'messageInput') {
        sendMessage();
    }
});

// وظائف تسجيل الخروج والمساعدة
function logout() {
    currentUser = null;
    currentUserType = null;
    currentChatUserId = null;
    
    hideAllPages();
    document.getElementById('loginPage').classList.add('active');
    
    // إعادة تعيين النماذج
    document.getElementById('loginForm').reset();
    
    // إزالة معاملات URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

function showSuccess(message) {
    // يمكن إضافة نظام إشعارات أفضل لاحقاً
    alert('✅ ' + message);
}

function showError(message) {
    // يمكن إضافة نظام إشعارات أفضل لاحقاً
    alert('❌ ' + message);
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}