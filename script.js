// Taxas atualizadas conforme a nova tabela da imagem

// Rendimento 1: Taxas base por prazo
const taxaPrazo = {
    18: { mensal: 0.015, final: 0.015 }, // 1,50%
    24: { mensal: 0.016, final: 0.016 }, // 1,60%
    36: { mensal: 0.018, final: 0.018 }  // 1,80%
};

// Rendimento 3: Taxas adicionais por faixa de valor
const taxaExtra = [
    { min: 20000, max: 99999.99, extra: 0.000 },   // 0,0%
    { min: 100000, max: 199999.99, extra: 0.003 }, // 0,3%
    { min: 200000, max: 399999.99, extra: 0.005 }, // 0,5%
    { min: 400000, max: Infinity, extra: 0.007 }   // 0,7%
];

// Rendimento 2: Taxa adicional para "Juros Final"
const taxaAdicionalFinal = 0.005; // 0,50%

let formaSelecionada = null;
let prazoSelecionado = null;
let valorInvestido = 0;

// Adicione esta função no final do script.js para melhorar a experiência mobile
function otimizarMobile() {
    // Prevenir zoom no focus em iOS
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Melhorar performance em mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('mobile-optimized');
    }
}

// Chame a função no DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    otimizarMobile();
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Máscara de moeda BRL corrigida - SEM divisão por 100
    document.getElementById('valor').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Converter para número (já está em centavos)
        const numericValue = parseInt(value) || 0;
        
        // Formatar como moeda brasileira (dividindo por 100 para converter centavos em reais)
        const valueInReais = numericValue / 100;
        
        if (!isNaN(valueInReais)) {
            e.target.value = valueInReais.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            // Verificar se deve mostrar a tabela de faixas
            const tabelaFaixas = document.getElementById('tabela-faixas');
            const containerFormaRecebimento = document.getElementById('container-forma-recebimento');
            
            if (valueInReais >= 20000) {
                tabelaFaixas.style.display = 'block';
                containerFormaRecebimento.style.display = 'block'; // MOSTRAR BOTÕES DE RENDIMENTO
                valorInvestido = valueInReais;
            } else {
                tabelaFaixas.style.display = 'none';
                containerFormaRecebimento.style.display = 'none'; // ESCONDER BOTÕES DE RENDIMENTO
                valorInvestido = 0;
            }
        }
    });
    
    // Permitir seleção dos valores sugeridos
    document.getElementById('valor').addEventListener('change', function(e) {
        let value = e.target.value;
        
        // Se o valor veio do datalist, converter para numérico
        if (value && value.includes('.')) {
            const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
            
            if (!isNaN(numericValue)) {
                e.target.value = numericValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                // Verificar se deve mostrar a tabela de faixas
                const tabelaFaixas = document.getElementById('tabela-faixas');
                const containerFormaRecebimento = document.getElementById('container-forma-recebimento');
                
                if (numericValue >= 20000) {
                    tabelaFaixas.style.display = 'block';
                    containerFormaRecebimento.style.display = 'block'; // MOSTRAR BOTÕES DE RENDIMENTO
                    valorInvestido = numericValue;
                } else {
                    tabelaFaixas.style.display = 'none';
                    containerFormaRecebimento.style.display = 'none'; // ESCONDER BOTÕES DE RENDIMENTO
                    valorInvestido = 0;
                }
            }
        }
    });
    
    // Validação de campos obrigatórios em tempo real
    const camposObrigatorios = document.querySelectorAll('input[required]');
    camposObrigatorios.forEach(campo => {
        // Verificar a cada entrada de dados
        campo.addEventListener('input', function() {
            validarCampo(this);
            validarDadosCliente();
        });
        
        // Também verificar quando sair do campo
        campo.addEventListener('blur', function() {
            validarCampo(this);
            validarDadosCliente();
        });
    });
});

function validarDadosCliente() {
    const cliente = document.getElementById('cliente').value.trim();
    const email = document.getElementById('email').value.trim();
    const profissao = document.getElementById('profissao').value.trim();
    const contato = document.getElementById('contato').value.trim();
    
    const todosPreenchidos = cliente && email && profissao && contato;
    const btnProximo = document.getElementById('btn-proximo');
    
    if (todosPreenchidos) {
        btnProximo.disabled = false;
        btnProximo.style.opacity = "1";
        btnProximo.style.cursor = "pointer";
    } else {
        btnProximo.disabled = true;
        btnProximo.style.opacity = "0.6";
        btnProximo.style.cursor = "not-allowed";
    }
    
    return todosPreenchidos;
}

function avancarParaInvestimento() {
    if (validarDadosCliente()) {
        document.querySelector('.dados-investimento').style.display = 'block';
        document.getElementById('btn-proximo').style.display = 'none';
    }
}

function validarValorInvestido() {
    const containerFormaRecebimento = document.getElementById('container-forma-recebimento');
    
    if (valorInvestido >= 20000) {
        containerFormaRecebimento.style.display = 'block';
    } else {
        containerFormaRecebimento.style.display = 'none';
        alert("O valor investido deve ser de no mínimo R$ 20.000,00.");
    }
}

function validarCampo(campo) {
    if (!campo.value.trim()) {
        campo.style.borderColor = 'red';
        return false;
    } else {
        campo.style.borderColor = '#ccc';
        return true;
    }
}

