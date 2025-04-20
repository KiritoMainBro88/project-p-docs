document.addEventListener('DOMContentLoaded', () => {
    // Define the placeholders used in your HTML
    const PLACEHOLDERS = {
        support: '[YOUR_SUPPORT_SERVER_LINK]',
        invite: '[YOUR_BOT_INVITE_LINK]'
        // Add more here if needed, e.g., github: '[YOUR_GITHUB_LINK]'
    };

    // Fetch the link configuration file
    fetch('links.config.json') // Assumes it's in the same directory as the HTML files
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error fetching links config! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(config => {
            // Get all anchor (<a>) tags on the page
            const links = document.querySelectorAll('a');

            links.forEach(link => {
                const href = link.getAttribute('href'); // Get the raw href attribute

                // Check and replace support link
                if (href === PLACEHOLDERS.support && config.SUPPORT_SERVER_URL) {
                    link.href = config.SUPPORT_SERVER_URL;
                    // console.log(`Replaced support link on: ${link.textContent.trim()}`);
                }
                // Check and replace invite link
                else if (href === PLACEHOLDERS.invite && config.BOT_INVITE_URL) {
                    link.href = config.BOT_INVITE_URL;
                    // console.log(`Replaced invite link on: ${link.textContent.trim()}`);
                }
                // Add more 'else if' blocks here for other placeholders you might define
            });
        })
        .catch(error => {
            console.error("Error loading or processing link config:", error);
            // Optionally display an error to the user or just let links remain as placeholders
        });
});