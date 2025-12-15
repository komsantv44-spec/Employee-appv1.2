// PWA Installation Handling
let deferredPrompt;
let installButton;

document.addEventListener('DOMContentLoaded', function() {
    installButton = document.getElementById('installButton');
    
    if (!installButton) return;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.classList.remove('d-none');
        
        if (isIOS()) {
            installButton.innerHTML = '<i class="fas fa-plus-square me-2"></i>បន្ថែមទៅ Home Screen';
        } else if (isAndroid()) {
            installButton.innerHTML = '<i class="fas fa-download me-2"></i>ដំឡើង App';
        }
    });
    
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            showInstallInstructions();
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        deferredPrompt = null;
        installButton.classList.add('d-none');
        
        if (outcome === 'accepted') {
            showNotification('កម្មវិធីត្រូវបានដំឡើងដោយជោគជ័យ!', 'success');
        }
    });
    
    window.addEventListener('appinstalled', () => {
        installButton.classList.add('d-none');
        deferredPrompt = null;
    });
    
    checkIfInstalled();
});

function isIOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

function isAndroid() {
    return /android/i.test(navigator.userAgent);
}

function isStandalone() {
    return (window.matchMedia('(display-mode: standalone)').matches) ||
           (window.navigator.standalone) ||
           document.referrer.includes('android-app://');
}

function checkIfInstalled() {
    if (isStandalone() && installButton) {
        installButton.classList.add('d-none');
    }
}

function showInstallInstructions() {
    let instructions = '';
    
    if (isIOS()) {
        instructions = `
            <div class="text-start">
                <h5><i class="fab fa-apple me-2"></i>ដំឡើងលើ iPhone/iPad:</h5>
                <ol>
                    <li>ចុចលើប៊ូតុង Share <i class="fas fa-share-square"></i></li>
                    <li>រក្សាទុកទៅ "Add to Home Screen"</li>
                    <li>ចុច "Add" នៅជ្រុងខាងស្តាំលើ</li>
                </ol>
            </div>
        `;
    } else if (isAndroid()) {
        instructions = `
            <div class="text-start">
                <h5><i class="fab fa-android me-2"></i>ដំឡើងលើ Android:</h5>
                <ol>
                    <li>ចុចលើម៉ឺនុយ ៣ចំណុច <i class="fas fa-ellipsis-v"></i></li>
                    <li>ជ្រើសរើស "Add to Home screen"</li>
                    <li>ចុច "Add" ដើម្បីបញ្ចប់</li>
                </ol>
            </div>
        `;
    }
    
    document.getElementById('requestModalTitle').textContent = 'ការណែនាំដំឡើង App';
    document.getElementById('requestModalBody').innerHTML = `
        <div class="text-center mb-4">
            <i class="fas fa-mobile-alt fa-3x text-primary mb-3"></i>
            <h4>ដំឡើងកម្មវិធីលើទូរស័ព្ទរបស់អ្នក</h4>
        </div>
        ${instructions}
        <button onclick="window.open('https://t.me/komsan441', '_blank')" class="btn btn-outline-primary w-100 mt-3">
            <i class="fab fa-telegram me-2"></i>ត្រូវការជំនួយ? ទាក់ទងយើង
        </button>
    `;
    
    new bootstrap.Modal(document.getElementById('requestModal')).show();
}

window.showInstallInstructions = showInstallInstructions;