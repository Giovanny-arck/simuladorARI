// Taxas do simulador
const taxaPrazo = {
    18: { mensal: 0.015, final: 0.015 },
    24: { mensal: 0.016, final: 0.016 },
    36: { mensal: 0.018, final: 0.018 }
};
const taxaExtra = [
    { min: 20000, max: 99999.99, extra: 0.000 },
    { min: 100000, max: 199999.99, extra: 0.003 },
    { min: 200000, max: 399999.99, extra: 0.005 },
    { min: 400000, max: Infinity, extra: 0.007 }
];
const taxaAdicionalFinal = 0.005;

// Variáveis de estado
let formaSelecionada = null;
let prazoSelecionado = null;
let valorInvestido = 0;

// --- LÓGICA DE FORMATAÇÃO ---
function desformatarMoeda(valorString) {
    if (!valorString) return 0;
    const apenasNumeros = valorString.replace(/\D/g, '');
    if (apenasNumeros === '') return 0;
    return parseFloat(apenasNumeros) / 100;
}

function formatarMoeda(valorNumerico, ignorarMinimo = false) {
    if (isNaN(valorNumerico) || valorNumerico <= 0) return '-';
    if (ignorarMinimo) {
        return valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    if (valorNumerico < 20000) return '-';
    return valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// --- FUNÇÃO PARA RESETAR A TABELA ---
function resetarTabelaParaPlaceholders() {
    const tbody = document.getElementById('resBody');
    const thead = document.getElementById('resultado-head');
    
    if (formaSelecionada === 'final') {
        thead.innerHTML = `<tr><th>Prazo</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        tbody.innerHTML = `
            <tr><td>18 meses</td><td>-</td><td>-</td></tr>
            <tr><td>24 meses</td><td>-</td><td>-</td></tr>
            <tr><td>36 meses</td><td>-</td><td>-</td></tr>
        `;
    } else {
        thead.innerHTML = `<tr><th>Prazo</th><th>Rendimento Mensal (R$)</th><th>Retorno no Fim do Contrato</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        tbody.innerHTML = `
            <tr><td>18 meses</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
            <tr><td>24 meses</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
            <tr><td>36 meses</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
        `;
    }

    // Esconde as seções seguintes
    document.getElementById('dados-cliente-section').style.display = 'none';
    document.getElementById('terms-section').style.display = 'none';
    document.getElementById('btn-enviar').style.display = 'none';
    document.querySelectorAll('.prazo-btn').forEach(btn => btn.classList.remove('selected'));
    prazoSelecionado = null;
}

// --- INICIALIZAÇÃO E EVENTOS ---
document.addEventListener('DOMContentLoaded', function() {
    formaSelecionada = 'final';
    document.getElementById('btn-final').classList.add('selected');

    const valorInput = document.getElementById('valor');
    valorInput.addEventListener('focus', () => {
        valorInput.value = '';
        valorInput.placeholder = 'Selecione ou digite um valor';
    });
    valorInput.addEventListener('blur', () => {
        valorInput.value = valorInvestido >= 20000 ? formatarMoeda(valorInvestido) : '';
        valorInput.placeholder = 'Digite ou selecione';
    });
    valorInput.addEventListener('input', () => {
        const valorNumerico = desformatarMoeda(valorInput.value);
        valorInvestido = !isNaN(valorNumerico) && valorNumerico > 0 ? valorNumerico : 0;
        if (valorInvestido >= 20000) {
            calcular();
        } else {
            resetarTabelaParaPlaceholders();
        }
    });

    // Event listener para os campos do cliente
    const camposCliente = document.querySelectorAll('#dados-cliente-section input');
    camposCliente.forEach(campo => {
        campo.addEventListener('input', () => { validarCampo(campo); validarDadosCliente(); });
        campo.addEventListener('blur', () => { validarCampo(campo); validarDadosCliente(); });
    });

    // Event listener para o novo checkbox
    document.getElementById('terms-checkbox').addEventListener('change', validarDadosCliente);
});

// --- FUNÇÕES DE VALIDAÇÃO E FLUXO ---
function validarDadosCliente() {
    const clientePreenchido = document.getElementById('cliente').value.trim() !== '';
    const emailPreenchido = document.getElementById('email').value.trim() !== '';
    const profissaoPreenchida = document.getElementById('profissao').value.trim() !== '';
    const contatoValor = document.getElementById('contato').value.trim();
    const numerosContato = contatoValor.replace(/\D/g, '');
    const termsChecked = document.getElementById('terms-checkbox').checked; // Validação do checkbox
    let contatoValido = false;

    const contatoErro = document.getElementById('contato-erro');
    if (contatoValor === '') {
        contatoErro.style.display = 'none';
        contatoValido = false;
    } else if (numerosContato.length >= 10) {
        contatoErro.style.display = 'none';
        contatoValido = true;
    } else {
        contatoErro.style.display = 'block';
        contatoValido = false;
    }

    // Adiciona a verificação do checkbox à condição final
    const todosValidos = clientePreenchido && emailPreenchido && profissaoPreenchida && contatoValido && termsChecked;
    document.getElementById('btn-enviar').disabled = !todosValidos;
    return todosValidos;
}

function validarCampo(campo) {
    if (!campo.value.trim()) {
        campo.style.borderColor = 'red';
        return false;
    } else {
        if (campo.id !== 'contato') {
            campo.style.borderColor = '#ccc';
        }
        return true;
    }
}

function validarFormulario() {
    // A função validarDadosCliente agora checa tudo (campos + checkbox)
    if (!validarDadosCliente()) {
        alert("Por favor, preencha todos os dados do cliente e aceite os termos para continuar.");
        return false;
    }
    if (!formaSelecionada || !prazoSelecionado || valorInvestido < 20000) {
        alert("Por favor, preencha todos os dados do investimento (valor, forma e prazo).");
        return false;
    }
    return true;
}

// --- FUNÇÕES DO SIMULADOR ---
function selecionarForma(forma) {
    formaSelecionada = forma;
    document.querySelectorAll('.recebimento-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`btn-${forma}`).classList.add('selected');

    document.getElementById('texto-explicativo-mensal').style.display = (forma === 'mensal') ? 'block' : 'none';
    document.getElementById('texto-explicativo-final').style.display = (forma === 'final') ? 'block' : 'none';
    
    if (valorInvestido >= 20000) {
        calcular();
    } else {
        resetarTabelaParaPlaceholders();
    }
}

function selecionarPrazo(prazo) {
    prazoSelecionado = prazo;
    document.querySelectorAll('.prazo-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.prazo-btn').forEach(btn => {
        if (btn.textContent.includes(prazo)) {
            btn.classList.add('selected');
        }
    });

    // Mostra a seção de cliente, termos e o botão de enviar
    document.getElementById('dados-cliente-section').style.display = 'block';
    document.getElementById('terms-section').style.display = 'block';
    document.getElementById('btn-enviar').style.display = 'block';
}

function obterTaxaExtraPorValor(valor) {
    for (let faixa of taxaExtra) {
        if (valor >= faixa.min && valor <= faixa.max) {
            return faixa.extra;
        }
    }
    return 0;
}

function calcular() {
    if (!formaSelecionada) return;
    if (valorInvestido < 20000) {
        resetarTabelaParaPlaceholders();
        return;
    }
    
    let tbody = document.getElementById('resBody');
    let thead = document.getElementById('resultado-head');
    tbody.innerHTML = "";
    
    if (formaSelecionada === 'mensal') {
        thead.innerHTML = `<tr><th>Prazo</th><th>Rendimento Mensal (R$)</th><th>Retorno no Fim do Contrato</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        [18, 24, 36].forEach(prazo => {
            const taxaBase = taxaPrazo[prazo].mensal;
            let taxaAdicional = (valorInvestido >= 100000) ? obterTaxaExtraPorValor(valorInvestido) : 0;
            const taxaTotal = taxaBase + taxaAdicional;
            const rendimentoMensal = valorInvestido * taxaTotal;
            const retornoTotal = valorInvestido + (rendimentoMensal * prazo);
            const taxaFormatada = (taxaTotal > 0) ? `${(taxaTotal * 100).toFixed(2).replace('.', ',')}%` : '-';
            tbody.innerHTML += `<tr><td>${prazo} meses</td><td>${formatarMoeda(rendimentoMensal, true)}</td><td>${formatarMoeda(valorInvestido)}</td><td>${formatarMoeda(retornoTotal, true)}</td><td>${taxaFormatada}</td></tr>`;
        });
    } else {
        thead.innerHTML = `<tr><th>Prazo</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        [18, 24, 36].forEach(prazo => {
            const taxaBase = taxaPrazo[prazo].final;
            const taxaExtraValor = obterTaxaExtraPorValor(valorInvestido);
            const taxaTotal = taxaBase + taxaAdicionalFinal + taxaExtraValor;
            const jurosTotais = (valorInvestido * taxaTotal) * prazo;
            const retornoTotal = valorInvestido + jurosTotais;
            const taxaFormatada = (taxaTotal > 0) ? `${(taxaTotal * 100).toFixed(2).replace('.', ',')}%` : '-';
            tbody.innerHTML += `<tr><td>${prazo} meses</td><td>${formatarMoeda(retornoTotal, true)}</td><td>${taxaFormatada}</td></tr>`;
        });
    }
}

async function enviarProposta() {
    if (!validarFormulario()) return;
    
    try {
        const contatoRaw = document.getElementById('contato').value;
        const numeros = contatoRaw.replace(/\D/g, '');
        let contatoFormatado;
        if (numeros.startsWith('55') && (numeros.length === 12 || numeros.length === 13)) {
            contatoFormatado = '+' + numeros;
        } else {
            contatoFormatado = '+55' + numeros;
        }

        const dados = {
            cliente: document.getElementById('cliente').value,
            email: document.getElementById('email').value,
            profissao: document.getElementById('profissao').value,
            contato: contatoFormatado,
            valor: valorInvestido,
            forma: formaSelecionada,
            prazo: prazoSelecionado,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch('https://n8nwebhook.arck1pro.shop/webhook/simulador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            alert('Proposta enviada com sucesso!');
        } else {
            alert('Erro ao enviar proposta. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar proposta. Verifique sua conexão e tente novamente.');
    }
}