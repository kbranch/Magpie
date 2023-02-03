function exportPlando() {
    let plan = '';

    for (const checkId in checkContents) {
        if (coordDict[checkId].vanilla) {
            continue;
        }

        plan += `Location:${checkId}:${checkContents[checkId]}\n`;
    }

    download('plando.txt', plan);
}