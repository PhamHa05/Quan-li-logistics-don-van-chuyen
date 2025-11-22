// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let supportTickets = [];
let allOrders = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Support] Initializing...');
    
    checkAuth();
    loadSupportData();
    renderTickets();
});

function checkAuth() {
    const user = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('[Support] Current user:', currentUser);
        
        // Update header
        const headerNameEl = document.getElementById('header-user-name');
        if (headerNameEl) {
            headerNameEl.textContent = currentUser.fullName || currentUser.name || 'Khách hàng';
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
        alert('Lỗi dữ liệu người dùng. Vui lòng đăng nhập lại!');
        window.location.href = 'login.html';
    }
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

function loadSupportData() {
    // Load support tickets from DataSync or localStorage
    if (typeof DataSync !== 'undefined' && DataSync.cache) {
        supportTickets = DataSync.cache.supportTickets || [];
        allOrders = DataSync.cache.orders || [];
    } else {
        supportTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    }
    
    // Filter tickets for current user
    supportTickets = supportTickets.filter(ticket => 
        ticket.userId === currentUser.userId || 
        ticket.userId === currentUser.id ||
        ticket.email === currentUser.email
    );
    
    console.log('[Support] Loaded tickets:', supportTickets.length);
}

// ==================== FAQ FUNCTIONS ====================
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const isActive = element.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.classList.remove('active');
    });
    
    // Toggle current FAQ
    if (!isActive) {
        element.classList.add('active');
        answer.classList.add('active');
    }
}

function scrollToElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==================== TICKET FUNCTIONS ====================
function submitTicket(event) {
    event.preventDefault();
    
    const category = document.getElementById('ticket-category').value;
    const priority = document.getElementById('ticket-priority').value;
    const orderId = document.getElementById('ticket-order-id').value.trim();
    const subject = document.getElementById('ticket-subject').value.trim();
    const message = document.getElementById('ticket-message').value.trim();
    const attachments = document.getElementById('ticket-attachment').files;
    
    // Validate
    if (!category || !priority || !subject || !message) {
        showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
        return;
    }
    
    // Check if order exists (if provided)
    if (orderId) {
        const orderExists = allOrders.some(order => 
            order.id === orderId || order.orderId === orderId
        );
        
        if (!orderExists) {
            if (!confirm('Không tìm thấy đơn hàng với mã này. Bạn có muốn tiếp tục?')) {
                return;
            }
        }
    }
    
    // Create ticket object
    const ticket = {
        id: 'TK' + Date.now(),
        ticketId: 'TK' + Date.now(),
        userId: currentUser.userId || currentUser.id,
        userName: currentUser.fullName || currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        category: category,
        priority: priority,
        orderId: orderId || null,
        subject: subject,
        message: message,
        status: 'open', // open, processing, resolved, closed
        attachments: [], // In real app, would upload files
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
    };
    
    // Add to tickets array
    supportTickets.unshift(ticket);
    
    // Load all tickets for storage
    let allTickets = [];
    if (typeof DataSync !== 'undefined' && DataSync.cache) {
        allTickets = DataSync.cache.supportTickets || [];
    } else {
        allTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    }
    
    allTickets.push(ticket);
    
    // Save to storage
    if (typeof DataSync !== 'undefined') {
        DataSync.set('supportTickets', allTickets);
    } else {
        localStorage.setItem('supportTickets', JSON.stringify(allTickets));
    }
    
    console.log('[Support] Created ticket:', ticket);
    
    // Show success notification
    showNotification('Yêu cầu hỗ trợ đã được gửi thành công! Mã yêu cầu: ' + ticket.ticketId, 'success');
    
    // Reset form
    document.getElementById('support-ticket-form').reset();
    
    // Render tickets
    renderTickets();
    
    // Scroll to history
    setTimeout(() => {
        scrollToElement('history');
    }, 500);
}

