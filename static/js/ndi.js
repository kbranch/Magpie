"use strict"

function snapMap() {
    // html2canvas(, { "allowTaint": true }).then(canvas => {
    //     let data = canvas.toDataURL('image/png');

    // });

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
    htmlToImage.toPng(document.querySelector(".item-container"), { filter: nodeFilter })
        .then(function (dataUrl) {
            $.ajax({
                type: "POST",
                url: "/itemsNdi",
                data: {
                    data: dataUrl,
                },
            });
        })
        .catch(function (error) {
            console.error('Error snapping item image', error);
        });
    // html2canvas(document.querySelector("#itemContainer")).then(canvas => {
    //     let data = canvas.toDataURL('image/png');

    // });
}