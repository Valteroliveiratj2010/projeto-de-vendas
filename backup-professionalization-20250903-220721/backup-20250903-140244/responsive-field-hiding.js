/**
 * 🔧 OCULTAÇÃO RESPONSIVA DE CAMPOS MENOS IMPORTANTES
 * Gerencia a visibilidade de campos em diferentes tamanhos de tela
 */

(function () {
    'use strict';

    console.log('📱 Iniciando sistema de ocultação responsiva de campos...');

    // Configuração dos campos por importância
    const fieldConfig = {
        // Campos sempre visíveis (essenciais)
        essential: ['id', 'nome', 'cliente_nome', 'total', 'preco', 'quantidade', 'estoque', 'acoes'],

        // Campos ocultos em telas médias (≤1024px)
        mediumHidden: ['email', 'telefone', 'observacoes'],

        // Campos ocultos em telas pequenas (≤768px)
        smallHidden: ['endereco', 'cpf_cnpj', 'data_cadastro', 'status'],

        // Campos ocultos em telas muito pequenas (≤480px)
        tinyHidden: ['categoria', 'fornecedor'],

        // Campos ocultos em telas extremamente pequenas (≤360px)
        microHidden: ['descricao', 'preco_unitario'],

        // Exceções por página
        exceptions: {
            'clientes': {
                keepVisible: ['telefone'] // Manter telefone visível em clientes
            },
            'produtos': {
                keepVisible: ['categoria'] // Manter categoria visível em produtos
            },
            'vendas': {
                keepVisible: ['data_venda'] // Manter data de venda visível em vendas
            }
        }
    };

    // Função para aplicar atributos data-field nas tabelas
    function applyDataFields() {
        const tables = document.querySelectorAll('.data-table, .table-container table, table');

        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            const rows = table.querySelectorAll('tbody tr');

            headers.forEach((header, index) => {
                const fieldName = getFieldName(header.textContent.trim());

                // Aplicar data-field no header
                header.setAttribute('data-field', fieldName);

                // Aplicar data-field nas células correspondentes
                rows.forEach(row => {
                    const cell = row.querySelectorAll('td')[index];
                    if (cell) {
                        cell.setAttribute('data-field', fieldName);
                    }
                });
            });

            console.log('✅ Atributos data-field aplicados na tabela:', table);
        });
    }

    // Função para identificar o nome do campo baseado no texto do header
    function getFieldName(headerText) {
        const fieldMap = {
            'ID': 'id',
            'Nº': 'id',
            'Número': 'id',
            'Nome': 'nome',
            'Cliente': 'cliente_nome',
            'Email': 'email',
            'Telefone': 'telefone',
            'Endereço': 'endereco',
            'CPF/CNPJ': 'cpf_cnpj',
            'CPF': 'cpf_cnpj',
            'CNPJ': 'cpf_cnpj',
            'Data Cadastro': 'data_cadastro',
            'Data': 'data_venda',
            'Data Venda': 'data_venda',
            'Total': 'total',
            'Preço': 'preco',
            'Preço Unit.': 'preco_unitario',
            'Quantidade': 'quantidade',
            'Qtd': 'quantidade',
            'Estoque': 'estoque',
            'Categoria': 'categoria',
            'Fornecedor': 'fornecedor',
            'Descrição': 'descricao',
            'Observações': 'observacoes',
            'Status': 'status',
            'Ações': 'acoes',
            'Ação': 'acoes'
        };

        return fieldMap[headerText] || headerText.toLowerCase().replace(/\s+/g, '_');
    }

    // Função para gerenciar a visibilidade dos campos
    function manageFieldVisibility() {
        const currentWidth = window.innerWidth;
        const currentPage = getCurrentPage();

        console.log('📱 Gerenciando visibilidade - Largura:', currentWidth, 'px, Página:', currentPage);

        // Aplicar regras de ocultação baseadas na largura da tela
        if (currentWidth <= 360) {
            hideFields(fieldConfig.microHidden, currentPage);
            hideFields(fieldConfig.tinyHidden, currentPage);
            hideFields(fieldConfig.smallHidden, currentPage);
            hideFields(fieldConfig.mediumHidden, currentPage);
        } else if (currentWidth <= 480) {
            hideFields(fieldConfig.tinyHidden, currentPage);
            hideFields(fieldConfig.smallHidden, currentPage);
            hideFields(fieldConfig.mediumHidden, currentPage);
        } else if (currentWidth <= 768) {
            hideFields(fieldConfig.smallHidden, currentPage);
            hideFields(fieldConfig.mediumHidden, currentPage);
        } else if (currentWidth <= 1024) {
            hideFields(fieldConfig.mediumHidden, currentPage);
        } else {
            // Tela grande - mostrar todos os campos
            showAllFields();
        }

        // Garantir que campos essenciais sempre estejam visíveis
        ensureEssentialFieldsVisible();

        console.log('✅ Visibilidade dos campos gerenciada');
    }

    // Função para ocultar campos específicos
    function hideFields(fieldsToHide, currentPage) {
        fieldsToHide.forEach(field => {
            // Verificar se o campo deve ser mantido visível por exceção
            const exception = fieldConfig.exceptions[currentPage];
            if (exception && exception.keepVisible && exception.keepVisible.includes(field)) {
                console.log('⚠️ Mantendo campo visível por exceção:', field, 'na página:', currentPage);
                return;
            }

            const selectors = [
                `th[data-field="${field}"]`,
                `td[data-field="${field}"]`
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.display = 'none';
                    element.setAttribute('data-hidden', 'true');
                });
            });

            console.log('👁️ Ocultando campo:', field, '- Elementos:', document.querySelectorAll(`[data-field="${field}"]`).length);
        });
    }

    // Função para mostrar todos os campos
    function showAllFields() {
        const hiddenElements = document.querySelectorAll('[data-hidden="true"]');
        hiddenElements.forEach(element => {
            element.style.display = '';
            element.removeAttribute('data-hidden');
        });

        console.log('👁️ Mostrando todos os campos - Elementos:', hiddenElements.length);
    }

    // Função para garantir que campos essenciais sempre estejam visíveis
    function ensureEssentialFieldsVisible() {
        fieldConfig.essential.forEach(field => {
            const selectors = [
                `th[data-field="${field}"]`,
                `td[data-field="${field}"]`
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.display = 'table-cell';
                    element.removeAttribute('data-hidden');
                });
            });
        });
    }

    // Função para identificar a página atual
    function getCurrentPage() {
        const body = document.body;
        const pageAttribute = body.getAttribute('data-page');

        if (pageAttribute) {
            return pageAttribute;
        }

        // Tentar identificar pela URL ou outros indicadores
        const path = window.location.pathname;
        if (path.includes('clientes')) return 'clientes';
        if (path.includes('produtos')) return 'produtos';
        if (path.includes('vendas')) return 'vendas';
        if (path.includes('orcamentos')) return 'orcamentos';
        if (path.includes('relatorios')) return 'relatorios';

        return 'default';
    }

    // Função para adicionar indicador visual de campos ocultos
    function addHiddenFieldsIndicator() {
        const tables = document.querySelectorAll('.data-table, .table-container');

        tables.forEach(table => {
            // Remover indicadores existentes
            const existingIndicator = table.querySelector('.hidden-fields-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            const currentWidth = window.innerWidth;
            let message = '';

            if (currentWidth <= 360) {
                message = 'Visualização compacta - apenas campos essenciais';
            } else if (currentWidth <= 480) {
                message = 'Visualização otimizada para mobile - campos menos importantes ocultados';
            } else if (currentWidth <= 768) {
                message = 'Alguns campos foram ocultados para melhor visualização';
            } else if (currentWidth <= 1024) {
                message = 'Campos secundários ocultados em telas médias';
            }

            if (message) {
                const indicator = document.createElement('div');
                indicator.className = 'hidden-fields-indicator';
                indicator.style.cssText = `
                    background: #f3f4f6;
                    color: #6b7280;
                    padding: 8px 12px;
                    font-size: 12px;
                    text-align: center;
                    border-radius: 4px;
                    margin-bottom: 8px;
                    border: 1px solid #e5e7eb;
                    font-family: inherit;
                `;
                indicator.textContent = message;

                table.insertBefore(indicator, table.firstChild);
            }
        });
    }

    // Função principal para inicializar o sistema
    function initResponsiveFieldHiding() {
        console.log('🚀 Inicializando sistema de ocultação responsiva...');

        // Aplicar atributos data-field
        applyDataFields();

        // Gerenciar visibilidade inicial
        manageFieldVisibility();

        // Adicionar indicador visual
        addHiddenFieldsIndicator();

        console.log('✅ Sistema de ocultação responsiva inicializado!');
    }

    // Event listeners
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            manageFieldVisibility();
            addHiddenFieldsIndicator();
        }, 100);
    });

    // Observar mudanças no DOM para aplicar em novas tabelas
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const hasNewTables = Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && (
                        node.classList.contains('data-table') ||
                        node.classList.contains('table-container') ||
                        node.querySelector('.data-table') ||
                        node.querySelector('.table-container')
                    );
                });

                if (hasNewTables) {
                    console.log('🔄 Novas tabelas detectadas, aplicando sistema...');
                    setTimeout(function () {
                        applyDataFields();
                        manageFieldVisibility();
                        addHiddenFieldsIndicator();
                    }, 50);
                }
            }
        });
    });

    // Iniciar observação
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Aplicar periodicamente para garantir persistência
    setInterval(function () {
        applyDataFields();
        manageFieldVisibility();
        addHiddenFieldsIndicator();
    }, 3000);

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResponsiveFieldHiding);
    } else {
        initResponsiveFieldHiding();
    }

    // Expor funções globalmente para debug
    window.responsiveFieldHiding = {
        applyDataFields,
        manageFieldVisibility,
        addHiddenFieldsIndicator,
        getCurrentPage,
        fieldConfig
    };

    console.log('📱 Sistema de ocultação responsiva configurado e pronto!');

})(); 