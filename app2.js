const FALLBACK_IMAGE_DATA_URI =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
            <text class="txt" x="32" y="88">图片无法加载</text>
            <text class="txt" x="32" y="118" font-size="12">请检查外链或网络设置</text>
        </svg>
    `.replace(/\s+/g, ' ').trim());

function applyImageShadow(imgElement) {
    imgElement.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;
            context.drawImage(imgElement, 0, 0);

            const sampleSize = 5; // 5x5 = 25 points
            const stepX = Math.floor(canvas.width / (sampleSize + 1));
            const stepY = Math.floor(canvas.height / (sampleSize + 1));
            let r = [], g = [], b = [];

            for (let i = 0; i < sampleSize; i++) {
                for (let j = 0; j < sampleSize; j++) {
                    const x = (i + 1) * stepX;
                    const y = (j + 1) * stepY;
                    const pixelData = context.getImageData(x, y, 1, 1).data;
                    r.push(pixelData[0]);
                    g.push(pixelData[1]);
                    b.push(pixelData[2]);
                }
            }

            // 去极值 (移除最大值和最小值)
            r.sort((a, b) => a - b).slice(1, -1);
            g.sort((a, b) => a - b).slice(1, -1);
            b.sort((a, b) => a - b).slice(1, -1);

            // 取平均数
            const avgR = r.reduce((sum, val) => sum + val, 0) / r.length;
            const avgG = g.reduce((sum, val) => sum + val, 0) / g.length;
            const avgB = b.reduce((sum, val) => sum + val, 0) / b.length;

            const color = `rgba(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)}, 0.5)`;

            imgElement.style.boxShadow = `0 4px 8px ${color}`;
        } catch (e) {
            if (e.name === 'SecurityError') {
                console.warn('无法从跨域图片提取颜色，使用默认黑色阴影。');
                imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
            } else {
                console.error('图片颜色提取失败:', e);
                imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
            }
        }
    };

    imgElement.onerror = () => {
        if (!imgElement.dataset.fallbackApplied) {
            imgElement.dataset.fallbackApplied = 'true';
            imgElement.src = FALLBACK_IMAGE_DATA_URI;
            return;
        }
        console.error('图片加载失败，使用默认黑色阴影。');
        imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    };
}

function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = 'v-card';

    const img = document.createElement('img');
    img.referrerPolicy = 'no-referrer';
    // 移除 crossOrigin 以避免不支持 CORS 的服务器阻塞图片加载
    // img.crossOrigin = 'anonymous';
    img.src = cardData.image;
    img.alt = cardData.alt;
    card.appendChild(img);

    applyImageShadow(img); // 调用封装的方法

    const titleText = document.createElement('div');
    titleText.className = 'card-text';
    titleText.style.whiteSpace = 'pre-wrap';
    titleText.textContent = cardData.title_text;
    card.appendChild(titleText);

    const comment = document.createElement('div');
    comment.className = 'card-text';
    comment.style.whiteSpace = 'pre-wrap';
    comment.textContent = cardData.comment;
    card.appendChild(comment);

    return card;
}

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.body;

    fetch('asstes2/page2_data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(sectionData => {
                const section = document.createElement('section');
                section.className = 'card-section';

                const title = document.createElement('h2');
                title.textContent = sectionData.title;
                section.appendChild(title);

                const container = document.createElement('div');
                container.className = 'card-container';

                sectionData.cards.forEach(cardData => {
                    const card = createCardElement(cardData);
                    container.appendChild(card);
                });

                section.appendChild(container);
                mainContainer.appendChild(section);
            });
        })
        .catch(error => {
            console.error('Error fetching page 2 data:', error);
            alert('加载页面2数据失败，请检查控制台或文件路径。');
        });
});