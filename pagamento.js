/* ===== PAGAMENTO.JS ===== */
/* 
 * INTEGRAÇÃO FUTURA COM GATEWAY DE PAGAMENTO:
 * 
 * Para integrar com sua gateway, substitua a função `gerarPixCode()` 
 * por uma chamada à API da gateway passando:
 *   - valor: dados.total
 *   - referencia: dados.campanhaId + '_' + Date.now()
 *   - nome_pagador: dados.nome
 *   - cpf_pagador: dados.cpf
 * 
 * A gateway retornará:
 *   - qr_code_base64: string base64 da imagem do QR Code
 *   - pix_copia_cola: string do código PIX copia e cola
 *   - id_transacao: ID para verificar status do pagamento
 *
 * Exemplo de integração (descomente e adapte):
 *
 * async function chamarGateway(dados) {
 *   const resp = await fetch('https://SUA_GATEWAY/pix/create', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': 'Bearer ' + SUA_API_KEY
 *     },
 *     body: JSON.stringify({
 *       amount: Math.round(dados.total * 100), // em centavos
 *       description: 'Doacao Vakinha ' + dados.campanhaId,
 *       customer: { name: dados.nome, cpf: dados.cpf, email: dados.email }
 *     })
 *   });
 *   return await resp.json();
 * }
 */

