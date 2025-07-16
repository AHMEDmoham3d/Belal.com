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
    
    if (adminParam === 'BelalMphamed' && accessParam === 'full') {
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
    
    // إعداد نافذة تسجيل دخول المدرب
    setupCoachLoginModal();
}

function setupCoachLoginModal() {
    // إنشاء نافذة تسجيل دخول المدرب
    const coachLoginModal = document.createElement('div');
    coachLoginModal.id = 'coachLoginModal';
    coachLoginModal.className = 'modal-overlay';
    coachLoginModal.innerHTML = `
        <div class="modal coach-login-modal">
            <div class="modal-header">
                <h3><i class="fas fa-shield-alt"></i> تسجيل دخول المدرب</h3>
                <button class="close-btn" onclick="closeCoachLoginModal()">&times;</button>
            </div>
            <div class="modal-form">
                <div class="coach-login-content">
                    <div class="coach-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <h4>مرحباً بك في لوحة التحكم</h4>
                    <p>يرجى إدخال رقم هوية المدرب للمتابعة</p>
                    
                    <form id="coachLoginForm">
                        <div class="form-group">
                            <label for="coachIdInput">رقم هوية المدرب</label>
                            <input type="text" id="coachIdInput" placeholder="BelalMphamed" required>
                            <i class="fas fa-id-card form-icon"></i>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="primary-btn">
                                <i class="fas fa-sign-in-alt"></i>
                                دخول
                            </button>
                            <button type="button" class="secondary-btn" onclick="closeCoachLoginModal()">
                                إلغاء
                            </button>
                        </div>
                    </form>
                    
                    <div class="coach-login-hint">
                        <i class="fas fa-info-circle"></i>
                        <span>الرقم الصحيح: BelalMphamed</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(coachLoginModal);
    
    // إعداد نموذج تسجيل دخول المدرب
    document.getElementById('coachLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const coachId = document.getElementById('coachIdInput').value.trim();
        
        if (coachId === 'BelalMphamed') {
            currentUser = systemData.coach;
            currentUserType = 'coach';
            showNotification(`مرحباً ${systemData.coach.name}! تم تسجيل الدخول بنجاح`, 'success');
            closeCoachLoginModal();
            showCoachDashboard();
        } else {
            showNotification('رقم هوية المدرب غير صحيح', 'error');
            shakeElement(document.getElementById('coachIdInput'));
        }
    });
}

function showCoachLoginModal() {
    document.getElementById('coachLoginModal').classList.add('active');
    document.getElementById('coachIdInput').focus();
}

function closeCoachLoginModal() {
    document.getElementById('coachLoginModal').classList.remove('active');
    document.getElementById('coachLoginForm').reset();
}
function setupLoginEvents() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return; // Exit if loginForm doesn't exist on this page
    
    loginForm.addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value.trim();
    
    if (!userId) {
        showNotification('يرجى إدخال رقم الهوية', 'error');
        return;
    }
    
    // التحقق من وجود اللاعب
    const player = getPlayerById(userId);
    
    if (!player) {
        showNotification('رقم الهوية غير صحيح أو غير مسجل', 'error');
        shakeElement(document.getElementById('userId'));
        return;
    }
    
    if (player.isBlocked) {
        showNotification('تم حظر هذا الحساب. يرجى التواصل مع المدرب', 'error');
        return;
    }
    
    // تسجيل دخول ناجح
    currentUser = player;
    currentUserType = 'player';
    
    showNotification(`مرحباً ${player.name}! تم تسجيل الدخول بنجاح`, 'success');
    showPlayerDashboard();
}


function showCoachLogin() {
    showCoachLoginModal();
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
    
    const playerName = document.getElementById('playerName');
    const profileName = document.getElementById('profileName');
    const profileRank = document.getElementById('profileRank');
    const profilePoints = document.getElementById('profilePoints');
    const profileAbsences = document.getElementById('profileAbsences');
    
    // التحقق من وجود العناصر قبل الوصول إليها
    if (playerName) playerName.textContent = `مرحباً، ${currentUser.name}`;
    if (profileName) profileName.textContent = currentUser.name;
    if (profileRank) profileRank.textContent = `المرتبة: #${currentUser.rank}`;
    if (profilePoints) profilePoints.textContent = currentUser.points;
    if (profileAbsences) profileAbsences.textContent = currentUser.absences;
}

