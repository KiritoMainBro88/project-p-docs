document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    let commandsData = [];
    const MIN_QUERY_LENGTH = 2; // Minimum characters to start searching

    // Fetch the command index data
    fetch('search-index.json') // Assuming it's in the same directory
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Attempt to parse JSON, handle potential errors
            return response.json().catch(parseError => {
                console.error("Failed to parse search-index.json:", parseError);
                throw new Error("Invalid JSON data in search-index.json");
            });
        })
        .then(data => {
            if (!Array.isArray(data)) {
                 throw new Error("Search index is not a valid JSON array.");
            }
            commandsData = data;
            console.log('Search index loaded successfully:', commandsData.length, 'commands'); // Keep for debugging
            searchInput.disabled = false; // Enable input after data loads
            searchInput.placeholder = "Search commands...";
        })
        .catch(error => {
            console.error('Error loading or processing search index:', error);
            resultsContainer.innerHTML = `<div class="no-results">Error: ${error.message}. Search unavailable.</div>`;
            searchInput.placeholder = "Search unavailable";
            searchInput.disabled = true;
        });

    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', handleSearch); // Show results on focus if query exists

    function handleSearch() {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length < MIN_QUERY_LENGTH) {
            resultsContainer.innerHTML = ''; // Clear results if query is too short
            resultsContainer.style.display = 'none'; // Hide container
            return;
        }

        // Perform filtering
        const filteredCommands = commandsData.filter(cmd => {
            // Ensure cmd properties exist before calling toLowerCase()
            const nameMatch = cmd.name && cmd.name.toLowerCase().includes(query);
            const aliasMatch = cmd.aliases && Array.isArray(cmd.aliases) && cmd.aliases.some(alias => alias && alias.toLowerCase().includes(query));
            const descriptionMatch = cmd.description && cmd.description.toLowerCase().includes(query);
            const categoryMatch = cmd.category && cmd.category.toLowerCase().includes(query); // Search category too
            return nameMatch || aliasMatch || descriptionMatch || categoryMatch;
        });

        renderResults(filteredCommands, query);
    }

    function renderResults(results, query) {
        resultsContainer.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No commands found.</div>';
            resultsContainer.style.display = 'block'; // Show container
            return;
        }

        // Simple relevance boost: name > alias > category > description
        results.sort((a, b) => {
            const scoreA = (a.name && a.name.toLowerCase().includes(query) ? 4 : 0) +
                           (a.aliases && Array.isArray(a.aliases) && a.aliases.some(alias => alias && alias.toLowerCase().includes(query)) ? 3 : 0) +
                           (a.category && a.category.toLowerCase().includes(query) ? 2 : 0) +
                           (a.description && a.description.toLowerCase().includes(query) ? 1 : 0);
            const scoreB = (b.name && b.name.toLowerCase().includes(query) ? 4 : 0) +
                           (b.aliases && Array.isArray(b.aliases) && b.aliases.some(alias => alias && alias.toLowerCase().includes(query)) ? 3 : 0) +
                           (b.category && b.category.toLowerCase().includes(query) ? 2 : 0) +
                           (b.description && b.description.toLowerCase().includes(query) ? 1 : 0);
            return scoreB - scoreA; // Higher score first
        });


        results.slice(0, 15).forEach(cmd => { // Limit displayed results
            const resultDiv = document.createElement('div');
            const link = document.createElement('a');
            link.href = cmd.url || '#'; // Use URL or fallback to '#'

            const nameSpan = document.createElement('span');
            nameSpan.className = 'command-name';
            nameSpan.innerHTML = highlightMatch(cmd.name || 'Unknown', query); // Use innerHTML for highlighting

            const categorySpan = document.createElement('span');
            categorySpan.className = 'category';
            categorySpan.textContent = `(${cmd.category || 'Misc'})`; // Add category in parentheses

            const descSpan = document.createElement('span');
            descSpan.className = 'description';
            descSpan.textContent = cmd.description || ''; // Use description or empty string

            link.appendChild(nameSpan);
            link.appendChild(categorySpan);
            resultDiv.appendChild(link);
            resultDiv.appendChild(descSpan); // Append description below link

            resultsContainer.appendChild(resultDiv);
        });

        resultsContainer.style.display = 'block'; // Show container
    }

    // Function to highlight the matching part
    function highlightMatch(text, query) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        try {
            const startIndex = lowerText.indexOf(lowerQuery);
            if (startIndex === -1) {
                return `<code>${escapeHtml(text)}</code>`; // No match
            }
            const endIndex = startIndex + lowerQuery.length;
            return `<code>${escapeHtml(text.substring(0, startIndex))}<strong>${escapeHtml(text.substring(startIndex, endIndex))}</strong>${escapeHtml(text.substring(endIndex))}</code>`;
        } catch (e) {
             console.warn("Highlighting error for text:", text, e); // Log error if highlighting fails
             return `<code>${escapeHtml(text)}</code>`; // Fallback
        }
    }

     // Simple HTML escape function
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return ""; // Handle non-string inputs
        return unsafe
             .replace(/&/g, "&")
             .replace(/</g, "<")
             .replace(/>/g, ">")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "'");
     }

    // Hide results when clicking outside
    document.addEventListener('click', (event) => {
        if (!resultsContainer.contains(event.target) && event.target !== searchInput) {
            resultsContainer.style.display = 'none';
        }
    });
     // Hide results on Escape key
     searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
             resultsContainer.style.display = 'none';
             searchInput.value = ''; // Clear input on escape
        }
    });

});