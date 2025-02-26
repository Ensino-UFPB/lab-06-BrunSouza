export function valida(input) {
    const tipoDeInput = input.dataset.tipo

    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input)
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo de nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo de email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    tel: {
        valueMissing: 'O campo de telefone não pode estar vazio.',
        customError: 'O telefone digitado não é válido. Utilize um formato válido'
    },
    instagram: {
        valueMissing: 'O campo de Instagram não pode estar vazio.',
        customError: 'O nome de usuário deve começar com @.'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio.',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio.',
        customError: 'Você deve ser maior que 18 anos para se cadastrar.'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio.',
        customError: 'O CPF digitado não é válido.' 
    },
    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'Não foi possível buscar o CEP.'
    },
    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo de estado não pode estar vazio.'
    }
}

const validadores = {
    dataNascimento:input => validaDataNascimento(input),
    cpf:input => validaCPF(input),
    cep:input => recuperarCEP(input),
    instagram: input => validaInstagram(input),
    tel:input => validaTelefone(input)
}

function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = ''
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]
        }
    })
    
    return mensagem
}

function validaDataNascimento(input) {
    const dataRecebida = new Date(input.value)
    let mensagem = ''

    if(!maiorQue18(dataRecebida)) {
        mensagem = 'Você deve ser maior que 18 anos para se cadastrar.'
    }

    input.setCustomValidity(mensagem)
}

function maiorQue18(data) {
    const dataAtual = new Date()
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

    return dataMais18 <= dataAtual
}

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, '')
    let mensagem = ''

    if(!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
        mensagem = 'O CPF digitado não é válido.'
    }

    input.setCustomValidity(mensagem)
}

function checaCPFRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]
    let cpfValido = true

    valoresRepetidos.forEach(valor => {
        if(valor == cpf) {
            cpfValido = false
        }
    })

    return cpfValido
}

function checaEstruturaCPF(cpf) {
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf, multiplicador) {
    if(multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)
    for(let contador = 0; multiplicadorInicial > 1 ; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1)
    }

    return false
}

function confirmaDigito(soma) {
    return 11 - (soma % 11)
}

function recuperarCEP(input) {
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json/`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url,options).then(
            response => response.json()
        ).then(
            data => {
                if(data.erro) {
                    input.setCustomValidity('Não foi possível buscar o CEP.')
                    return
                }
                input.setCustomValidity('')
                preencheCamposComCEP(data)
                return
            }
        )
    }
}

function preencheCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}

function validaTelefone(input) {
    const telefone = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    let mensagem = '';

    // Verificar se o campo está vazio
    if (input.validity.valueMissing) {
        mensagem = 'O campo de telefone não pode estar vazio.';
    } else {
        // Validar o tamanho do telefone
        if (telefone.length < 10 || telefone.length > 11) {
            mensagem = 'O telefone digitado não é válido. O número deve ter 10 ou 11 dígitos.';
        } else {
            const regexTelefone = /^(\d{2})\d{4,5}-?\d{4}$/; // Padrão para telefones com DDD
            if (!regexTelefone.test(telefone)) {
                mensagem = 'O telefone digitado não é válido. Utilize um formato válido (ex: 11 91234-5678).';
            } else {
                const ddd = telefone.substring(0, 2);
                if (!validaDDD(ddd)) {
                    mensagem = 'O DDD informado não é válido.';
                }
            }
        }
    }

    input.setCustomValidity(mensagem);
}

function validaDDD(ddd) {
    const dddsValidos = ['11', '12', '13', '14', '15', '16', '17', '18', '19',
                          '21', '22', '24', '27', '28',
                          '31', '32', '33', '34', '35', '37', '38',
                          '41', '42', '43', '44', '45', '46',
                          '47', '48', '49',
                          '51', '53', '54', '55',
                          '61', '62', '64', '65', '66', '67',
                          '68', '69',
                          '71', '73', '74', '75', '77', '79',
                          '81', '82', '83', '84', '85', '86', '87', '88', '89',
                          '91', '92', '93', '94', '95', '96', '97', '98', '99'];
    return dddsValidos.includes(ddd);
}


function validaInstagram(input) {
    let valor = input.value.trim();
    let mensagem = '';

    if (!valor) {
        return;
    }

    if (!valor.startsWith('@')) {
        mensagem = 'O nome de usuário deve começar com @.';
    }

    input.setCustomValidity(mensagem);
}
