class LicenseManager {
    constructor() {
        this.licenseData = this.loadLicense();
        this.checkLicenseStatus();
        this.updateLicenseUI();
    }

    loadLicense() {
        const saved = localStorage.getItem('employee_license');
        if (saved) return JSON.parse(saved);
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);
        
        return {
            type: 'trial',
            companyName: 'ការប្រើប្រាស់សាកល្បង',
            expiryDate: expiryDate.toISOString().split('T')[0],
            maxEmployees: 10,
            features: ['attendance', 'qrcode', 'reports'],
            active: true,
            createdAt: new Date().toISOString().split('T')[0]
        };
    }

    checkLicenseStatus() {
        const today = new Date().toISOString().split('T')[0];
        
        if (today > this.licenseData.expiryDate) {
            this.licenseData.active = false;
            this.saveLicense();
            this.showExpiryNotice();
            return false;
        }
        
        return this.licenseData.active;
    }

    showExpiryNotice() {
        if (!this.licenseData.active) {
            const modalHTML = `
                <div class="modal fade" id="licenseExpiredModal" tabindex="-1" data-bs-backdrop="static">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title">
                                    <i class="fas fa-exclamation-triangle me-2"></i>អាជ្ញាប័ណ្ណផុតកំណត់
                                </h5>
                            </div>
                            <div class="modal-body text-center">
                                <div class="mb-4">
                                    <i class="fas fa-calendar-times fa-4x text-danger mb-3"></i>
                                    <h4>អាជ្ញាប័ណ្ណរបស់អ្នកបានផុតកំណត់!</h4>
                                </div>
                                
                                <div class="alert alert-info text-start">
                                    <h5><i class="fas fa-headset me-2"></i>ទាក់ទងអ្នកអភិវឌ្ឍន៍៖</h5>
                                    <div class="row mt-3">
                                        <div class="col-12 mb-2">
                                            <i class="fab fa-telegram me-2 text-primary"></i>
                                            <strong>តេលេក្រាម:</strong> 
                                            <a href="https://t.me/komsan441" target="_blank" class="ms-2">@komsan441</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button onclick="window.open('https://t.me/komsan441', '_blank')" class="btn btn-primary w-100">
                                    <i class="fab fa-telegram me-2"></i>ទាក់ទងតេលេក្រាមឥឡូវនេះ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            setTimeout(() => {
                const licenseModal = new bootstrap.Modal(document.getElementById('licenseExpiredModal'));
                licenseModal.show();
            }, 1000);
        }
    }

    saveLicense() {
        localStorage.setItem('employee_license', JSON.stringify(this.licenseData));
        this.updateLicenseUI();
    }

    updateLicenseUI() {
        if (document.getElementById('licenseType')) {
            document.getElementById('licenseType').textContent = 
                this.licenseData.type === 'trial' ? 'សាកល្បង' : 'ពិសេស';
        }
        
        if (document.getElementById('licenseExpiry')) {
            document.getElementById('licenseExpiry').textContent = this.licenseData.expiryDate;
        }
        
        if (document.getElementById('maxEmployees')) {
            document.getElementById('maxEmployees').textContent = this.licenseData.maxEmployees;
        }
        
        if (document.getElementById('companyName')) {
            document.getElementById('companyName').textContent = this.licenseData.companyName;
        }
    }

    activateLicense(licenseKey, companyName) {
        if (licenseKey && companyName) {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            
            this.licenseData = {
                type: 'premium',
                companyName: companyName,
                expiryDate: expiryDate.toISOString().split('T')[0],
                maxEmployees: 100,
                features: ['all'],
                active: true,
                licenseKey: licenseKey,
                activatedAt: new Date().toISOString().split('T')[0]
            };
            
            this.saveLicense();
            return true;
        }
        return false;
    }

    checkMaxEmployees(currentCount) {
        return currentCount < this.licenseData.maxEmployees;
    }

    showMaxEmployeesWarning() {
        const modalHTML = `
            <div class="modal fade" id="maxEmployeesModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title">
                                <i class="fas fa-users-slash me-2"></i>ចំនួនបុគ្គលិកលើស
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <i class="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
                                <h4>ការប្រើប្រាស់សាកល្បងមានកំណត់!</h4>
                                <p>ការប្រើប្រាស់សាកល្បងមានកំណត់ត្រឹម ${this.licenseData.maxEmployees} នាក់។</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">បិទ</button>
                            <button onclick="window.open('https://t.me/komsan441', '_blank')" class="btn btn-primary">
                                <i class="fab fa-telegram me-2"></i>ទាក់ទងទិញកម្មវិធី
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        const maxModal = new bootstrap.Modal(document.getElementById('maxEmployeesModal'));
        maxModal.show();
    }
}

// Create global instance
const licenseManager = new LicenseManager();

// Global functions
function showCompanySetup() {
    document.getElementById('requestModalTitle').textContent = 'កំណត់ក្រុមហ៊ុនថ្មី';
    document.getElementById('requestModalBody').innerHTML = `
        <div class="mb-3">
            <label class="form-label">ឈ្មោះក្រុមហ៊ុន</label>
            <input type="text" id="companyNameInput" class="form-control" placeholder="បញ្ចូលឈ្មោះក្រុមហ៊ុន">
        </div>
        <div class="mb-3">
            <label class="form-label">លេខសំងាត់អ្នកគ្រប់គ្រង</label>
            <input type="password" id="companyAdminPassword" class="form-control" placeholder="លេខសំងាត់ថ្មី">
        </div>
        <div class="mb-3">
            <label class="form-label">បញ្ជាក់លេខសំងាត់</label>
            <input type="password" id="confirmCompanyPassword" class="form-control" placeholder="បញ្ជាក់លេខសំងាត់">
        </div>
        <div class="mb-3">
            <label class="form-label">លេខអាជ្ញាប័ណ្ណ (បើមាន)</label>
            <input type="text" id="licenseKeyInput" class="form-control" placeholder="ទុកជាទំនេរបើសាកល្បង">
        </div>
        <button onclick="saveCompanyPassword()" class="btn btn-primary w-100">
            <i class="fas fa-save me-2"></i>រក្សាទុកការកំណត់
        </button>
    `;
    
    new bootstrap.Modal(document.getElementById('requestModal')).show();
}

function saveCompanyPassword() {
    const companyName = document.getElementById('companyNameInput').value;
    const password = document.getElementById('companyAdminPassword').value;
    const confirmPassword = document.getElementById('confirmCompanyPassword').value;
    const licenseKey = document.getElementById('licenseKeyInput').value;
    
    if (!companyName || !password) {
        showNotification('សូមបំពេញឈ្មោះក្រុមហ៊ុននិងលេខសំងាត់!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('លេខសំងាត់មិនដូចគ្នា!', 'error');
        return;
    }
    
    const companyAuth = {
        companyName: companyName,
        adminPassword: password,
        licenseKey: licenseKey,
        dateSet: new Date().toISOString().split('T')[0]
    };
    
    localStorage.setItem('company_auth', JSON.stringify(companyAuth));
    
    if (licenseKey) {
        licenseManager.activateLicense(licenseKey, companyName);
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('requestModal'));
    if (modal) modal.hide();
    
    showNotification('បានកំណត់ក្រុមហ៊ុនដោយជោគជ័យ!', 'success');
    licenseManager.updateLicenseUI();
}

window.showCompanySetup = showCompanySetup;
window.saveCompanyPassword = saveCompanyPassword;