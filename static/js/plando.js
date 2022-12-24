function exportPlando() {
    let plan = '';

    for (const checkId in checkContents) {
        plan += `Location:${checkId}:${checkContents[checkId]}\n`;
    }

    download('plando.txt', plan);
}