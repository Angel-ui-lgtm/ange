document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias a Elementos HTML ---
    const audio = document.getElementById('myAudio');
    const audioButton = document.querySelector('#audio-controls button');
    const contentArea = document.getElementById('main-content-area'); // El contenedor SPA

    let audioInitiated = false;

    // Si la página actual es la galería, aplica las animaciones inmediatamente
    if (window.location.href.includes('galeria.html')) {
        applyPhotoAnimations();
    }


    // --- 1. Control de la Música (Persistente) ---
    window.togglePlayPause = function () {
        if (audio.paused) {
            audio.play()
                .then(() => { audioButton.textContent = '⏸️'; audioInitiated = true; })
                .catch(error => { console.error("Audio no pudo iniciar:", error); });
        } else {
            audio.pause();
            audioButton.textContent = '🎶';
        }
    };
    audioButton.textContent = '🎶';


    // --- 2. Función que Carga el Contenido SIN recargar la página (Clave para el audio) ---
    function navigateTo(event, url) {
        event.preventDefault(); // <-- ¡Detiene la recarga de página!

        if (url === window.location.pathname) return; // Evitar cargar la página actual

        // Inicia el audio si es la primera interacción
        if (!audioInitiated) {
            togglePlayPause();
        }

        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Extrae el contenido que está dentro del #main-content-area
                const newContentElement = doc.getElementById('main-content-area');
                if (!newContentElement) {
                    console.error("Error: No se encontró el contenedor #main-content-area en la página de destino.");
                    window.location.href = url; // Fallback
                    return;
                }
                const newContent = newContentElement.innerHTML;

                // Aplica animación de salida
                contentArea.classList.add('fade-out');

                setTimeout(() => {
                    contentArea.innerHTML = newContent;
                    contentArea.classList.remove('fade-out');
                    contentArea.classList.add('fade-in');

                    setTimeout(() => {
                        contentArea.classList.remove('fade-in');

                        // 3. LLAMADA CRÍTICA: Llama a la función de animación de fotos 
                        if (url.includes('parati.html')) {
                            applyPhotoAnimations();
                        }

                    }, 500);

                    history.pushState(null, '', url);

                }, 300);
            })
            .catch(err => {
                console.error('Error al cargar la página:', err);
                window.location.href = url; // Fallback
            });
    }

    // --- 3. Función para Aplicar Animación a las Fotos (Aparición Secuencial) ---
    function applyPhotoAnimations() {
        const cards = document.querySelectorAll('#nuestra-historia .aniversary-card');
        cards.forEach((card, index) => {
            // Aplica la animación definida en CSS con un retraso secuencial
            card.style.animation = `fadeInCard 1s forwards ${0.2 + index * 0.3}s`;
        });
    }


    // --- 4. Escuchador de Eventos que Intercepta los Clicks ---
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');

        // Intercepta si es un enlace interno a uno de tus archivos .html
        if (link && link.href.endsWith('.html')) {
            navigateTo(event, link.getAttribute('href'));
        }
    });

    // Inicia el audio con el primer clic en el cuerpo
    document.body.addEventListener('click', function startAudio() {
        if (!audioInitiated) {
            togglePlayPause();
        }
        document.body.removeEventListener('click', startAudio);
    }, { once: true });
});