/**
 * ✅ Sistema de Validação - Refatorado
 * Validação robusta e centralizada
 */

class Validator {
    constructor() {
        this.rules = {
            // Validação de email
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
                required: true
            },

            // Validação de senha
            password: {
                minLength: 8,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial',
                required: true
            },

            // Validação de senha simples (para desenvolvimento)
            passwordSimple: {
                minLength: 6,
                message: 'Senha deve ter pelo menos 6 caracteres',
                required: true
            },

            // Validação de telefone
            phone: {
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Telefone inválido',
                required: false
            },

            // Validação de CPF
            cpf: {
                pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                message: 'CPF inválido',
                required: false,
                validate: this.validateCPF.bind(this)
            },

            // Validação de CNPJ
            cnpj: {
                pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                message: 'CNPJ inválido',
                required: false,
                validate: this.validateCNPJ.bind(this)
            },

            // Validação de nome
            name: {
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Nome deve ter entre 2 e 100 caracteres e conter apenas letras',
                required: true
            },

            // Validação de endereço
            address: {
                minLength: 10,
                maxLength: 200,
                message: 'Endereço deve ter entre 10 e 200 caracteres',
                required: false
            },

            // Validação de cidade
            city: {
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Cidade deve ter entre 2 e 50 caracteres',
                required: false
            },

            // Validação de CEP
            zipCode: {
                pattern: /^\d{5}-\d{3}$/,
                message: 'CEP deve estar no formato 00000-000',
                required: false
            },

            // Validação de preço
            price: {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: 'Preço deve ser um número válido',
                required: true,
                validate: this.validatePrice.bind(this)
            },

            // Validação de quantidade
            quantity: {
                pattern: /^\d+$/,
                message: 'Quantidade deve ser um número inteiro',
                required: true,
                validate: this.validateQuantity.bind(this)
            },

            // Validação de descrição
            description: {
                minLength: 10,
                maxLength: 500,
                message: 'Descrição deve ter entre 10 e 500 caracteres',
                required: false
            },

            // Validação de código
            code: {
                pattern: /^[A-Z0-9-]+$/,
                message: 'Código deve conter apenas letras maiúsculas, números e hífens',
                required: false
            }
        };
    }

    /**
     * Validar dados contra um schema
     * @param {Object} data - Dados a serem validados
     * @param {Object} schema - Schema de validação
     * @returns {Object} Resultado da validação
     */
    validate(data, schema) {
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // Verificar se é obrigatório
            if (rules.required && !this.hasValue(value)) {
                errors[field] = `${this.capitalizeFirst(field)} é obrigatório`;
                continue;
            }

            // Se não é obrigatório e não tem valor, pular
            if (!this.hasValue(value)) {
                continue;
            }

            // Validar comprimento mínimo
            if (rules.minLength && value.length < rules.minLength) {
                errors[field] = `${this.capitalizeFirst(field)} deve ter pelo menos ${rules.minLength} caracteres`;
                continue;
            }

            // Validar comprimento máximo
            if (rules.maxLength && value.length > rules.maxLength) {
                errors[field] = `${this.capitalizeFirst(field)} deve ter no máximo ${rules.maxLength} caracteres`;
                continue;
            }

            // Validar padrão
            if (rules.pattern && !rules.pattern.test(value)) {
                errors[field] = rules.message || `${this.capitalizeFirst(field)} inválido`;
                continue;
            }

            // Validar função customizada
            if (rules.validate && typeof rules.validate === 'function') {
                const customValidation = rules.validate(value);
                if (!customValidation.isValid) {
                    errors[field] = customValidation.message || rules.message;
                    continue;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Validar um campo específico
     * @param {string} field - Nome do campo
     * @param {*} value - Valor a ser validado
     * @param {string} ruleName - Nome da regra
     * @returns {Object} Resultado da validação
     */
    validateField(field, value, ruleName) {
        const rule = this.rules[ruleName];
        if (!rule) {
            return {
                isValid: false,
                error: `Regra de validação '${ruleName}' não encontrada`
            };
        }

        const result = this.validate({ [field]: value }, { [field]: rule });
        return {
            isValid: result.isValid,
            error: result.errors[field]
        };
    }

    /**
     * Validar CPF
     * @param {string} cpf - CPF a ser validado
     * @returns {Object} Resultado da validação
     */
    validateCPF(cpf) {
        // Remover caracteres não numéricos
        const cleanCPF = cpf.replace(/\D/g, '');

        // Verificar se tem 11 dígitos
        if (cleanCPF.length !== 11) {
            return {
                isValid: false,
                message: 'CPF deve ter 11 dígitos'
            };
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cleanCPF)) {
            return {
                isValid: false,
                message: 'CPF inválido'
            };
        }

        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9))) {
            return {
                isValid: false,
                message: 'CPF inválido'
            };
        }

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(10))) {
            return {
                isValid: false,
                message: 'CPF inválido'
            };
        }

        return {
            isValid: true,
            message: 'CPF válido'
        };
    }

    /**
     * Validar CNPJ
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {Object} Resultado da validação
     */
    validateCNPJ(cnpj) {
        // Remover caracteres não numéricos
        const cleanCNPJ = cnpj.replace(/\D/g, '');

        // Verificar se tem 14 dígitos
        if (cleanCNPJ.length !== 14) {
            return {
                isValid: false,
                message: 'CNPJ deve ter 14 dígitos'
            };
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
            return {
                isValid: false,
                message: 'CNPJ inválido'
            };
        }

        // Validar dígitos verificadores
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(cleanCNPJ.charAt(12))) {
            return {
                isValid: false,
                message: 'CNPJ inválido'
            };
        }

        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
        }
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;

        if (digit2 !== parseInt(cleanCNPJ.charAt(13))) {
            return {
                isValid: false,
                message: 'CNPJ inválido'
            };
        }

        return {
            isValid: true,
            message: 'CNPJ válido'
        };
    }

    /**
     * Validar preço
     * @param {string|number} price - Preço a ser validado
     * @returns {Object} Resultado da validação
     */
    validatePrice(price) {
        const numPrice = parseFloat(price);

        if (isNaN(numPrice)) {
            return {
                isValid: false,
                message: 'Preço deve ser um número válido'
            };
        }

        if (numPrice < 0) {
            return {
                isValid: false,
                message: 'Preço não pode ser negativo'
            };
        }

        if (numPrice > 999999.99) {
            return {
                isValid: false,
                message: 'Preço não pode ser maior que R$ 999.999,99'
            };
        }

        return {
            isValid: true,
            message: 'Preço válido'
        };
    }

    /**
     * Validar quantidade
     * @param {string|number} quantity - Quantidade a ser validada
     * @returns {Object} Resultado da validação
     */
    validateQuantity(quantity) {
        const numQuantity = parseInt(quantity);

        if (isNaN(numQuantity)) {
            return {
                isValid: false,
                message: 'Quantidade deve ser um número inteiro'
            };
        }

        if (numQuantity < 0) {
            return {
                isValid: false,
                message: 'Quantidade não pode ser negativa'
            };
        }

        if (numQuantity > 999999) {
            return {
                isValid: false,
                message: 'Quantidade não pode ser maior que 999.999'
            };
        }

        return {
            isValid: true,
            message: 'Quantidade válida'
        };
    }

    /**
     * Verificar se um valor existe
     * @param {*} value - Valor a ser verificado
     * @returns {boolean} True se o valor existe
     */
    hasValue(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === 'string') {
            return value.trim().length > 0;
        }

        if (typeof value === 'number') {
            return !isNaN(value);
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        return true;
    }

    /**
     * Capitalizar primeira letra
     * @param {string} str - String a ser capitalizada
     * @returns {string} String capitalizada
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Criar schema de validação para formulário
     * @param {Object} fields - Campos do formulário
     * @returns {Object} Schema de validação
     */
    createSchema(fields) {
        const schema = {};

        for (const [fieldName, fieldRules] of Object.entries(fields)) {
            if (typeof fieldRules === 'string') {
                // Se for string, usar regra predefinida
                schema[fieldName] = this.rules[fieldRules];
            } else if (typeof fieldRules === 'object') {
                // Se for objeto, usar regra customizada
                schema[fieldName] = {
                    ...this.rules[fieldRules.rule || 'name'],
                    ...fieldRules
                };
            }
        }

        return schema;
    }

    /**
     * Validar formulário HTML
     * @param {HTMLFormElement} form - Formulário a ser validado
     * @param {Object} schema - Schema de validação
     * @returns {Object} Resultado da validação
     */
    validateForm(form, schema) {
        const formData = {};

        // Coletar dados do formulário
        for (const [fieldName] of Object.keys(schema)) {
            const element = form.querySelector(`[name="${fieldName}"]`);
            if (element) {
                formData[fieldName] = element.value;
            }
        }

        // Validar dados
        return this.validate(formData, schema);
    }

    /**
     * Mostrar erros de validação no formulário
     * @param {HTMLFormElement} form - Formulário
     * @param {Object} errors - Erros de validação
     */
    showFormErrors(form, errors) {
        // Limpar erros anteriores
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));

        // Mostrar novos erros
        for (const [fieldName, errorMessage] of Object.entries(errors)) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                // Adicionar classe de erro
                field.classList.add('field-error');

                // Criar elemento de erro
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = errorMessage;
                errorElement.style.color = '#ef4444';
                errorElement.style.fontSize = '0.875rem';
                errorElement.style.marginTop = '0.25rem';

                // Inserir após o campo
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
        }
    }

    /**
     * Limpar erros de validação do formulário
     * @param {HTMLFormElement} form - Formulário
     */
    clearFormErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    }
}

// Instância global do validador
window.validator = new Validator();

// Exportar para uso global
window.Validator = Validator; 