"use strict"

function snapMap() {
    htmlToImage.toPng(document.querySelector(".map-container.active"))
        .then(function (dataUrl) {
            $.ajax({
                type: "POST",
                url: "/mapNdi",
                data: {
                    data: dataUrl,
                },
            });
        })
        .catch(function (error) {
            console.error('Error snapping map image', error);
        });
}

function nodeFilter(node) {
    return !['navbar', 'quicksettings', 'quickTabs'].includes(node.id);
}

function snapItems() {
    // We don't want hover effects in the snapshot
    let glows = document.querySelectorAll('.glow');
    glows.forEach(x => x.classList.remove('glow'));

    htmlToImage.toPng(document.querySelector("#itemContainer"), { filter: nodeFilter, style: {"pointer-events": "none"} })
        .then(function (dataUrl) {
            $.ajax({
                type: "POST",
                url: "/itemsNdi",
                data: {
                    data: dataUrl,
                },
            });

            glows.forEach(x => x.classList.add('glow'));
        })
        .catch(function (error) {
            console.error('Error snapping item image', error);
        });
}