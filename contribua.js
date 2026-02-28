/* ===== CONTRIBUA.JS ===== */

(function () {
    'use strict';

    const VALOR_MINIMO = 25;

    // Elementos principais
    const form = document.getElementById('contribua-form');
    const inputValor = document.getElementById('input-valor');
    const valorWrap = document.getElementById('valor-input-wrap');
    const errValor = document.getElementById('err-valor');
    const globalError = document.getElementById('global-error');
    const globalErrorMsg = document.getElementById('global-error-msg');
    const resumoContrib = document.getElementById('resumo-contribuicao');
    const resumoTotal = document.getElementById('resumo-total');
    const turbineResumoItems = document.getElementById('turbine-resumo-items');
    const turbinePrecoTotal = document.getElementById('turbine-preco-total');
    const quickBtns = document.querySelectorAll('.quick-val-btn');

    // Opções de turbine (checkbox individuais)
    const turbineChks = document.querySelectorAll('.turbine-chk');

    // === FORMATAÇÃO MONETÁRIA ===
    function formatBRL(value) {
        if (isNaN(value) || value === '') return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function parseValor(str) {
        if (!str) return 0;
        const cleaned = str.replace(/[^\d,\.]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    // === INPUT VALOR - MÁSCARA ===
    inputValor.addEventListener('input', function () {
        let raw = this.value.replace(/[^\d]/g, '');
        if (raw === '') { this.value = ''; updateResumo(); clearValorError(); return; }
        const centavos = parseInt(raw, 10);
        const reais = centavos / 100;
        this.value = reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        clearValorError();
        updateResumo();
        quickBtns.forEach(b => b.classList.remove('selected'));
    });

    // Valida o mínimo ao sair do campo (sem bloquear enquanto digita)
    inputValor.addEventListener('blur', function () {
        const valor = parseValor(this.value);
        if (this.value !== '' && valor < VALOR_MINIMO) {
            showValorError('O valor mínimo para doação é de R$ 25,00');
        }
    });

    // === BOTÕES DE VALOR RÁPIDO ===
    quickBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const val = parseFloat(this.dataset.value);
            inputValor.value = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            quickBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            updateResumo();
            // Valida mínimo ao selecionar botão rápido
            if (val < VALOR_MINIMO) {
                showValorError('O valor mínimo para doação é de R$ 25,00');
            } else {
                clearValorError();
            }
        });
    });

    // === TURBINE: checkboxes individuais ===
    turbineChks.forEach(function (chk) {
        chk.addEventListener('change', function () {
            // Atualiza visual do card
            const card = this.closest('.turbine-opt-card');
            if (card) card.classList.toggle('selected', this.checked);
            updateResumo();
        });
    });

    // === RESUMO DINÂMICO ===
    function getTurbineTotal() {
        let total = 0;
        turbineChks.forEach(function (chk) {
            if (chk.checked) total += parseFloat(chk.dataset.valor) || 0;
        });
        return total;
    }

    function getTurbineSelecionados() {
        const itens = [];
        turbineChks.forEach(function (chk) {
            if (chk.checked) {
                const valor = parseFloat(chk.dataset.valor) || 0;
                itens.push({ nome: chk.dataset.nome, valor: valor });
            }
        });
        return itens;
    }

    function updateResumo() {
        const valor = parseValor(inputValor.value);
        const turbineTotal = getTurbineTotal();
        const total = valor + turbineTotal;
        const itens = getTurbineSelecionados();

        resumoContrib.textContent = formatBRL(valor);
        resumoTotal.textContent = formatBRL(total);

        // Atualiza badge de total no cabeçalho de turbine
        if (turbinePrecoTotal) {
            turbinePrecoTotal.textContent = turbineTotal > 0
                ? '+' + formatBRL(turbineTotal)
                : '';
        }

        // Atualiza linhas de resumo do turbine
        if (turbineResumoItems) {
            turbineResumoItems.innerHTML = itens.map(function (item) {
                return '<div class="resumo-row">'
                    + '<span>' + item.nome + '</span>'
                    + '<span>' + (item.valor === 0 ? 'Grátis' : '+' + formatBRL(item.valor)) + '</span>'
                    + '</div>';
            }).join('');
        }
    }

    // === VALIDAÇÃO VALOR ===
    function clearValorError() {
        valorWrap.classList.remove('error');
        if (errValor) errValor.textContent = '';
        if (globalError) globalError.style.display = 'none';
    }

    function showValorError(msg) {
        valorWrap.classList.add('error');
        if (errValor) errValor.textContent = msg;
        if (globalError) globalError.style.display = 'flex';
        if (globalErrorMsg) globalErrorMsg.textContent = msg;
        inputValor.focus();
    }

    // === VALIDAÇÃO DE CAMPO GENÉRICO ===
    function validateField(inputEl, errorEl, rules) {
        const val = inputEl.value.trim();
        for (const rule of rules) {
            if (!rule.test(val)) {
                inputEl.classList.add('error');
                if (errorEl) errorEl.textContent = rule.msg;
                return false;
            }
        }
        inputEl.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
        return true;
    }

    // Validação de CPF
    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
        let r = 11 - (sum % 11);
        if (r >= 10) r = 0;
        if (r !== parseInt(cpf[9])) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
        r = 11 - (sum % 11);
        if (r >= 10) r = 0;
        return r === parseInt(cpf[10]);
    }

    // === MÁSCARA CPF ===
    const inputCpf = document.getElementById('input-cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', function () {
            let v = this.value.replace(/\D/g, '').slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            this.value = v;
        });
    }

    // === MÁSCARA TELEFONE ===
    const inputTel = document.getElementById('input-telefone');
    if (inputTel) {
        inputTel.addEventListener('input', function () {
            let v = this.value.replace(/\D/g, '').slice(0, 11);
            if (v.length <= 10) {
                v = v.replace(/(\d{2})(\d)/, '($1) $2');
                v = v.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                v = v.replace(/(\d{2})(\d)/, '($1) $2');
                v = v.replace(/(\d{5})(\d)/, '$1-$2');
            }
            this.value = v;
        });
    }

    // === ENVIO DO FORMULÁRIO — integração com backend /checkout ===
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        let valid = true;

        // Campos do formulário
        const inputNome = document.getElementById('input-nome');
        const inputEmail = document.getElementById('input-email');

        // Nome
        if (!validateField(inputNome, document.getElementById('err-nome'), [
            { test: v => v.length >= 3, msg: 'Por favor, informe seu nome completo.' }
        ])) valid = false;

        // Email
        if (!validateField(inputEmail, document.getElementById('err-email'), [
            { test: v => v.length > 0, msg: 'Por favor, informe seu e-mail.' },
            { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'E-mail inválido.' }
        ])) valid = false;

        // Telefone
        if (inputTel && !validateField(inputTel, document.getElementById('err-telefone'), [
            { test: v => v.replace(/\D/g, '').length >= 10, msg: 'Telefone inválido.' }
        ])) valid = false;

        // CPF
        if (inputCpf && !validateField(inputCpf, document.getElementById('err-cpf'), [
            { test: v => v.length > 0, msg: 'Por favor, informe seu CPF.' },
            { test: v => validarCPF(v), msg: 'CPF inválido.' }
        ])) valid = false;

        // Valor mínimo
        const valor = parseValor(inputValor.value);
        if (valor < VALOR_MINIMO) {
            showValorError('Valor da contribuição deve ser no mínimo R$ 25,00');
            valid = false;
        } else {
            clearValorError();
        }

        if (!valid) {
            const firstError = form.querySelector('.form-input.error, #valor-input-wrap.error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // === Dados a enviar ===
        const turbineTotal = getTurbineTotal();
        const totalFinal = valor + turbineTotal;

        const payload = {
            name: inputNome.value.trim(),
            email: inputEmail ? inputEmail.value.trim() : '',
            document: inputCpf ? inputCpf.value.replace(/\D/g, '') : '',
            amount: totalFinal,          // em reais — o servidor converte para centavos
        };

        // Salva também no sessionStorage (para fallback / pagamento.html se necessário)
        sessionStorage.setItem('vakinha_doacao', JSON.stringify({
            ...payload,
            turbineItens: getTurbineSelecionados(),
            turbineTotal,
            total: totalFinal,
            campanhaId: '5971177',
            campanhaNome: 'AJUDA HUMANITÁRIA | ZONA DA MATA - MG',
        }));

        // === Abre modal em modo loader ===
        abrirModalLoader();

        // === Botão: estado de carregamento ===
        const btn = document.getElementById('btn-contribuir');
        if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

        try {
            const resp = await fetch('https://api-vakinha.onrender.com/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error || `Erro ${resp.status} ao processar pagamento.`);
            }

            // ── Log completo da resposta (Console do navegador F12) ──
            console.log('[CHECKOUT] Resposta completa da API:', JSON.stringify(data, null, 2));

            // ── O campo pix.qrcode da Ghosts Pay é o CÓDIGO EMV (texto copia e cola) ──
            // Não é uma imagem — o QR Code será gerado client-side via QRious
            const pixEMV = data?._pix?.qrcode
                || data?.pix?.qrcode
                || data?._pix?.qrcodeText
                || data?.pix?.qrcodeText
                || '';

            console.log('[CHECKOUT] Código PIX EMV (80 chars):', String(pixEMV).slice(0, 80));

            if (!pixEMV) {
                throw new Error('A API não retornou o código PIX. Verifique as credenciais.');
            }

            exibirModalPix({ total: totalFinal, pixEMV });

        } catch (err) {
            console.error('[CHECKOUT] Erro:', err.message);
            exibirModalErro(err.message || 'Verifique seus dados e tente novamente.');
        } finally {
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        }
    });

    // ─── Controle do Modal PIX ─────────────────────────────────────────────
    let timerInterval = null;

    function abrirModalLoader() {
        const overlay = document.getElementById('pix-modal-overlay');
        const loader = document.getElementById('pix-modal-loader');
        const content = document.getElementById('pix-modal-content');
        const error = document.getElementById('pix-modal-error');
        if (!overlay) return;
        loader.style.display = 'flex';
        content.style.display = 'none';
        error.style.display = 'none';
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function exibirModalPix({ total, pixEMV }) {
        const loader = document.getElementById('pix-modal-loader');
        const content = document.getElementById('pix-modal-content');

        // Valor total
        const valorEl = document.getElementById('pix-modal-valor-num');
        if (valorEl) valorEl.textContent = formatBRL(total);

        // ── Gera QR Code no canvas via QRious ──
        // O código EMV PIX é passado diretamente como conteúdo do QR Code
        const canvas = document.getElementById('pix-qr-canvas');
        if (canvas && pixEMV && typeof QRious !== 'undefined') {
            try {
                new QRious({
                    element: canvas,
                    value: pixEMV,
                    size: 200,
                    background: '#ffffff',
                    foreground: '#1a1a1a',
                    level: 'M',   // nível de correção de erro (L/M/Q/H)
                });
                canvas.style.display = 'block';
                console.log('[QR CODE] Gerado com sucesso via QRious.');
            } catch (qrErr) {
                console.error('[QR CODE] Erro ao gerar QR Code:', qrErr.message);
                canvas.style.display = 'none';
            }
        } else if (canvas) {
            canvas.style.display = 'none';
            console.warn('[QR CODE] QRious não disponível ou pixEMV vazio.');
        }

        // ── Código copia e cola (é o mesmo texto EMV) ──
        const codeEl = document.getElementById('pix-copypaste-code');
        if (codeEl) codeEl.value = pixEMV;

        // Exibe conteúdo, oculta loader
        loader.style.display = 'none';
        content.style.display = 'block';

        // Timer 30 minutos
        iniciarTimer(30 * 60);
    }

    function exibirModalErro(msg) {
        const loader = document.getElementById('pix-modal-loader');
        const content = document.getElementById('pix-modal-content');
        const error = document.getElementById('pix-modal-error');
        const msgEl = document.getElementById('pix-error-msg');
        loader.style.display = 'none';
        content.style.display = 'none';
        error.style.display = 'flex';
        if (msgEl) msgEl.textContent = msg;
        if (timerInterval) clearInterval(timerInterval);
    }

    function fecharModal() {
        const overlay = document.getElementById('pix-modal-overlay');
        if (!overlay) return;
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        // Re-habilita o botão
        const btn = document.getElementById('btn-contribuir');
        if (btn) {
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Realizar contribuição`;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    function iniciarTimer(segundos) {
        if (timerInterval) clearInterval(timerInterval);
        const timerEl = document.getElementById('pix-timer');
        let restante = segundos;
        function atualizar() {
            const m = String(Math.floor(restante / 60)).padStart(2, '0');
            const s = String(restante % 60).padStart(2, '0');
            if (timerEl) timerEl.textContent = `${m}:${s}`;
            if (restante <= 0) {
                clearInterval(timerInterval);
                if (timerEl) timerEl.closest('.pix-timer-wrap').innerHTML =
                    '<span style="color:#e53e3e;font-weight:700;">⚠ PIX expirado. Gere um novo.</span>';
            }
            restante--;
        }
        atualizar();
        timerInterval = setInterval(atualizar, 1000);
    }

    // Botão Copiar
    const pixCopyBtn = document.getElementById('pix-copy-btn');
    if (pixCopyBtn) {
        pixCopyBtn.addEventListener('click', function () {
            const codeEl = document.getElementById('pix-copypaste-code');
            const label = document.getElementById('pix-copy-label');
            if (!codeEl || !codeEl.value) return;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(codeEl.value).then(function () {
                    label.textContent = '✓ Copiado!';
                    pixCopyBtn.classList.add('copied');
                    setTimeout(function () {
                        label.textContent = 'Copiar código';
                        pixCopyBtn.classList.remove('copied');
                    }, 2500);
                }).catch(function () {
                    codeEl.select();
                    document.execCommand('copy');
                    label.textContent = '✓ Copiado!';
                    setTimeout(function () { label.textContent = 'Copiar código'; }, 2500);
                });
            } else {
                codeEl.select();
                document.execCommand('copy');
            }
        });
    }

    // Botão Fechar (cancelar)
    const pixCloseBtn = document.getElementById('pix-modal-close-btn');
    if (pixCloseBtn) pixCloseBtn.addEventListener('click', fecharModal);

    // Botão Tentar novamente
    const pixRetryBtn = document.getElementById('pix-error-retry-btn');
    if (pixRetryBtn) pixRetryBtn.addEventListener('click', function () {
        fecharModal();
        setTimeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 200);
    });

    // Fecha ao clicar no overlay (fora do card)
    const pixOverlay = document.getElementById('pix-modal-overlay');
    if (pixOverlay) {
        pixOverlay.addEventListener('click', function (e) {
            if (e.target === pixOverlay) fecharModal();
        });
    }

    // Esc fecha o modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharModal();
    });

    // Limpa erro ao focar no campo de valor
    inputValor.addEventListener('focus', clearValorError);

})();

