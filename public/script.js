const input = document.getElementById('input');
const output = document.getElementById('output');
const suggestionsBox = document.getElementById('suggestions');

let commandsList = [];

// Cargar la lista de comandos disponibles
async function loadCommands() {
    const response = await fetch('/commands');
    commandsList = await response.json();
}

input.addEventListener('input', function () {
    const query = input.value.trim();
    if (query) {
        showSuggestions(query);
    } else {
        suggestionsBox.innerHTML = '';
        suggestionsBox.classList.add('hidden');
    }
});

async function showSuggestions(query) {
    const filtered = commandsList.filter(cmd => cmd.startsWith(query));
    if (filtered.length > 0) {
        suggestionsBox.innerHTML = filtered.map(cmd => `<div class="suggestion">${cmd}</div>`).join('');
        suggestionsBox.classList.remove('hidden');
    } else {
        suggestionsBox.innerHTML = '';
        suggestionsBox.classList.add('hidden');
    }

    // Manejar clics en las sugerencias
    document.querySelectorAll('.suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            input.value = suggestion.textContent;
            suggestionsBox.innerHTML = '';
            suggestionsBox.classList.add('hidden');
        });
    });
}

input.addEventListener('keypress', async function (e) {
    if (e.key === 'Enter') {
        const commandInput = input.value.trim();
        input.value = '';

        // Mostrar el comando en la salida
        output.innerHTML += `<div>$ ${commandInput}</div>`;
        
        // Enviar el comando al servidor
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: commandInput })
        });

        const result = await response.json();
        output.innerHTML += `<div>${result.output || 'Error: comando no encontrado'}</div>`;
        output.scrollTop = output.scrollHeight; // Desplazarse hacia abajo
    }
});

// Cargar los comandos al iniciar
loadCommands();