function validarFormulario() {
    let valido = true;
    const camposObrigatorios = document.querySelectorAll('input[required]');
    
    // Validar dados do cliente
    if (!validarDadosCliente()) {
        valido = false;
        alert("Por favor, preencha todos os dados do cliente.");
        return false;
    }
    
    camposObrigatorios.forEach(campo => {
        if (!validarCampo(campo)) {
            valido = false;
        }
    });
    
    if (!formaSelecionada) {
        alert("Por favor, selecione a forma de recebimento.");
        valido = false;
    }
    
    if (!prazoSelecionado) {
        alert("Por favor, selecione o prazo.");
        valido = false;
    }
    
    if (valorInvestido < 20000) {
        alert("O valor investido deve ser de no mínimo R$ 20.000,00.");
        valido = false;
    }
    
    return valido;
}

function selecionarForma(forma) {
    formaSelecionada = forma;
    
    // Atualizar UI dos botões
    document.querySelectorAll('.recebimento-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById(`btn-${forma}`).classList.add('selected');
    
    // A tabela de faixas agora permanece visível (linha removida)
    
    // MOSTRAR TEXTO EXPLICATIVO CORRESPONDENTE
    if (forma === 'mensal') {
        document.getElementById('texto-explicativo-mensal').style.display = 'block';
        document.getElementById('texto-explicativo-final').style.display = 'none';
    } else {
        document.getElementById('texto-explicativo-mensal').style.display = 'none';
        document.getElementById('texto-explicativo-final').style.display = 'block';
    }
    
    // Calcular e exibir resultados
    calcular();
}

function selecionarPrazo(prazo) {
    prazoSelecionado = prazo;
    
    // Atualizar UI dos botões
    document.querySelectorAll('.prazo-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const botoesPrazo = document.querySelectorAll('.prazo-btn');
    botoesPrazo.forEach(btn => {
        if (btn.textContent.includes(prazo)) {
            btn.classList.add('selected');
        }
    });
    
    // Mostrar botão de enviar proposta
    document.getElementById('btn-enviar').style.display = 'block';
}

function obterTaxaExtraPorValor(valor) {
    // Retorna a taxa adicional baseada no valor investido (Rendimento 3)
    for (let faixa of taxaExtra) {
        if (valor >= faixa.min && valor <= faixa.max) {
            return faixa.extra;
        }
    }
    return 0;
}

function calcular() {
    if (!formaSelecionada || valorInvestido < 20000) return;
    
    let tbody = document.getElementById('resBody');
    let thead = document.getElementById('resultado-head');
    tbody.innerHTML = "";
    
    // Configurar cabeçalho da tabela baseado na forma de recebimento
    if (formaSelecionada === 'mensal') {
        thead.innerHTML = `
            <tr>
                <th>Prazo</th>
                <th>Rendimento Mensal (R$)</th>
                <th>Retorno no Fim do Contrato</th>
                <th>Retorno Total</th>
                <th>Taxa Efetiva a.m.</th>
            </tr>
        `;
        
        // Preencher tabela para RENDIMENTO MENSAL com a nova lógica
        [18, 24, 36].forEach(prazo => {
            const taxaBase = taxaPrazo[prazo].mensal; // Rendimento 1
            let taxaAdicional = 0;
            
            // Adicionar rendimento da Tabela 3 para valores >= R$100.000
            if (valorInvestido >= 100000) {
                taxaAdicional = obterTaxaExtraPorValor(valorInvestido);
            }
            
            const taxaTotal = taxaBase + taxaAdicional;
            
            const rendimentoMensal = valorInvestido * taxaTotal;
            const jurosTotais = rendimentoMensal * prazo;
            const retornoTotal = valorInvestido + jurosTotais;
            
            tbody.innerHTML += `
                <tr>
                    <td>${prazo} meses</td>
                    <td>${rendimentoMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${valorInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${retornoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${(taxaTotal * 100).toFixed(2).replace('.', ',')}%</td>
                </tr>
            `;
        });
    } else { // Rendimento no Final
        thead.innerHTML = `
            <tr>
                <th>Prazo</th>
                <th>Retorno Total</th>
                <th>Taxa Efetiva a.m.</th>
            </tr>
        `;
        
        // Preencher tabela para RENDIMENTO NO FINAL com a nova lógica
        [18, 24, 36].forEach(prazo => {
            const taxaBase = taxaPrazo[prazo].final; // Rendimento 1
            const taxaExtraValor = obterTaxaExtraPorValor(valorInvestido); // Rendimento 3
            // Soma Rendimento 1 + Rendimento 2 (fixo) + Rendimento 3 (por valor)
            const taxaTotal = taxaBase + taxaAdicionalFinal + taxaExtraValor;
            
            // Cálculo com juros compostos para rendimento no final
            const retornoTotal = valorInvestido * Math.pow(1 + taxaTotal, prazo);
            
            tbody.innerHTML += `
                <tr>
                    <td>${prazo} meses</td>
                    <td>${retornoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${(taxaTotal * 100).toFixed(2).replace('.', ',')}%</td>
                </tr>
            `;
        });
    }
    
    // Mostrar tabela e seleção de prazo
    document.getElementById('tabela-resultados').style.display = 'block';
    document.getElementById('selecao-prazo').style.display = 'block';
}

async function enviarProposta() {
    if (!validarFormulario()) return;
    
    try {
        // Coletar dados do formulário
        const dados = {
            cliente: document.getElementById('cliente').value,
            email: document.getElementById('email').value,
            profissao: document.getElementById('profissao').value,
            contato: document.getElementById('contato').value,
            valor: valorInvestido,
            forma: formaSelecionada,
            prazo: prazoSelecionado,
            timestamp: new Date().toISOString()
        };
        
        // Enviar para o webhook
        const response = await fetch('https://n8nwebhook.arck1pro.shop/webhook/simulador', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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