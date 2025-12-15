// Global variables
let currentEmployee = null;
let currentAdmin = false;
let html5QrCode = null;

// Initialize application
function initApp() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    if (!licenseManager.checkLicenseStatus()) {
        return;
    }
    
    if (document.getElementById('employeeSection').classList.contains('active')) {
        initializeQRScanner();
    }
    
    updateQuickStats();
    updateEmployeeCount();
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('km-KH', options);
    const dateTimeElement = document.getElementById('currentDateTime');
    
    if (dateTimeElement) {
        dateTimeElement.textContent = formatter.format(now);
    }
}

function switchTab(tabName) {
    document.querySelectorAll('#mainTab .nav-link').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (tabName === 'employee') {
        document.querySelector('#mainTab .nav-link:first-child').classList.add('active');
        document.getElementById('employeeSection').classList.add('active');
        document.getElementById('adminSection').classList.remove('active');
        initializeQRScanner();
    } else {
        document.querySelector('#mainTab .nav-link:last-child').classList.add('active');
        document.getElementById('employeeSection').classList.remove('active');
        document.getElementById('adminSection').classList.add('active');
        
        if (html5QrCode) {
            try {
                html5QrCode.stop();
            } catch (e) {
                console.log('QR scanner already stopped');
            }
        }
    }
    
    updateMobileNav(tabName);
}

function updateMobileNav(activeTab) {
    const buttons = document.querySelectorAll('.bottom-nav .btn-link');
    buttons.forEach(btn => {
        btn.classList.remove('active', 'text-primary');
        btn.classList.add('text-secondary');
    });
    
    if (activeTab === 'employee') {
        buttons[0].classList.add('active', 'text-primary');
    } else if (activeTab === 'admin') {
        buttons[1].classList.add('active', 'text-primary');
    }
}

