// ===== CORREÇÃO SEGURA DO BOTÃO SIDEBAR-TOGGLE =====
console.log('🔧 CORREÇÃO SEGURA DO BOTÃO SIDEBAR-TOGGLE...');

class SafeSidebarToggleFix {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Inicializando correção segura...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAndFix());
        } else {
            this.checkAndFix();
        }
    }

    checkAndFix() {
        console.log('🔧 Verificando botão sidebar-toggle...');

        // Verificar se o botão existe
        let sidebarToggle = document.getElementById('sidebar-toggle');

        if (!sidebarToggle) {
            console.log('❌ Botão sidebar-toggle não encontrado, verificando top-bar...');
            this.checkTopBar();
        } else {
            console.log('✅ Botão sidebar-toggle encontrado');
            this.ensureFunctionality(sidebarToggle);
        }
    }

    checkTopBar() {
        const topBar = document.querySelector('.top-bar');
        if (!topBar) {
            console.log('❌ Top-bar não encontrado, criando botão simples...');
            this.createSimpleButton();
        } else {
            console.log('✅ Top-bar encontrado, verificando conteúdo...');
            this.checkTopBarContent(topBar);
        }
    }

    checkTopBarContent(topBar) {
        // Verificar se há botão dentro do top-bar
        const buttonInTopBar = topBar.querySelector('#sidebar-toggle');
        if (!buttonInTopBar) {
            console.log('❌ Botão não encontrado no top-bar, criando...');
            this.createButtonInTopBar(topBar);
        } else {
            console.log('✅ Botão encontrado no top-bar');
            this.ensureFunctionality(buttonInTopBar);
        }
    }

    createButtonInTopBar(topBar) {
        console.log('🔧 Criando botão no top-bar existente...');

        // Criar botão
        const button = document.createElement('button');
        button.id = 'sidebar-toggle';
        button.className = 'sidebar-toggle';
        button.setAttribute('aria-label', 'Abrir/Fechar Menu');
        button.setAttribute('aria-expanded', 'false');

        // Adicionar ícone
        button.innerHTML = '<i class="fas fa-bars"></i>';

        // Inserir no top-bar
        const topBarLeft = topBar.querySelector('.top-bar-left');
        if (topBarLeft) {
            topBarLeft.insertBefore(button, topBarLeft.firstChild);
        } else {
            topBar.insertBefore(button, topBar.firstChild);
        }

        console.log('✅ Botão criado no top-bar');
        this.ensureFunctionality(button);
    }

    createSimpleButton() {
        console.log('🔧 Criando botão simples...');

        // Criar botão
        const button = document.createElement('button');
        button.id = 'sidebar-toggle';
        button.className = 'sidebar-toggle';
        button.setAttribute('aria-label', 'Abrir/Fechar Menu');
        button.setAttribute('aria-expanded', 'false');

        // Adicionar ícone
        button.innerHTML = '<i class="fas fa-bars"></i>';

        // Adicionar estilos básicos
        button.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: #2563EB;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px;
            cursor: pointer;
            font-size: 16px;
        `;

        // Adicionar ao body
        document.body.appendChild(button);

        console.log('✅ Botão simples criado');
        this.ensureFunctionality(button);
    }

    ensureFunctionality(button) {
        console.log('🔧 Garantindo funcionalidade do botão...');

        // Verificar se já tem event listener
        const hasListener = button._hasClickListener;
        if (hasListener) {
            console.log('✅ Botão já tem funcionalidade');
            return;
        }

        // Adicionar event listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🍔 Botão sidebar-toggle clicado');

            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const isOpen = sidebar.classList.contains('open');
                sidebar.classList.toggle('open');

                // Atualizar atributos de acessibilidade
                button.setAttribute('aria-expanded', !isOpen);

                // Adicionar/remover classe de estado
                if (sidebar.classList.contains('open')) {
                    button.classList.add('active');
                    console.log('✅ Sidebar aberta');
                } else {
                    button.classList.remove('active');
                    console.log('❌ Sidebar fechada');
                }
            }
        });

        // Marcar como configurado
        button._hasClickListener = true;

        console.log('✅ Funcionalidade do botão configurada');
    }
}

// Inicializar correção segura
const safeSidebarToggleFix = new SafeSidebarToggleFix();

console.log('✅ Correção segura do botão sidebar-toggle inicializada!'); 