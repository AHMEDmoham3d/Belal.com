// بيانات النظام
const systemData = {
    coach: {
        id: "coach123",
        name: "المدرب أحمد محمد",
        adminLink: "?admin=coach123&access=full"
    },
    players: [
        {
            id: "logain913",
            name: "لوجين احمد",
            points: 0,
            absences: 0,
            rank: 1,
            isBlocked: false,
            joinDate: "2024-01-15"
        },
        {
            id: "Aiten123",
            name: "ايتن فتحى",
            points: 0,
            absences: 0,
            rank: 2,
            isBlocked: false,
            joinDate: "2024-01-25"
        },
        {
            id: "Farah123",
            name: "فرح عادل",
            points: 82,
            absences: 1,
            rank: 3,
            isBlocked: false,
            joinDate: "2024-01-25"
        },
        {
            id: "remas123",
            name: "ريماس طارق ",
            points: 50,
            absences: 0,
            rank: 4,
            isBlocked: false,
            joinDate: "2024-01-20"
        },
        
    ],
    championOfWeek: {
        playerId: "player001",
        week: "2024-W48",
        setDate: "2024-12-01"
    },
    posts: [
        {
            id: "post001",
            authorId: "coach123",
            authorName: "المدرب أحمد",
            content: "مبروك للاعبين على الأداء الممتاز في التدريب اليوم! 💪",
            timestamp: "2024-12-01T10:30:00Z",
            mediaType: null,
            mediaUrl: null,
            likes: ["player001", "player002"],
            comments: [
                {
                    playerId: "player001",
                    playerName: "محمد أحمد",
                    content: "شكراً كابتن! 🙏",
                    timestamp: "2024-12-01T10:45:00Z"
                }
            ]
        },
        {
            id: "post002",
            authorId: "player001",
            authorName: "محمد أحمد",
            content: "التدريب اليوم كان رائع! شكراً للمدرب على الإرشادات القيمة",
            timestamp: "2024-12-01T15:20:00Z",
            mediaType: null,
            mediaUrl: null,
            likes: ["coach123", "player002", "player003"],
            comments: []
        }
    ],
    privateMessages: [
        {
            chatId: "coach123_player001",
            messages: [
                {
                    senderId: "coach123",
                    senderName: "المدرب أحمد",
                    content: "أداؤك ممتاز اليوم محمد، استمر كذلك!",
                    timestamp: "2024-12-01T16:00:00Z"
                },
                {
                    senderId: "player001",
                    senderName: "محمد أحمد",
                    content: "شكراً كابتن! سأبذل قصارى جهدي",
                    timestamp: "2024-12-01T16:05:00Z"
                }
            ]
        },
        {
            chatId: "coach123_player002",
            messages: [
                {
                    senderId: "coach123",
                    senderName: "المدرب أحمد",
                    content: "تحتاج لتحسين التركيز في التمرين القادم",
                    timestamp: "2024-12-01T14:30:00Z"
                }
            ]
        }
    ],
    settings: {
        weeklyChampionEnabled: true,
        allowPlayerPosts: true,
        maxAbsencesBeforeWarning: 5
    }
};

function saveData() {
    try {
        localStorage.setItem('sportsAcademyData', JSON.stringify(systemData));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        return false;
    }
}

function loadData() {
    try {
        const savedData = localStorage.getItem('sportsAcademyData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.assign(systemData, parsedData);
        }
        return true;
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        return false;
    }
}

function getPlayerById(playerId) {
    return systemData.players.find(player => player.id === playerId);
}

function updatePlayerRanks() {
    const sortedPlayers = [...systemData.players].filter(p => !p.isBlocked).sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        return a.absences - b.absences;
    });
    sortedPlayers.forEach((player, index) => {
        const originalPlayer = getPlayerById(player.id);
        if (originalPlayer) originalPlayer.rank = index + 1;
    });
    saveData();
}

function addPlayer(name, id) {
    if (getPlayerById(id)) return { success: false, message: 'هذا الرقم مستخدم مسبقاً' };
    systemData.players.push({
        id,
        name,
        points: 0,
        absences: 0,
        rank: 0,
        isBlocked: false,
        joinDate: new Date().toISOString().split('T')[0]
    });
    updatePlayerRanks();
    return { success: true, message: 'تم إضافة اللاعب بنجاح' };
}