function initializeQRScanner() {
    if (!document.getElementById('qr-reader')) return;
    
    if (html5QrCode) {
        try {
            html5QrCode.stop();
        } catch (e) {
            console.log('Stopping previous scanner');
        }
    }
    
    const qrReader = document.getElementById('qr-reader');
    qrReader.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p class="mt-2">កំពុងចាប់ផ្តើមការស្កេន...</p></div>';
    
    setTimeout(() => {
        try {
            html5QrCode = new Html5Qrcode("qr-reader");
            
            const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                html5QrCode.stop();
                processQRScan(decodedText);
            };
            
            const config = { 
                fps: 10, 
                qrbox: { 
                    width: 250, 
                    height: 250 
                }
            };
            
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback,
                (error) => {
                    console.log(`QR Code error: ${error}`);
                }
            ).catch(err => {
                console.error("Failed to start QR scanner:", err);
                qrReader.innerHTML = `
                    <div class="alert alert-warning">
                        <h5><i class="fas fa-video-slash me-2"></i>មិនអាចប្រើកាមេរ៉ាបានទេ</h5>
                        <button onclick="manualCheckIn()" class="btn btn-warning mt-2">
                            <i class="fas fa-hand-point-up me-2"></i>កត់វត្តមានដោយដៃ
                        </button>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Error initializing QR scanner:', error);
            qrReader.innerHTML = '<div class="alert alert-danger">មិនអាចចាប់ផ្តើមការស្កេន QR Code បានទេ</div>';
        }
    }, 500);
}

function processQRScan(qrData) {
    try {
        const data = JSON.parse(qrData);
        
        if (data.type === 'employee_attendance' && data.id) {
            const employee = db.getEmployeeById(data.id);
            
            if (!employee) {
                showNotification('បុគ្គលិកមិនត្រូវបានរកឃើញ!', 'error');
                setTimeout(initializeQRScanner, 2000);
                return;
            }
            
            currentEmployee = employee;
            handleAttendance(employee.id);
        }
    } catch (error) {
        const employee = db.getEmployeeById(qrData);
        if (employee) {
            currentEmployee = employee;
            handleAttendance(employee.id);
        } else {
            showNotification('QR Code មិនត្រឹមត្រូវ!', 'error');
            setTimeout(initializeQRScanner, 2000);
        }
    }
}

function handleAttendance(employeeId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = db.getAttendance(today, employeeId);
        
        let result;
        let message;
        
        if (todayRecord.length > 0 && todayRecord[0].checkIn && !todayRecord[0].checkOut) {
            result = db.recordAttendance(employeeId, 'checkout');
            message = `កត់ចេញដោយជោគជ័យ៖ ${result.employee.name}`;
            
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-success text-center">
                    <h4><i class="fas fa-sign-out-alt me-2"></i>ការស្កេនបានជោគជ័យ!</h4>
                    <p class="mb-1"><strong>បុគ្គលិក៖</strong> ${result.employee.name}</p>
                    <p class="mb-0"><strong>ពេលចេញ៖</strong> ${result.time}</p>
                </div>
            `;
        } else {
            result = db.recordAttendance(employeeId, 'checkin');
            message = `កត់ចូលដោយជោគជ័យ៖ ${result.employee.name}`;
            
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-success text-center">
                    <h4><i class="fas fa-sign-in-alt me-2"></i>ការស្កេនបានជោគជ័យ!</h4>
                    <p class="mb-1"><strong>បុគ្គលិក៖</strong> ${result.employee.name}</p>
                    <p class="mb-0"><strong>ពេលចូល៖</strong> ${result.time}</p>
                </div>
            `;
        }
        
        showNotification(message, 'success');
        displayEmployeeInfo(result.employee);
        updateQuickStats();
        
        setTimeout(() => {
            document.getElementById('scanResult').innerHTML = '';
            initializeQRScanner();
        }, 5000);
        
    } catch (error) {
        showNotification(error.message, 'error');
        setTimeout(initializeQRScanner, 3000);
    }
}

function manualCheckIn() {
    if (currentEmployee) {
        handleAttendance(currentEmployee.id);
    } else {
        const employeeId = prompt('សូមបញ្ចូលលេខសម្គាល់បុគ្គលិករបស់អ្នក៖');
        
        if (employeeId) {
            const employee = db.getEmployeeById(employeeId);
            
            if (employee) {
                currentEmployee = employee;
                handleAttendance(employeeId);
            } else {
                showNotification('លេខសម្គាល់មិនត្រឹមត្រូវ!', 'error');
            }
        }
    }
}

function displayEmployeeInfo(employee) {
    const employeeInfo = document.getElementById('employeeInfo');
    const employeeStats = document.getElementById('employeeStats');
    
    if (!employeeInfo || !employeeStats) return;
    
    const attendanceRecords = db.getAttendance(null, employee.id);
    const presentDays = attendanceRecords.filter(record => record.checkIn).length;
    
    employeeInfo.innerHTML = `
        <div class="text-center">
            <div class="avatar-circle mb-3">
                <i class="fas fa-user fa-3x text-primary"></i>
            </div>
            <h4 class="mb-2">${employee.name}</h4>
            <div class="row">
                <div class="col-6 text-start">
                    <p class="mb-1"><strong>លេខសម្គាល់៖</strong></p>
                    <p class="mb-1"><strong>តួនាទី៖</strong></p>
                    <p class="mb-0"><strong>ប្រាក់ខែ៖</strong></p>
                </div>
                <div class="col-6 text-end">
                    <p class="mb-1">${employee.id}</p>
                    <p class="mb-1">${employee.role}</p>
                    <p class="mb-0">$${employee.salary}</p>
                </div>
            </div>
        </div>
    `;
    
    employeeStats.innerHTML = `
        <div class="alert alert-info">
            <div class="row text-center">
                <div class="col-6">
                    <h5 class="mb-0">${presentDays}</h5>
                    <small>ថ្ងៃធ្វើការ</small>
                </div>
                <div class="col-6">
                    <h5 class="mb-0">${employee.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}</h5>
                    <small>ស្ថានភាព</small>
                </div>
            </div>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const types = {
        'success': { class: 'alert-success', icon: 'fas fa-check-circle' },
        'error': { class: 'alert-danger', icon: 'fas fa-exclamation-circle' },
        'warning': { class: 'alert-warning', icon: 'fas fa-exclamation-triangle' },
        'info': { class: 'alert-info', icon: 'fas fa-info-circle' }
    };
    
    const config = types[type] || types['info'];
    
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => {
        if (notif.parentElement) {
            notif.parentElement.removeChild(notif);
        }
    });
    
    const notification = document.createElement('div');
    notification.className = `alert ${config.class} notification`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${config.icon} me-3 fa-lg"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.getElementById('notificationContainer').appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function updateQuickStats() {
    const stats = db.getStatistics();
    
    const elements = {
        'totalEmployees': stats.totalEmployees,
        'todayAttendance': stats.todayPresent,
        'totalLoans': `$${stats.totalLoans}`,
        'totalSalary': `$${stats.totalSalary}`
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

function updateEmployeeCount() {
    const employees = db.getEmployees();
    const countElement = document.getElementById('employeeCount');
    
    if (countElement) {
        countElement.textContent = employees.length;
    }
}

// Login function
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const companyAuth = JSON.parse(localStorage.getItem('company_auth'));
    
    let isValid = false;
    
    if (companyAuth && companyAuth.adminPassword === password) {
        isValid = true;
    } else if (password === 'admin123') {
        isValid = true;
    }
    
    if (isValid) {
        if (!licenseManager.checkLicenseStatus()) {
            return;
        }
        
        currentAdmin = true;
        document.getElementById('loginSection').classList.add('d-none');
        document.getElementById('adminPanel').classList.remove('d-none');
        showNotification('ចូលប្រព័ន្ធជោគជ័យ!', 'success');
        
        if (companyAuth) {
            showNotification(`សូមស្វាគមន៍ក្រុមហ៊ុន ${companyAuth.companyName}`, 'info');
        }
    } else {
        showNotification('ពាក្យសម្ងាត់មិនត្រឹមត្រូវ!', 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Global functions
window.switchTab = switchTab;
window.manualCheckIn = manualCheckIn;
window.showNotification = showNotification;
window.loginAdmin = loginAdmin;