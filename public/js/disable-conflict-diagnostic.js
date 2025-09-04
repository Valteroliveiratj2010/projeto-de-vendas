// ===== DESABILITAR DIAGNÓSTICO DE CONFLITOS =====
console.log('🔇 DESABILITANDO DIAGNÓSTICO DE CONFLITOS...');

// Desabilitar relatórios de conflitos
if (window.headerDiagnostic) {
    // Sobrescrever método de criação de relatório
    window.headerDiagnostic.createConflictReport = function () {
        console.log('🔇 Relatório de conflitos desabilitado');
        return;
    };
}

// Remover caixas de conflitos existentes
function removeConflictBoxes() {
    const conflictBoxes = document.querySelectorAll('div[style*="CONFLITOS DETECTADOS"]');
    conflictBoxes.forEach(box => {
        box.remove();
        console.log('🧹 Caixa de conflitos removida');
    });

    // Remover relatórios de conflitos
    const reports = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
    reports.forEach(report => {
        if (report.textContent.includes('CONFLITOS DETECTADOS')) {
            report.remove();
            console.log('🧹 Relatório de conflitos removido');
        }
    });
}

// Executar limpeza imediatamente
removeConflictBoxes();

// Executar limpeza periodicamente
setInterval(removeConflictBoxes, 2000);

console.log('✅ Diagnóstico de conflitos desabilitado!');
console.log('🧹 Caixas de conflitos serão removidas automaticamente'); 