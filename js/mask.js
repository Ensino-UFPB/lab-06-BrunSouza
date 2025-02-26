document.addEventListener('DOMContentLoaded', function () {
    const campoPreco = document.getElementById('preco');
    SimpleMaskMoney.setMask(campoPreco, {
        prefix: 'R$ ',
        fixed: true,
        fractionDigits: 2,        // Duas casas decimais
        decimalSeparator: ',',    // Vírgula como separador decimal
        thousandsSeparator: '.',  // Ponto como separador de milhar
        cursor: 'end'             // Foco no final do valor
    });
});