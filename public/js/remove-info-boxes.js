// ===== REMOÇÃO AGESSIVA DE CAIXAS INFORMATIVAS =====
console.log('🧹 REMOVENDO TODAS AS CAIXAS INFORMATIVAS...');

function removeAllInfoBoxes() {
    // Remover caixas de conflitos
    const conflictBoxes = document.querySelectorAll('div[style*="CONFLITOS DETECTADOS"]');
    conflictBoxes.forEach(box => box.remove());

    // Remover relatórios de diagnóstico
    const diagnosticReports = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
    diagnosticReports.forEach(report => report.remove());

    // Remover mensagens de sucesso
    const successMessages = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10002"]');
    successMessages.forEach(msg => msg.remove());

    // Remover documentação
    const documentationBoxes = document.querySelectorAll('div[style*="Documentação dos Headers"]');
    documentationBoxes.forEach(doc => doc.remove());

    // Remover qualquer div com z-index alto
    const highZIndexDivs = document.querySelectorAll('div[style*="z-index: 1000"], div[style*="z-index: 10000"], div[style*="z-index: 10001"], div[style*="z-index: 10002"]');
    highZIndexDivs.forEach(div => {
        if (div.textContent.includes('CONFLITOS') ||
            div.textContent.includes('Documentação') ||
            div.textContent.includes('Sucesso') ||
            div.textContent.includes('Diagnóstico')) {
            div.remove();
        }
    });
}

// Executar imediatamente
removeAllInfoBoxes();

// Executar a cada 1 segundo
setInterval(removeAllInfoBoxes, 1000);

console.log('✅ Remoção agressiva de caixas informativas ativada!'); 