(function () {
    'use strict';

    // === LER DADOS DO SESSIONSTORAGE ===
    let dados = null;
    try {
        const raw = sessionStorage.getItem('vakinha_doacao');
        if (raw) dados = JSON.parse(raw);
    } catch (e) { /* ignora */ }

    // Se não há dados, redireciona para contribua
    if (!dados) {
        setTimeout(function () {
            window.location.href = 'contribua.html';
        }, 2000);
        return;
    }

    // === PREENCHER DADOS NA TELA ===
    function formatBRL(v) {
        return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const total = dados.total || dados.valor || 0;
    const totalStr = formatBRL(total);

    // Valor
    setEl('pag-valor-num', totalStr);
    setEl('pag-step-valor', totalStr);

    // Nome e email da campanha
    setEl('pag-camp-nome', dados.campanhaNome || 'AJUDA HUMANITÁRIA | ZONA DA MATA - MG');

    // Doador
    const nomeInicial = (dados.nome || '?').trim()[0].toUpperCase();
    setEl('pag-doador-avatar', nomeInicial);
    setEl('pag-doador-nome', dados.nome || '');
    setEl('pag-doador-email', dados.email || '');

    function setEl(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // === TIMER 30 MINUTOS ===
    let tempoRestante = 30 * 60; // segundos
    const timerEl = document.getElementById('pag-timer');

    const timerInterval = setInterval(function () {
        tempoRestante--;
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            if (timerEl) timerEl.textContent = '00:00';
            mostrarExpirado();
            return;
        }
        const m = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
        const s = (tempoRestante % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = m + ':' + s;
    }, 1000);

    function mostrarExpirado() {
        const badge = document.getElementById('pag-status-badge');
        if (badge) {
            badge.innerHTML = '<span class="status-dot" style="background:#e53e3e;animation:none"></span> QR Code expirado';
            badge.style.background = '#fff0f0';
            badge.style.borderColor = '#e53e3e';
            badge.style.color = '#c53030';
        }
    }

    // === GERAR PIX CODE (placeholder) ===
    // Este código será substituído pela resposta real da gateway 
    function gerarPixCodePlaceholder(valor, nome) {
        const valorCents = Math.round(valor * 100).toString().padStart(10, '0');
        const nomeClean = (nome || 'DOADOR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().slice(0, 25);
        const ref = 'VAK' + Date.now().toString().slice(-8);
        // Formato simulado de código PIX EMVCo (placeholder - será substituído pela gateway)
        const pixCode = [
            '00020126580014br.gov.bcb.pix',
            '0136vakinha@vakinha.com.br',
            '52040000',
            '5303986',
            '54' + ('' + valor.toFixed(2)).replace('.', ',').length.toString().padStart(2, '0') + valor.toFixed(2).replace('.', ','),
            '5802BR',
            '5920' + nomeClean.slice(0, 20).padEnd(20, ' ').trimEnd(),
            '6008SAOPAULO',
            '62' + (4 + ref.length).toString().padStart(2, '0') + '0500' + ref,
            '6304'
        ].join('');
        return pixCode + calcCRC16(pixCode);
    }

    function calcCRC16(str) {
        let crc = 0xFFFF;
        for (let i = 0; i < str.length; i++) {
            crc ^= str.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
                crc &= 0xFFFF;
            }
        }
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    // === RENDERIZAR QR CODE === 
    // Usa a biblioteca qrcode.min.js se disponível, senão usa QR visual artesanal
    const pixCode = gerarPixCodePlaceholder(total, dados.nome);
    const pixInput = document.getElementById('pag-pix-code');
    if (pixInput) pixInput.value = pixCode;

    // Carrega QRCode.js dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
    script.onload = function () {
        renderQRCode(pixCode);
    };
    script.onerror = function () {
        // Fallback: QR visual artesanal simples
        renderQRFallback();
    };
    document.head.appendChild(script);

    function renderQRCode(text) {
        const canvas = document.getElementById('qr-canvas');
        const loading = document.getElementById('qr-loading-inner');
        if (!canvas || typeof QRCode === 'undefined') { renderQRFallback(); return; }

        QRCode.toCanvas(canvas, text, {
            width: 200,
            margin: 2,
            color: { dark: '#1a1a1a', light: '#ffffff' }
        }, function (err) {
            if (err) { renderQRFallback(); return; }
            if (loading) loading.style.display = 'none';
            canvas.style.display = 'block';
        });
    }

    function renderQRFallback() {
        // QR Code simples gerado com SVG sem dependências
        const loading = document.getElementById('qr-loading-inner');
        const wrap = document.querySelector('.pag-qr-placeholder');
        if (!wrap) return;
        if (loading) loading.style.display = 'none';

        // Cria SVG com padrão visual de QR Code (decorativo, não escaneável)
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '200');
        svg.setAttribute('viewBox', '0 0 21 21');
        svg.style.cssText = 'display:block; border-radius:8px;';

        // Background
        const bg = document.createElementNS(svgNS, 'rect');
        bg.setAttribute('width', '21');
        bg.setAttribute('height', '21');
        bg.setAttribute('fill', 'white');
        svg.appendChild(bg);

        // Gera padrão pseudo-aleatório baseado no código PIX
        const seed = pixCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        function pseudoRand(i) {
            return ((seed * (i + 47)) ^ (i * 137)) & 1;
        }

        // Finder patterns (cantos)
        const finders = [[0, 0], [14, 0], [0, 14]];
        finders.forEach(([x, y]) => {
            const outer = document.createElementNS(svgNS, 'rect');
            outer.setAttribute('x', x); outer.setAttribute('y', y);
            outer.setAttribute('width', '7'); outer.setAttribute('height', '7');
            outer.setAttribute('fill', '#1a1a1a'); svg.appendChild(outer);
            const mid = document.createElementNS(svgNS, 'rect');
            mid.setAttribute('x', x + 1); mid.setAttribute('y', y + 1);
            mid.setAttribute('width', '5'); mid.setAttribute('height', '5');
            mid.setAttribute('fill', 'white'); svg.appendChild(mid);
            const inner = document.createElementNS(svgNS, 'rect');
            inner.setAttribute('x', x + 2); inner.setAttribute('y', y + 2);
            inner.setAttribute('width', '3'); inner.setAttribute('height', '3');
            inner.setAttribute('fill', '#1a1a1a'); svg.appendChild(inner);
        });

        // Módulos de dados
        for (let row = 0; row < 21; row++) {
            for (let col = 0; col < 21; col++) {
                const isFinder = (row < 7 && (col < 7 || col >= 14)) || (row >= 14 && col < 7);
                if (isFinder) continue;
                if (pseudoRand(row * 21 + col)) {
                    const rect = document.createElementNS(svgNS, 'rect');
                    rect.setAttribute('x', col); rect.setAttribute('y', row);
                    rect.setAttribute('width', '1'); rect.setAttribute('height', '1');
                    rect.setAttribute('fill', '#1a1a1a');
                    svg.appendChild(rect);
                }
            }
        }

        wrap.appendChild(svg);
    }

    // === COPIAR PIX ===
    window.copiarPix = function () {
        const input = document.getElementById('pag-pix-code');
        const btn = document.getElementById('pag-btn-copiar');
        const hint = document.getElementById('pag-copiacola-hint');
        if (!input) return;

        const text = input.value;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => confirmarCopia(btn, hint));
        } else {
            input.select();
            try { document.execCommand('copy'); confirmarCopia(btn, hint); } catch (e) { }
        }
    };

    function confirmarCopia(btn, hint) {
        if (btn) {
            btn.classList.add('copiado');
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copiado!';
            setTimeout(function () {
                btn.classList.remove('copiado');
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar';
            }, 3000);
        }
        if (hint) {
            hint.textContent = '✓ Código copiado para a área de transferência!';
            setTimeout(() => { hint.textContent = ''; }, 4000);
        }
        // Toast
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.textContent = '✓ Código PIX copiado!';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    // === POLLING: Verificar pagamento (placeholder para integração futura) ===
    // Quando a gateway for integrada, substitua esta função por uma chamada real
    // à API da gateway passando o id_transacao recebido na criação do PIX.
    //
    // Exemplo:
    // async function verificarPagamento(idTransacao) {
    //   const resp = await fetch('https://SUA_GATEWAY/pix/status/' + idTransacao, {
    //     headers: { 'Authorization': 'Bearer ' + SUA_API_KEY }
    //   });
    //   const data = await resp.json();
    //   return data.status; // 'pending' | 'paid' | 'expired'
    // }
    //
    // const polling = setInterval(async () => {
    //   const status = await verificarPagamento(idTransacao);
    //   if (status === 'paid') { clearInterval(polling); mostrarPago(); }
    //   if (status === 'expired') { clearInterval(polling); mostrarExpirado(); }
    // }, 5000);

    function mostrarPago() {
        const badge = document.getElementById('pag-status-badge');
        if (badge) {
            badge.classList.add('pago');
            badge.innerHTML = '<span class="status-dot"></span> Pagamento confirmado! ✓';
        }
        clearInterval(timerInterval);
        // Opcional: redirecionar para página de agradecimento
        // setTimeout(() => window.location.href = 'obrigado.html', 3000);
    }

})();
