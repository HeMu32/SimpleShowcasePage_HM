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
        console.error('图片加载失败，使用默认黑色阴影。');
        imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    };
}

function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = 'card-component';

    const img = document.createElement('img');
    img.src = cardData.image;
    img.alt = cardData.alt;
    card.appendChild(img);

    applyImageShadow(img); // 调用封装的方法

    const textWrapper = document.createElement('div');
    textWrapper.className = 'text-wrapper';

    const titleText = document.createElement('div');
    titleText.className = 'text-content';
    
    const title = `<strong>${cardData.title}</strong>`;
    const artist = cardData.artist;
    
    let line3 = '';
    if (cardData.trkno > 0) {
        line3 += `#${cardData.trkno}, `;
    }
    line3 += `<i>${cardData.album}</i> (${cardData.year})`;

    titleText.innerHTML = `<div>${title}</div><div>${artist}</div><div>${line3}</div>`;
    textWrapper.appendChild(titleText);

    const comment = document.createElement('div');
    comment.className = 'text-content';
    comment.style.whiteSpace = 'pre-wrap';
    comment.textContent = cardData.comment;
    textWrapper.appendChild(comment);

    card.appendChild(textWrapper);
    return card;
}

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.body;

    fetch('asstes/list_index.json')
        .then(response => response.json())
        .then(urls => {
            const promises = urls.map(url => fetch('asstes/' + url).then(r => r.json()));
            return Promise.all(promises);
        })
        .then(jsons => {
            const data = jsons.flat();
            data.forEach(sectionData => {
                const section = document.createElement('section');
                section.className = 'card-section';

                const title = document.createElement('h2');
                title.textContent = sectionData.title;
                section.appendChild(title);

                const container = document.createElement('div');
                container.className = 'container';

                sectionData.cards.forEach(cardData => {
                    const card = createCardElement(cardData);
                    container.appendChild(card);
                });

                section.appendChild(container);
                mainContainer.appendChild(section);
            });
        })
        .catch(error => {
            console.error('Error fetching page 1 data:', error);
            alert('加载页面1数据失败，请检查控制台或文件路径。');
        });
});