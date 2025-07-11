document.addEventListener('DOMContentLoaded', () => {
    const formatBtn = document.getElementById('formatBtn');
    const outputDiv = document.getElementById('output');

    formatBtn.addEventListener('click', () => {
        const imageUrl = document.getElementById('imageUrl').value;
        const altName = document.getElementById('altName').value;
        const title = document.getElementById('title').value;
        const artist = document.getElementById('artist').value;
        const sequence = document.getElementById('sequence').value;
        const album = document.getElementById('album').value;
        const year = document.getElementById('year').value;
        const comment = document.getElementById('comment').value;

        let titleText = `${title}\n${artist}`;
        if (sequence !== "0" && sequence !== "") {
            titleText += `\n#${sequence}, ${album} (${year})`;
        } else {
            titleText += `\n${album} (${year})`;
        }

        const cardRecord = {
            "image": imageUrl,
            "alt": altName,
            "title_text": titleText,
            "comment": comment
        };

        outputDiv.textContent = JSON.stringify(cardRecord, null, 2);
    });

    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputDiv.textContent)
            .then(() => {
                //alert('内容已复制到剪贴板！');
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制。');
            });
    });
});