function removePlayer(playerId) {
    const i = systemData.players.findIndex(p => p.id === playerId);
    if (i === -1) return { success: false, message: 'اللاعب غير موجود' };
    systemData.players.splice(i, 1);
    systemData.privateMessages = systemData.privateMessages.filter(c => !c.chatId.includes(playerId));
    systemData.posts.forEach(post => {
        post.likes = post.likes.filter(id => id !== playerId);
        post.comments = post.comments.filter(c => c.playerId !== playerId);
    });
    updatePlayerRanks();
    return { success: true, message: 'تم حذف اللاعب بنجاح' };
}

function togglePlayerBlock(playerId) {
    const player = getPlayerById(playerId);
    if (!player) return { success: false, message: 'اللاعب غير موجود' };
    player.isBlocked = !player.isBlocked;
    updatePlayerRanks();
    return { success: true, message: player.isBlocked ? 'تم حظر اللاعب' : 'تم إلغاء حظر اللاعب' };
}

function updatePlayerPoints(playerId, change) {
    const player = getPlayerById(playerId);
    if (!player) return { success: false, message: 'اللاعب غير موجود' };
    player.points = Math.max(0, player.points + change);
    updatePlayerRanks();
    return { success: true, message: 'تم تحديث النقاط بنجاح' };
}

function updatePlayerAbsences(playerId, change) {
    const player = getPlayerById(playerId);
    if (!player) return { success: false, message: 'اللاعب غير موجود' };
    player.absences = Math.max(0, player.absences + change);
    updatePlayerRanks();
    return { success: true, message: 'تم تحديث الغيابات بنجاح' };
}

function setChampionOfWeek(playerId) {
    if (!getPlayerById(playerId)) return { success: false, message: 'اللاعب غير موجود' };
    systemData.championOfWeek = {
        playerId,
        week: getWeekNumber(),
        setDate: new Date().toISOString()
    };
    saveData();
    return { success: true, message: 'تم تعيين بطل الأسبوع' };
}

function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    return `${now.getFullYear()}-W${week}`;
}

function addPost(authorId, authorName, content, mediaType = null, mediaUrl = null) {
    const post = {
        id: 'post' + Date.now(),
        authorId,
        authorName,
        content,
        timestamp: new Date().toISOString(),
        mediaType,
        mediaUrl,
        likes: [],
        comments: []
    };
    systemData.posts.unshift(post);
    saveData();
    return { success: true, message: 'تم إضافة المنشور', post };
}

function togglePostLike(postId, userId) {
    const post = systemData.posts.find(p => p.id === postId);
    if (!post) return { success: false, message: 'المنشور غير موجود' };
    const i = post.likes.indexOf(userId);
    if (i === -1) post.likes.push(userId);
    else post.likes.splice(i, 1);
    saveData();
    return { success: true, liked: i === -1 };
}

function addComment(postId, playerId, playerName, content) {
    const post = systemData.posts.find(p => p.id === postId);
    if (!post) return { success: false, message: 'المنشور غير موجود' };
    const comment = {
        playerId,
        playerName,
        content,
        timestamp: new Date().toISOString()
    };
    post.comments.push(comment);
    saveData();
    return { success: true, comment };
}

function getChatMessages(userId1, userId2) {
    const chatId1 = `${userId1}_${userId2}`;
    const chatId2 = `${userId2}_${userId1}`;
    let chat = systemData.privateMessages.find(c => c.chatId === chatId1 || c.chatId === chatId2);
    if (!chat) {
        chat = { chatId: chatId1, messages: [] };
        systemData.privateMessages.push(chat);
    }
    return chat.messages;
}

function sendMessage(fromId, fromName, toId, content) {
    const chatId1 = `${fromId}_${toId}`;
    const chatId2 = `${toId}_${fromId}`;
    let chat = systemData.privateMessages.find(c => c.chatId === chatId1 || c.chatId === chatId2);
    if (!chat) {
        chat = { chatId: chatId1, messages: [] };
        systemData.privateMessages.push(chat);
    }
    const message = {
        senderId: fromId,
        senderName: fromName,
        content,
        timestamp: new Date().toISOString()
    };
    chat.messages.push(message);
    saveData();
    return { success: true, message };
}

loadData();
