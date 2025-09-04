/**
 * ✅ Validation - Sistema de Validação
 * Sistema de validação centralizado para formulários
 */

class Validation {
    constructor() {
        this.rules = {
            required: (value) => value !== null && value !== undefined && value !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value),
            cpf: (value) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value),
            cnpj: (value) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value),
            minLength: (value, min) => value && value.length >= min,
            maxLength: (value, max) => value && value.length <= max,
            numeric: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
            positive: (value) => !isNaN(value) && parseFloat(value) > 0,
            url: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            date: (value) => !isNaN(Date.parse(value)),
            futureDate: (value) => {
                const date = new Date(value);
                return date > new Date();
            },
            pastDate: (value) => {
                const date = new Date(value);
                return date < new Date();
            }
        };

        this.messages = {
            required: 'Este campo é obrigatório',
            email: 'Email inválido',
            phone: 'Telefone inválido',
            cpf: 'CPF inválido',
            cnpj: 'CNPJ inválido',
            minLength: 'Mínimo de {min} caracteres',
            maxLength: 'Máximo de {max} caracteres',
            numeric: 'Apenas números',
            positive: 'Valor deve ser positivo',
            url: 'URL inválida',
            date: 'Data inválida',
            futureDate: 'Data deve ser futura',
            pastDate: 'Data deve ser passada'
        };
    }

    /**
     * Validar campo
     */
    validateField(value, rules = []) {
        const errors = [];

        for (const rule of rules) {
            const { type, params = [], message } = rule;

            if (this.rules[type]) {
                const isValid = this.rules[type](value, ...params);

                if (!isValid) {
                    errors.push({
                        type,
                        message: message || this.formatMessage(this.messages[type], params),
                        value
                    });
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validar formulário
     */
    validateForm(formData, schema) {
        const results = {};
        let isValid = true;

        for (const [field, rules] of Object.entries(schema)) {
            const value = formData[field];
            const result = this.validateField(value, rules);

            results[field] = result;

            if (!result.isValid) {
                isValid = false;
            }
        }

        return {
            isValid,
            results,
            errors: this.flattenErrors(results)
        };
    }

    /**
     * Validar objeto
     */
    validateObject(obj, schema) {
        return this.validateForm(obj, schema);
    }

    /**
     * Adicionar regra customizada
     */
    addRule(name, validator, message) {
        this.rules[name] = validator;
        if (message) {
            this.messages[name] = message;
        }
    }

    /**
     * Formatar mensagem
     */
    formatMessage(message, params) {
        let formatted = message;

        params.forEach((param, index) => {
            formatted = formatted.replace(`{${index}}`, param);
        });

        return formatted;
    }

    /**
     * Achatar erros
     */
    flattenErrors(results) {
        const errors = [];

        for (const [field, result] of Object.entries(results)) {
            if (!result.isValid) {
                errors.push({
                    field,
                    errors: result.errors
                });
            }
        }

        return errors;
    }

    /**
     * Validar CPF
     */
    validateCPF(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/[^\d]/g, '');

        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;

        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;

        return parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2;
    }

    /**
     * Validar CNPJ
     */
    validateCNPJ(cnpj) {
        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/[^\d]/g, '');

        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        // Validação do primeiro dígito verificador
        let sum = 0;
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights1[i];
        }

        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;

        // Validação do segundo dígito verificador
        sum = 0;
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights2[i];
        }

        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;

        return parseInt(cnpj.charAt(12)) === digit1 && parseInt(cnpj.charAt(13)) === digit2;
    }

    /**
     * Validar email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validar telefone
     */
    validatePhone(phone) {
        // Remove caracteres não numéricos
        phone = phone.replace(/[^\d]/g, '');

        // Verifica se tem entre 10 e 15 dígitos
        return phone.length >= 10 && phone.length <= 15;
    }

    /**
     * Validar senha
     */
    validatePassword(password, options = {}) {
        const {
            minLength = 8,
            requireUppercase = true,
            requireLowercase = true,
            requireNumbers = true,
            requireSpecialChars = false
        } = options;

        const errors = [];

        if (password.length < minLength) {
            errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
        }

        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Senha deve conter pelo menos uma letra maiúscula');
        }

        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Senha deve conter pelo menos uma letra minúscula');
        }

        if (requireNumbers && !/\d/.test(password)) {
            errors.push('Senha deve conter pelo menos um número');
        }

        if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Senha deve conter pelo menos um caractere especial');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitizar entrada
     */
    sanitize(input, type = 'text') {
        switch (type) {
            case 'email':
                return input.toLowerCase().trim();
            case 'phone':
                return input.replace(/[^\d]/g, '');
            case 'cpf':
                return input.replace(/[^\d]/g, '');
            case 'cnpj':
                return input.replace(/[^\d]/g, '');
            case 'numeric':
                return input.replace(/[^\d.]/g, '');
            case 'text':
            default:
                return input.trim();
        }
    }
}

// Criar instância global
const validation = new Validation();

// Configurar com AppConfig se disponível
if (window.AppConfig) {
    // Adicionar regras customizadas baseadas na configuração
    validation.addRule('minPasswordLength',
        (value) => value && value.length >= (AppConfig.get ? AppConfig.get('validation.minPasswordLength', 8) : 8),
        `Senha deve ter pelo menos ${AppConfig.get ? AppConfig.get('validation.minPasswordLength', 8) : 8} caracteres`
    );
}

// Exportar para uso global
window.Validation = validation;
window.validation = validation;

// Funções de conveniência
window.validateField = (value, rules) => validation.validateField(value, rules);
window.validateForm = (formData, schema) => validation.validateForm(formData, schema);
window.validateObject = (obj, schema) => validation.validateObject(obj, schema);
window.validateEmail = (email) => validation.validateEmail(email);
window.validatePhone = (phone) => validation.validatePhone(phone);
window.validateCPF = (cpf) => validation.validateCPF(cpf);
window.validateCNPJ = (cnpj) => validation.validateCNPJ(cnpj);
window.validatePassword = (password, options) => validation.validatePassword(password, options);
window.sanitize = (input, type) => validation.sanitize(input, type);

console.log('✅ Validation inicializado!');
