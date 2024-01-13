    let model;
    let recentSearches = [];
    let selectTimeout;
	 let isProcessing = false;
document.getElementById('selectionsTitle').style.display = 'none';

async function init() {
    // Mostrar el modal de carga
    document.getElementById('loadingModal').style.display = 'block';
    
    model = await mobilenet.load({version: 2, alpha: 1.0, language: 'de'});
    console.log('Model loaded');
    
    // Ocultar el modal de carga
    document.getElementById('loadingModal').style.display = 'none';

    const video = document.getElementById('webcam');
    const selectButton = document.getElementById('selectBreedButton');
    const constraints = {
        audio: false,
        video: {
            facingMode: "environment"
        }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
        selectButton.style.display = 'block';
        analyzeImage();
    }
    selectButton.addEventListener('click', addSearch);
}


 async function analyzeImage() {
        if (isProcessing) return;

        isProcessing = true;  // Marcamos como que estamos procesando
        const videoElement = document.getElementById('webcam');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, canvas.width, canvas.height);
        const result = await model.classify(canvas);

        const captionElement = document.getElementById('caption');
        const breed = result[0].className;
        captionElement.innerText = breed;

        // Añadimos un retardo de 1 segundo (1000 milisegundos) antes de procesar la siguiente imagen
        setTimeout(() => {
            isProcessing = false;  // Después de un segundo, marcamos como que hemos terminado de procesar
            requestAnimationFrame(analyzeImage);
        }, 1000);
    }

function addSearch() {
    const captionElement = document.getElementById('caption');
    const breed = captionElement.innerText;

    const recentSearchesElement = document.getElementById('recentSearches');
    recentSearches.push(breed);
    if (recentSearches.length > 5) {
        recentSearches.shift();
    }

    recentSearchesElement.innerHTML = '';
    for (const search of recentSearches) {
        const li = document.createElement('li');
        li.innerText = search;
        const infoButton = document.createElement('button');
        infoButton.innerText = 'Info';
        infoButton.onclick = () => window.open(`https://www.google.com/search?q=${search}`, '_blank');
        const imagesButton = document.createElement('button');
        imagesButton.innerText = 'Images';
        imagesButton.onclick = () => window.open(`https://www.google.com/search?q=${search}&tbm=isch`, '_blank');
        li.appendChild(infoButton);
        li.appendChild(imagesButton);
        recentSearchesElement.appendChild(li);
    }

    // Autoscroll al historial
    document.getElementById('recentSearches').scrollIntoView({behavior: "smooth"});

    // Actualiza la visibilidad del título 'Selections'
    const selectionsTitle = document.getElementById('selectionsTitle');
    if (recentSearches.length > 0) {
        selectionsTitle.style.display = 'block';
    } else {
        selectionsTitle.style.display = 'none';
    }
}



window.onload = init;
