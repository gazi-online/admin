document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gs-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const statusMessage = document.getElementById('status-message');

    // IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL!
    const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE'; // e.g., 'https://script.google.com/macros/s/AKfycb.../exec'

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if URL is configured
        if (APPS_SCRIPT_URL === 'https://script.google.com/macros/s/AKfycby6QbgyrcIKnCsWwwCff_6DiZjS1wdELEevD4G2eHlaxbY1CzYojCvT7wPKtFEJosk4EQ/exec') {
            showStatus('🚨 Please update APPS_SCRIPT_URL in app.js with your Google Apps Script URL.', 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // Basic enrichment (adding a timestamp)
        data.timestamp = new Date().toISOString();

        // UI Feedback: Loading state
        setLoadingState(true);

        try {
            // Note: Since Apps Script sometimes has CORS issues with application/json from simple web apps depending on setup,
            // standard practice is to use text/plain or carefully configured JSON payload, or FormData.
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                // Using text/plain avoids CORS preflight OPTIONS request issues often seen with Apps Script
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', 
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.result === 'success') {
                showStatus('✅ Your message has been saved successfully!', 'success');
                form.reset();
            } else {
                throw new Error(result.error || 'Unknown error occurred on the server.');
            }

        } catch (error) {
            console.error('Submission Error:', error);
            showStatus('❌ Failed to save data. Please try again.', 'error');
        } finally {
            // Revert UI Loading State
            setLoadingState(false);
            
            // Auto hide success message after 5 seconds
            if (statusMessage.classList.contains('success')) {
                setTimeout(() => {
                    statusMessage.classList.add('hidden');
                }, 5000);
            }
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.style.opacity = '0';
            btnLoader.classList.remove('loader-hidden');
        } else {
            submitBtn.disabled = false;
            btnText.style.opacity = '1';
            btnLoader.classList.add('loader-hidden');
        }
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.classList.remove('hidden');
    }
});

