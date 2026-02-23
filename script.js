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
let formaSelecionada = 'final'; 
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
            <tr><td data-label="Prazo">18 meses</td><td data-label="Retorno Total">-</td><td data-label="Taxa Efetiva a.m.">-</td></tr>
            <tr><td data-label="Prazo">24 meses</td><td data-label="Retorno Total">-</td><td data-label="Taxa Efetiva a.m.">-</td></tr>
            <tr><td data-label="Prazo">36 meses</td><td data-label="Retorno Total">-</td><td data-label="Taxa Efetiva a.m.">-</td></tr>
        `;
    } else { 
        thead.innerHTML = `<tr><th>Prazo</th><th>Rendimento Mensal (R$)</th><th>Retorno no Fim do Contrato</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        tbody.innerHTML = `
            <tr><td data-label="Prazo">18 meses</td><td data-label="Rendimento Mensal (R$)">-</td><td data-label="Retorno no Fim do Contrato">-</td><td data-label="Retorno Total">-</td><td data-label="Taxa Efetiva a.m.">-</td></tr>
            <tr><td data-label="Prazo">24 meses</td><td data-label="Rendimento Mensal (R$)">-</td><td data-label="Retorno no Fim do Contrato">-</td><td data-label="Retorno Total">-</td><td data-label="Taxa Efetiva a.m.">-</td></tr>
            <tr><td data-label="Prazo">36 meses</td><td data-label="Rendimento Mensal (R$)">-</td><td data-label="Retorno no Fim do Contrato">-</td><td data-label="Retorno Total">-</td><td data-label="Taxa Efetiva a.m.">-</td></tr>
        `;
    }

    document.getElementById('dados-cliente-section').style.display = 'none';
    document.getElementById('terms-section').style.display = 'none';
    document.getElementById('btn-enviar').style.display = 'none';
    document.querySelectorAll('.prazo-btn').forEach(btn => btn.classList.remove('selected'));
    prazoSelecionado = null;
}

// --- INICIALIZAÇÃO E EVENTOS ---
document.addEventListener('DOMContentLoaded', function() {
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

    const camposCliente = document.querySelectorAll('#dados-cliente-section input');
    camposCliente.forEach(campo => {
        campo.addEventListener('input', () => { validarCampo(campo); validarDadosCliente(); });
        campo.addEventListener('blur', () => { validarCampo(campo); validarDadosCliente(); });
    });

    document.getElementById('terms-checkbox').addEventListener('change', validarDadosCliente);

    document.getElementById('investment-form').addEventListener('submit', function(event) {
        event.preventDefault();
        enviarProposta();
    });
});

// --- FUNÇÕES DE SELEÇÃO ---

function selecionarForma(forma) {
    formaSelecionada = forma;
    document.querySelectorAll('.recebimento-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`btn-${forma}`).classList.add('selected');
    
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

    document.getElementById('dados-cliente-section').style.display = 'block';
    document.getElementById('terms-section').style.display = 'block';
    document.getElementById('btn-enviar').style.display = 'block';
}

// --- FUNÇÕES DE CÁLCULO ---

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
    
    // Desconto fixo de 0.5% (0.005) conforme mudança de plano
    const redutorAutomatico = 0.005;

    if (formaSelecionada === 'mensal') {
        thead.innerHTML = `<tr><th>Prazo</th><th>Rendimento Mensal (R$)</th><th>Retorno no Fim do Contrato</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        [18, 24, 36].forEach(prazo => {
            const taxaBase = taxaPrazo[prazo].mensal;
            let taxaAdicional = (valorInvestido >= 100000) ? obterTaxaExtraPorValor(valorInvestido) : 0;
            
            // Taxa Total com redutor aplicado automaticamente
            const taxaTotal = (taxaBase + taxaAdicional) - redutorAutomatico;
            
            const rendimentoMensal = valorInvestido * taxaTotal;
            const retornoTotal = valorInvestido + (rendimentoMensal * prazo);
            const taxaFormatada = (taxaTotal > -100) ? `${(taxaTotal * 100).toFixed(2).replace('.', ',')}%` : '-';

            tbody.innerHTML += `
                <tr>
                    <td data-label="Prazo">${prazo} meses</td>
                    <td data-label="Rendimento Mensal (R$)">${formatarMoeda(rendimentoMensal, true)}</td>
                    <td data-label="Retorno no Fim do Contrato">${formatarMoeda(valorInvestido)}</td>
                    <td data-label="Retorno Total">${formatarMoeda(retornoTotal, true)}</td>
                    <td data-label="Taxa Efetiva a.m.">${taxaFormatada}</td>
                </tr>`;
        });
    } else {
        thead.innerHTML = `<tr><th>Prazo</th><th>Retorno Total</th><th>Taxa Efetiva a.m.</th></tr>`;
        [18, 24, 36].forEach(prazo => {
            const taxaBase = taxaPrazo[prazo].final;
            const taxaExtraValor = obterTaxaExtraPorValor(valorInvestido);
            
            // Taxa Total com redutor aplicado automaticamente
            const taxaTotal = (taxaBase + taxaAdicionalFinal + taxaExtraValor) - redutorAutomatico;
            
            const jurosTotais = (valorInvestido * taxaTotal) * prazo;
            const retornoTotal = valorInvestido + jurosTotais;
            const taxaFormatada = (taxaTotal > -100) ? `${(taxaTotal * 100).toFixed(2).replace('.', ',')}%` : '-';

            tbody.innerHTML += `
                <tr>
                    <td data-label="Prazo">${prazo} meses</td>
                    <td data-label="Retorno Total">${formatarMoeda(retornoTotal, true)}</td>
                    <td data-label="Taxa Efetiva a.m.">${taxaFormatada}</td>
                </tr>`;
        });
    }
}

// --- VALIDAÇÕES E ENVIO ---

function validarDadosCliente() {
    const clientePreenchido = document.getElementById('cliente').value.trim() !== '';
    const emailPreenchido = document.getElementById('email').value.trim() !== '';
    const profissaoPreenchida = document.getElementById('profissao').value.trim() !== '';
    const contatoValor = document.getElementById('contato').value.trim();
    const numerosContato = contatoValor.replace(/\D/g, '');
    const termsChecked = document.getElementById('terms-checkbox').checked;
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
        
        const webhookUrl1 = 'https://n8nwebhook.arck1pro.shop/webhook/simulador';
        const webhookUrl2 = 'https://n8nwebhook.arck1pro.shop/webhook/simulador-rd-mkt';

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        };

        const promise1 = fetch(webhookUrl1, requestOptions);
        const promise2 = fetch(webhookUrl2, requestOptions);

        const results = await Promise.allSettled([promise1, promise2]);
        const success = results.some(result => result.status === 'fulfilled' && result.value.ok);

        if (success) {
            alert('Proposta enviada com sucesso!');
        } else {
            alert('Erro ao enviar proposta. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro geral ao enviar proposta:', error);
        alert('Erro ao enviar proposta. Verifique sua conexão e tente novamente.');
    }
}