function updateChampionInfo() {
    const championInfo = document.getElementById('championInfo');
    const championName = document.getElementById('championName');
    
    // التحقق من وجود العناصر قبل الوصول إليها
    if (!championInfo || !championName) return;
    
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
    
    // التحقق من وجود العنصر قبل الوصول إليه
    if (!rankingsList) return;
    
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
    
    // التحقق من وجود العنصر قبل الوصول إليه
    if (!messagesList) return;
    
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
    
    // التحقق من وجود العنصر قبل الوصول إليه
    if (!postsList) return;
    
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
    const canManagePost = currentUserType === 'coach' || (currentUser && currentUser.id === post.authorId);
    
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
    
    // عرض التعليقات
    let commentsHTML = '';
    if (post.comments && post.comments.length > 0) {
        commentsHTML = '<div class="post-comments">';
        post.comments.forEach(comment => {
            const canDeleteComment = currentUserType === 'coach' || (currentUser && currentUser.id === comment.playerId);
            const commentTime = new Date(comment.timestamp).toLocaleString('ar-EG');
            
            commentsHTML += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${comment.playerName}</span>
                        <span class="comment-time">${commentTime}</span>
                        ${canDeleteComment ? `<button class="delete-comment-btn" onclick="deleteComment('${post.id}', '${comment.playerId}', '${comment.timestamp}')" title="حذف التعليق"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                    <div class="comment-content">${comment.content}</div>
                </div>
            `;
        });
        commentsHTML += '</div>';
    }
    
    let postActionsHTML = `
        <button class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
            <i class="fas fa-heart"></i>
            <span>${post.likes.length}</span>
        </button>
        <button class="post-action" onclick="showComments('${post.id}')">
            <i class="fas fa-comment"></i>
            <span>${post.comments.length}</span>
        </button>
        <button class="post-action" onclick="showAddCommentModal('${post.id}')">
            <i class="fas fa-plus"></i>
            تعليق
        </button>
    `;
    
    if (canManagePost) {
        postActionsHTML += `
            <button class="post-action edit-post" onclick="editPost('${post.id}')" title="تعديل المنشور">
                <i class="fas fa-edit"></i>
            </button>
            <button class="post-action delete-post" onclick="deletePost('${post.id}')" title="حذف المنشور">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }
    
    postItem.innerHTML = `
        <div class="post-header">
            <div class="post-author">${post.authorName}</div>
            <div class="post-time">${postTime}</div>
        </div>
        <div class="post-content">${post.content}</div>
        ${mediaHTML}
        <div class="post-actions">
            ${postActionsHTML}
        </div>
        ${commentsHTML}
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
    
    // التحقق من وجود العنصر قبل الوصول إليه
    if (!playersGrid) return;
    
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
            <button class="action-btn delete-btn" onclick="deletePlayer('${player.id}')" title="حذف اللاعب">
                <i class="fas fa-trash"></i> حذف
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
        showNotification(result.message, 'success');
        updatePlayersGrid();
        // تحديث الترتيب في صفحة اللاعب إذا كانت مفتوحة
        updateRankings();
    } else {
        showNotification(result.message, 'error');
    }
}

function updateAbsences(playerId, change) {
    const result = updatePlayerAbsences(playerId, change);
    if (result.success) {
        showNotification(result.message, 'success');
        updatePlayersGrid();
        updateRankings();
    } else {
        showNotification(result.message, 'error');
    }
}

function setChampion(playerId) {
    const result = setChampionOfWeek(playerId);
    if (result.success) {
        showNotification(result.message, 'success');
        updateChampionInfo();
    } else {
        showNotification(result.message, 'error');
    }
}

function toggleBlock(playerId) {
    const result = togglePlayerBlock(playerId);
    if (result.success) {
        showNotification(result.message, 'success');
        updatePlayersGrid();
    } else {
        showNotification(result.message, 'error');
    }
}

function deletePlayer(playerId) {
    const player = getPlayerById(playerId);
    if (!player) {
        showNotification('اللاعب غير موجود', 'error');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف اللاعب "${player.name}"؟\nسيتم حذف جميع منشوراته ورسائله نهائياً.`)) {
        const result = removePlayer(playerId);
        if (result.success) {
            showNotification(result.message, 'success');
            updatePlayersGrid();
            updateRankings();
            updatePlayerPosts();
            updateCoachPosts();
        } else {
            showNotification(result.message, 'error');
        }
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
            showNotification('يرجى ملء جميع الحقول', 'error');
            return;
        }
        
        const result = addPlayer(name, id);
        if (result.success) {
            showNotification(result.message, 'success');
            closeModal();
            updatePlayersGrid();
            addPlayerForm.reset();
        } else {
            showNotification(result.message, 'error');
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
        
        // تنظيف حقل التعليق
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
            commentInput.value = '';
        }
    }, 300);
}

function handleAddPost() {
    const content = document.getElementById('postContent').value.trim();
    const editId = document.getElementById('addPostForm').getAttribute('data-edit-id');
    
    if (!content) {
        showNotification('يرجى كتابة محتوى المنشور', 'error');
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
    
    let result;
    if (editId) {
        // تعديل منشور موجود
        result = editPost(editId, content, mediaType, mediaUrl);
    } else {
        // إضافة منشور جديد
        result = addPost(currentUser.id, currentUser.name, content, mediaType, mediaUrl);
    }
    
    if (result && result.success) {
        showNotification(result.message, 'success');
        closeModal();
        updatePlayerPosts();
        updateCoachPosts();
        document.getElementById('addPostForm').reset();
        document.getElementById('addPostForm').removeAttribute('data-edit-id');
        
        // إعادة تعيين عنوان النافذة
        document.querySelector('#addPostModal .modal-header h3').innerHTML = '<i class="fas fa-plus"></i> إضافة منشور جديد';
        document.querySelector('#addPostForm button[type="submit"]').innerHTML = 'نشر';
        
        // إخفاء حقل يوتيوب
        youtubeInput.style.display = 'none';
    } else if (result) {
        showNotification(result.message, 'error');
    } else {
        showNotification('حدث خطأ أثناء معالجة المنشور', 'error');
    }
}

function editPost(postId) {
    const post = systemData.posts.find(p => p.id === postId);
    if (!post) {
        showNotification('المنشور غير موجود', 'error');
        return;
    }

    // ملء النموذج بالبيانات الحالية
    document.getElementById('postContent').value = post.content;
    
    // تغيير عنوان النافذة وزر الإرسال
    document.querySelector('#addPostModal .modal-header h3').innerHTML = '<i class="fas fa-edit"></i> تعديل المنشور';
    document.querySelector('#addPostForm button[type="submit"]').innerHTML = 'تحديث';
    
    // إضافة معرف المنشور للنموذج
    document.getElementById('addPostForm').setAttribute('data-edit-id', postId);
    
    showAddPostModal();
}

function deletePost(postId) {
    if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
        const result = deletePostFromSystem(postId);
        if (result.success) {
            showNotification(result.message, 'success');
            updatePlayerPosts();
            updateCoachPosts();
        } else {
            showNotification(result.message, 'error');
        }
    }
}

function deletePostFromSystem(postId) {
    const postIndex = systemData.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
        return { success: false, message: 'المنشور غير موجود' };
    }

    // حذف المنشور من النظام
    systemData.posts.splice(postIndex, 1);
    
    // حفظ التغييرات
    saveData();
    
    return { success: true, message: 'تم حذف المنشور نهائياً' };
}

function showAddCommentModal(postId) {
    if (!currentUser) return;
    
    // إنشاء نافذة التعليق إذا لم تكن موجودة
    let commentModal = document.getElementById('commentModal');
    if (!commentModal) {
        createCommentModal();
        commentModal = document.getElementById('commentModal');
    }
    
    // تعيين معرف المنشور
    commentModal.setAttribute('data-post-id', postId);
    
    // إظهار النافذة
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addPlayerModal').style.display = 'none';
    document.getElementById('addPostModal').style.display = 'none';
    document.getElementById('chatModal').style.display = 'none';
    commentModal.style.display = 'block';
    
    // تركيز على حقل النص
    document.getElementById('commentInput').focus();
}

function createCommentModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    
    const commentModal = document.createElement('div');
    commentModal.id = 'commentModal';
    commentModal.className = 'modal';
    commentModal.style.display = 'none';
    
    commentModal.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-comment"></i> إضافة تعليق</h3>
            <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-form">
            <div class="comment-form-content">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="comment-form-info">
                    <h4 id="commentUserName">${currentUser ? currentUser.name : ''}</h4>
                    <p>اكتب تعليقك على هذا المنشور</p>
                </div>
            </div>
            
            <div class="form-group">
                <textarea id="commentInput" rows="3" placeholder="اكتب تعليقك هنا..." required></textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="primary-btn" onclick="submitComment()">
                    <i class="fas fa-paper-plane"></i>
                    نشر التعليق
                </button>
                <button type="button" class="secondary-btn" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </div>
    `;
    
    modalOverlay.appendChild(commentModal);
}

function submitComment() {
    const commentModal = document.getElementById('commentModal');
    const postId = commentModal.getAttribute('data-post-id');
    const content = document.getElementById('commentInput').value.trim();
    
    if (!content) {
        showNotification('يرجى كتابة تعليق', 'error');
        return;
    }
    
    if (!currentUser) return;
    
    const result = addComment(postId, currentUser.id, currentUser.name, content);
    if (result.success) {
        showNotification('تم إضافة التعليق بنجاح', 'success');
        closeModal();
        updatePlayerPosts();
        updateCoachPosts();
        document.getElementById('commentInput').value = '';
    } else {
        showNotification(result.message, 'error');
    }
}

function deleteComment(postId, playerId, timestamp) {
    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
        const result = removeComment(postId, playerId, timestamp);
        if (result.success) {
            showNotification('تم حذف التعليق بنجاح', 'success');
            updatePlayerPosts();
            updateCoachPosts();
        } else {
            showNotification(result.message, 'error');
        }
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
    
    // التحقق من وجود العنصر قبل الوصول إليه
    if (!coachPostsList) return;
    
    coachPostsList.innerHTML = '';
    
    systemData.posts.forEach(post => {
        const postItem = createPostElement(post);
        coachPostsList.appendChild(postItem);
    });
}

// نظام المراسلة
function updatePlayersForChat() {
    const playersForChat = document.getElementById('playersForChat');
    
    // التحقق من وجود العنصر قبل الوصول إليه
    if (!playersForChat) return;
    
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
    
    const result = sendMessageToUser(currentUser.id, currentUser.name, currentChatUserId, content);
    
    if (result.success) {
        messageInput.value = '';
        updateChatMessages();
        
        // تحديث الرسائل في لوحة اللاعب إذا كانت مفتوحة
        if (currentUserType === 'player') {
            updatePlayerMessages();
        }
        
        showNotification('تم إرسال الرسالة بنجاح', 'success');
    }
}

// التعامل مع Enter في حقل الرسالة
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'messageInput') {
        sendMessage();
    } else if (e.key === 'Enter' && e.target.id === 'commentInput' && e.ctrlKey) {
        // Ctrl + Enter لإرسال التعليق
        submitComment();
    }
});

// وظائف تسجيل الخروج والمساعدة
function logout() {
    currentUser = null;
    currentUserType = null;
    currentChatUserId = null;
    
    // التحقق من وجود صفحة تسجيل الدخول
    const loginPage = document.getElementById('loginPage');
    const loginForm = document.getElementById('loginForm');
    
    if (loginPage && loginForm) {
        // إذا كنا في الصفحة الرئيسية
        hideAllPages();
        loginPage.classList.add('active');
        loginForm.reset();
    } else {
        // إذا كنا في صفحة الأدمن، نعيد التوجيه للصفحة الرئيسية
        window.location.href = 'sports-academy.html';
    }
    
    // إزالة معاملات URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// نظام الإشعارات المنسق
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // أيقونة حسب نوع الإشعار
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        ${icon}
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الإشعار إلى الصفحة
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // تأثير الظهور
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // إخفاء تلقائي بعد 5 ثواني
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

function closeNotification(closeBtn) {
    const notification = closeBtn.parentElement;
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300);
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}