function renderTickets() {
    const container = document.getElementById('ticket-list');
    
    if (supportTickets.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fas fa-inbox" style="font-size: 5rem; opacity: 0.3; margin-bottom: 20px;"></i>
                <h3 style="margin: 0 0 10px 0;">Chưa có yêu cầu hỗ trợ nào</h3>
                <p style="margin: 0;">Tạo yêu cầu hỗ trợ mới để được chúng tôi hỗ trợ</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    supportTickets.forEach(ticket => {
        const categoryNames = {
            'order-issue': 'Vấn đề đơn hàng',
            'delivery-issue': 'Vấn đề giao hàng',
            'payment-issue': 'Vấn đề thanh toán',
            'cod-issue': 'Vấn đề COD',
            'account-issue': 'Vấn đề tài khoản',
            'complaint': 'Khiếu nại',
            'suggestion': 'Góp ý',
            'other': 'Khác'
        };
        
        const priorityNames = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao',
            'urgent': 'Khẩn cấp'
        };
        
        const statusNames = {
            'open': 'Đang mở',
            'processing': 'Đang xử lý',
            'resolved': 'Đã giải quyết',
            'closed': 'Đã đóng'
        };
        
        const categoryName = categoryNames[ticket.category] || ticket.category;
        const priorityName = priorityNames[ticket.priority] || ticket.priority;
        const statusName = statusNames[ticket.status] || ticket.status;
        
        html += `
            <div class="ticket-item">
                <div class="ticket-header">
                    <div>
                        <span class="ticket-id">#${ticket.ticketId}</span>
                        <span style="color: #7f8c8d; margin-left: 10px;">| ${categoryName}</span>
                        ${ticket.orderId ? `<span style="color: #7f8c8d; margin-left: 10px;">| Đơn hàng: ${ticket.orderId}</span>` : ''}
                    </div>
                    <span class="ticket-status ${ticket.status}">${statusName}</span>
                </div>
                
                <div class="ticket-subject">${ticket.subject}</div>
                
                <div class="ticket-message">${ticket.message}</div>
                
                ${ticket.responses && ticket.responses.length > 0 ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 12px;">
                        <strong style="color: #2c3e50; display: block; margin-bottom: 8px;">
                            <i class="fas fa-reply"></i> Phản hồi gần nhất:
                        </strong>
                        <p style="margin: 0; color: #7f8c8d;">${ticket.responses[ticket.responses.length - 1].message}</p>
                        <small style="color: #95a5a6; margin-top: 5px; display: block;">
                            ${formatDate(ticket.responses[ticket.responses.length - 1].createdAt)} - 
                            ${ticket.responses[ticket.responses.length - 1].staffName}
                        </small>
                    </div>
                ` : ''}
                
                <div class="ticket-footer">
                    <div class="ticket-meta">
                        <i class="fas fa-clock"></i> ${formatDate(ticket.createdAt)}
                        <span style="margin-left: 15px;">
                            <i class="fas fa-flag"></i> Ưu tiên: ${priorityName}
                        </span>
                    </div>
                    <div>
                        <button class="btn btn-info btn-sm" onclick="viewTicketDetail('${ticket.ticketId}')">
                            <i class="fas fa-eye"></i> Chi tiết
                        </button>
                        ${ticket.status === 'open' || ticket.status === 'processing' ? `
                            <button class="btn btn-danger btn-sm" onclick="cancelTicket('${ticket.ticketId}')">
                                <i class="fas fa-times"></i> Hủy
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function viewTicketDetail(ticketId) {
    const ticket = supportTickets.find(t => t.ticketId === ticketId);
    
    if (!ticket) {
        showNotification('Không tìm thấy yêu cầu hỗ trợ!', 'error');
        return;
    }
    
    const categoryNames = {
        'order-issue': 'Vấn đề đơn hàng',
        'delivery-issue': 'Vấn đề giao hàng',
        'payment-issue': 'Vấn đề thanh toán',
        'cod-issue': 'Vấn đề COD',
        'account-issue': 'Vấn đề tài khoản',
        'complaint': 'Khiếu nại',
        'suggestion': 'Góp ý',
        'other': 'Khác'
    };
    
    const priorityNames = {
        'low': 'Thấp',
        'medium': 'Trung bình',
        'high': 'Cao',
        'urgent': 'Khẩn cấp'
    };
    
    const statusNames = {
        'open': 'Đang mở',
        'processing': 'Đang xử lý',
        'resolved': 'Đã giải quyết',
        'closed': 'Đã đóng'
    };
    
    let responsesHTML = '';
    if (ticket.responses && ticket.responses.length > 0) {
        responsesHTML = '<div style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #ecf0f1;">';
        responsesHTML += '<h3 style="color: #2c3e50; margin: 0 0 15px 0;"><i class="fas fa-comments"></i> Lịch sử phản hồi</h3>';
        
        ticket.responses.forEach(response => {
            responsesHTML += `
                <div style="background: ${response.isStaff ? '#e3f2fd' : '#f8f9fa'}; padding: 15px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: #2c3e50;">
                            ${response.isStaff ? '<i class="fas fa-user-tie"></i> ' + response.staffName : '<i class="fas fa-user"></i> Bạn'}
                        </strong>
                        <small style="color: #95a5a6;">${formatDate(response.createdAt)}</small>
                    </div>
                    <p style="margin: 0; color: #2c3e50; line-height: 1.6;">${response.message}</p>
                </div>
            `;
        });
        
        responsesHTML += '</div>';
    }
    
    const html = `
        <div style="max-width: 700px;">
            <h2 style="margin: 0 0 25px 0; color: #2c3e50;">
                <i class="fas fa-ticket-alt"></i> Chi tiết yêu cầu hỗ trợ
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div>
                        <strong style="color: #7f8c8d; display: block; margin-bottom: 5px;">Mã yêu cầu:</strong>
                        <span style="color: #2c3e50; font-weight: 600;">#${ticket.ticketId}</span>
                    </div>
                    <div>
                        <strong style="color: #7f8c8d; display: block; margin-bottom: 5px;">Trạng thái:</strong>
                        <span class="ticket-status ${ticket.status}">${statusNames[ticket.status]}</span>
                    </div>
                    <div>
                        <strong style="color: #7f8c8d; display: block; margin-bottom: 5px;">Loại yêu cầu:</strong>
                        <span style="color: #2c3e50;">${categoryNames[ticket.category]}</span>
                    </div>
                    <div>
                        <strong style="color: #7f8c8d; display: block; margin-bottom: 5px;">Mức độ ưu tiên:</strong>
                        <span style="color: #2c3e50;">${priorityNames[ticket.priority]}</span>
                    </div>
                    ${ticket.orderId ? `
                        <div>
                            <strong style="color: #7f8c8d; display: block; margin-bottom: 5px;">Mã đơn hàng:</strong>
                            <span style="color: #3498db; font-weight: 600;">${ticket.orderId}</span>
                        </div>
                    ` : ''}
                    <div>
                        <strong style="color: #7f8c8d; display: block; margin-bottom: 5px;">Ngày tạo:</strong>
                        <span style="color: #2c3e50;">${formatDate(ticket.createdAt)}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Tiêu đề</h3>
                <p style="color: #2c3e50; font-size: 1.1rem; font-weight: 600; margin: 0;">${ticket.subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Nội dung</h3>
                <p style="color: #7f8c8d; line-height: 1.8; margin: 0;">${ticket.message}</p>
            </div>
            
            ${responsesHTML}
            
            ${ticket.status === 'open' || ticket.status === 'processing' ? `
                <div style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #ecf0f1;">
                    <h3 style="color: #2c3e50; margin: 0 0 15px 0;"><i class="fas fa-reply"></i> Thêm phản hồi</h3>
                    <form onsubmit="addTicketResponse(event, '${ticket.ticketId}')">
                        <div class="form-group">
                            <textarea class="form-control" id="response-message" rows="4" placeholder="Nhập phản hồi của bạn..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Gửi phản hồi
                        </button>
                    </form>
                </div>
            ` : ''}
            
            <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Đóng
                </button>
                ${ticket.status === 'open' || ticket.status === 'processing' ? `
                    <button class="btn btn-danger" onclick="cancelTicket('${ticket.ticketId}'); closeModal();">
                        <i class="fas fa-ban"></i> Hủy yêu cầu
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    showModal(html);
}

function addTicketResponse(event, ticketId) {
    event.preventDefault();
    
    const message = document.getElementById('response-message').value.trim();
    
    if (!message) {
        showNotification('Vui lòng nhập nội dung phản hồi!', 'error');
        return;
    }
    
    // Find ticket in supportTickets
    const ticketIndex = supportTickets.findIndex(t => t.ticketId === ticketId);
    if (ticketIndex === -1) {
        showNotification('Không tìm thấy yêu cầu hỗ trợ!', 'error');
        return;
    }
    
    // Create response
    const response = {
        message: message,
        createdAt: new Date().toISOString(),
        isStaff: false,
        userName: currentUser.fullName || currentUser.name
    };
    
    // Add to ticket
    if (!supportTickets[ticketIndex].responses) {
        supportTickets[ticketIndex].responses = [];
    }
    supportTickets[ticketIndex].responses.push(response);
    supportTickets[ticketIndex].updatedAt = new Date().toISOString();
    
    // Load all tickets for storage
    let allTickets = [];
    if (typeof DataSync !== 'undefined' && DataSync.cache) {
        allTickets = DataSync.cache.supportTickets || [];
    } else {
        allTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    }
    
    // Find and update in all tickets
    const allTicketIndex = allTickets.findIndex(t => t.ticketId === ticketId);
    if (allTicketIndex !== -1) {
        allTickets[allTicketIndex] = supportTickets[ticketIndex];
        
        // Save to storage
        if (typeof DataSync !== 'undefined') {
            DataSync.set('supportTickets', allTickets);
        } else {
            localStorage.setItem('supportTickets', JSON.stringify(allTickets));
        }
    }
    
    showNotification('Phản hồi đã được gửi thành công!', 'success');
    
    // Close modal and re-render
    closeModal();
    renderTickets();
}

function cancelTicket(ticketId) {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu hỗ trợ này?')) {
        return;
    }
    
    // Find ticket in supportTickets
    const ticketIndex = supportTickets.findIndex(t => t.ticketId === ticketId);
    if (ticketIndex === -1) {
        showNotification('Không tìm thấy yêu cầu hỗ trợ!', 'error');
        return;
    }
    
    // Update status
    supportTickets[ticketIndex].status = 'closed';
    supportTickets[ticketIndex].updatedAt = new Date().toISOString();
    
    // Load all tickets for storage
    let allTickets = [];
    if (typeof DataSync !== 'undefined' && DataSync.cache) {
        allTickets = DataSync.cache.supportTickets || [];
    } else {
        allTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    }
    
    // Find and update in all tickets
    const allTicketIndex = allTickets.findIndex(t => t.ticketId === ticketId);
    if (allTicketIndex !== -1) {
        allTickets[allTicketIndex] = supportTickets[ticketIndex];
        
        // Save to storage
        if (typeof DataSync !== 'undefined') {
            DataSync.set('supportTickets', allTickets);
        } else {
            localStorage.setItem('supportTickets', JSON.stringify(allTickets));
        }
    }
    
    showNotification('Yêu cầu hỗ trợ đã được hủy!', 'success');
    renderTickets();
}

function openLiveChat() {
    showNotification('Chức năng chat trực tuyến đang được phát triển. Vui lòng sử dụng hotline hoặc tạo yêu cầu hỗ trợ!', 'info');
}

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function showModal(html) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 35px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s;
    `;
    modalContent.innerHTML = html;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.remove();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'info': '#3498db',
        'warning': '#f39c12'
    };
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColors[type]};
        color: white;
        padding: 18px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        animation: slideInRight 0.4s;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}" style="font-size: 1.3rem;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s';
        setTimeout(() => notification.remove(), 400);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
