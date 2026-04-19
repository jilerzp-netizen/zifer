// Konfigurasi backend
const BACKENDS = {
    nodejs: 'http://xhhosting.qoupayid.xyz:3597/send-telegram',
    php: '/send-message'  // via index.php
};

let currentBackend = 'nodejs';

// Pilih backend
const backendSelect = document.getElementById('backendType');
if (backendSelect) {
    backendSelect.addEventListener('change', (e) => {
        currentBackend = e.target.value;
        showStatus(`✅ Backend berubah ke ${currentBackend === 'nodejs' ? 'Node.js' : 'PHP'}`, 'success');
    });
}

const form = document.getElementById('telegramForm');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('statusMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const botToken = document.getElementById('botToken').value.trim();
    const chatId = document.getElementById('chatId').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!botToken || !chatId || !message) {
        showStatus('❌ Semua field harus diisi!', 'error');
        return;
    }

    sendBtn.classList.add('loading');
    sendBtn.disabled = true;

    try {
        const apiUrl = BACKENDS[currentBackend];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botToken, chatId, message, parseMode: 'HTML' }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.success) {
            showStatus('✅ ' + data.message, 'success');
            form.reset();
        } else {
            showStatus('❌ Gagal: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showStatus('❌ Timeout! Server tidak merespon.', 'error');
        } else {
            showStatus(`❌ Error: ${error.message}`, 'error');
        }
    } finally {
        sendBtn.classList.remove('loading');
        sendBtn.disabled = false;
    }
});

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status-message ' + type;
    setTimeout(() => {
        if (statusDiv.className.includes(type)) {
            statusDiv.style.display = 'none';
        }
    }, 5000);
}