// Taxas da planilha
const taxaPrazo = {
    18: { mensal: 0.016, final: 0.016 },
    24: { mensal: 0.018, final: 0.018 },
    36: { mensal: 0.02,  final: 0.02 }
};

const taxaExtra = [
    { min: 50000, max: 99999, extra: 0.0 },
    { min: 100000, max: 199999, extra: 0.002 },
    { min: 200000, max: 399999, extra: 0.004 },
    { min: 400000, max: Infinity, extra: 0.006 }
];

// Máscara de moeda BRL
document.getElementById('valor').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    e.target.value = value;
});

function obterTaxaExtra(valor) {
    for (let faixa of taxaExtra) {
        if (valor >= faixa.min && valor <= faixa.max) return faixa.extra;
    }
    return 0;
}

function atualizarColunas() {
    const forma = document.getElementById('forma').value;
    const colMensal = document.querySelectorAll('.col-mensal, .td-mensal');
    const colFinal = document.querySelectorAll('.col-final, .td-final');

    colMensal.forEach(c => c.classList.remove('hidden-col', 'destaque'));
    colFinal.forEach(c => c.classList.remove('hidden-col', 'destaque'));

    if (forma === 'mensal') {
        colFinal.forEach(c => c.classList.add('hidden-col'));
        colMensal.forEach(c => c.classList.add('destaque'));
    } else if (forma === 'final') {
        colMensal.forEach(c => c.classList.add('hidden-col'));
        colFinal.forEach(c => c.classList.add('destaque'));
    }
}

function calcular() {
    let valorStr = document.getElementById('valor').value;
    let forma = document.getElementById('forma').value;

    if (!valorStr || !forma) {
        alert("Por favor, preencha o Valor Investido e a Forma de Recebimento.");
        return;
    }

    let valor = parseFloat(valorStr.replace(/[R$\s.]/g, '').replace(',', '.'));
    let extra = obterTaxaExtra(valor);

    let tbody = document.getElementById('resBody');
    tbody.innerHTML = "";

    [18, 24, 36].forEach(prazo => {
        let taxaBase = taxaPrazo[prazo][forma];
        // REMOVER A SOMA DA TAXA EXTRA PARA RENDIMENTO MENSAL
        // (no exemplo, o extra só parece aplicar ao final)
        let taxaTotal = forma === 'mensal' ? taxaBase : taxaBase + extra;
        
        let rendimentoMensal, rendimentoFinal;

        if (forma === 'mensal') {
            rendimentoMensal = valor * taxaBase; // Usar apenas taxaBase para mensal
            rendimentoFinal = valor + (rendimentoMensal * prazo);
        } else {
            rendimentoFinal = valor * Math.pow(1 + (taxaBase + extra), prazo);
            rendimentoMensal = (rendimentoFinal - valor) / prazo;
        }

        tbody.innerHTML += `
            <tr>
                <td>${prazo} meses</td>
                <td class="td-mensal">${rendimentoMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="td-final">${rendimentoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
        `;
    });

    document.getElementById('resultado').style.display = 'table';
    atualizarColunas();
}

// Exportar PDF
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Proposta de Investimento ARI", 14, 15);

    doc.autoTable({
        html: '#resultado',
        startY: 25,
        theme: 'striped',
        headStyles: { fillColor: [64, 1, 64] }
    });

    doc.save("proposta_investimento.pdf");
}
