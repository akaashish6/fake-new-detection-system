/**
 * Utility to generate a high-resolution 1080x1080 WhatsApp Fact-Check Card image using HTML5 Canvas.
 */
export function downloadFactCheckCard(data) {
  const canvas = document.createElement('canvas');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const {
    verdict = 'Unverifiable',
    confidence_score = 85,
    language_detected = 'English',
    reasoning = '',
    input_content = '',
    sources = []
  } = data;

  const isFake = verdict === 'Fake';
  const isReal = verdict === 'Real';
  const isMisleading = verdict === 'Misleading';

  const themeColor = isFake ? '#ef4444' : isReal ? '#10b981' : isMisleading ? '#f59e0b' : '#8b5cf6';
  const themeBgColor = isFake ? 'rgba(239, 68, 68, 0.18)' : isReal ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)';

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, '#0a0f1d');
  bgGrad.addColorStop(0.5, '#060913');
  bgGrad.addColorStop(1, '#03050a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Background glow circle
  const glowGrad = ctx.createRadialGradient(size / 2, 280, 50, size / 2, 280, 450);
  glowGrad.addColorStop(0, themeColor === '#ef4444' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, size, size);

  // Outer border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, size - 48, size - 48);

  // Corner tech brackets
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 6;
  const bSize = 35;
  // Top Left
  ctx.beginPath();
  ctx.moveTo(24, 24 + bSize); ctx.lineTo(24, 24); ctx.lineTo(24 + bSize, 24);
  ctx.stroke();
  // Top Right
  ctx.beginPath();
  ctx.moveTo(size - 24 - bSize, 24); ctx.lineTo(size - 24, 24); ctx.lineTo(size - 24, 24 + bSize);
  ctx.stroke();
  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(24, size - 24 - bSize); ctx.lineTo(24, size - 24); ctx.lineTo(24 + bSize, size - 24);
  ctx.stroke();
  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(size - 24 - bSize, size - 24); ctx.lineTo(size - 24, size - 24); ctx.lineTo(size - 24, size - 24 - bSize);
  ctx.stroke();

  // 2. Top Header Brand
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🛡️ TRUTHLENS AI', 55, 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px monospace';
  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  ctx.fillText(`FACT-CHECK BULLETIN • ${dateStr.toUpperCase()}`, 55, 105);

  // Badge: Language
  drawPill(ctx, size - 230, 65, 175, 36, `🌐 Lang: ${language_detected}`, 'rgba(255, 255, 255, 0.08)', '#cbd5e1');

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(55, 130);
  ctx.lineTo(size - 55, 130);
  ctx.stroke();

  // 3. Huge Verdict Banner Box
  const verdictText = isFake
    ? '🚨 FAKE NEWS / RUMOR BUSTED'
    : isReal
    ? '✅ VERIFIED TRUE & AUTHENTIC'
    : isMisleading
    ? '⚠️ MISLEADING / OUT OF CONTEXT'
    : '❓ UNVERIFIABLE CLAIM';

  drawRoundedRect(ctx, 55, 155, size - 110, 95, 16, themeBgColor, themeColor, 3);

  ctx.fillStyle = themeColor;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(verdictText, size / 2, 215);

  // Subtitle / Score below verdict
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(`🎯 AI Reliability Score: ${confidence_score}%`, 65, 290);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '16px monospace';
  ctx.fillText('STATUS: CROSS-VERIFIED & FACT-CHECKED', size - 440, 290);

  // 4. Claim / Rumor Box
  const claimBoxY = 320;
  const claimBoxH = 190;
  drawRoundedRect(ctx, 55, claimBoxY, size - 110, claimBoxH, 12, 'rgba(239, 68, 68, 0.09)', 'rgba(239, 68, 68, 0.35)', 1.5);

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('❌ WHAT THE VIRAL RUMOR CLAIMS:', 80, claimBoxY + 38);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '19px sans-serif';
  const cleanInput = input_content || 'Viral claim analyzed in bulletin.';
  wrapText(ctx, `"${cleanInput}"`, 80, claimBoxY + 75, size - 160, 28, 4);

  // 5. Verified Reality / Truth Box
  const factBoxY = 535;
  const factBoxH = 320;
  drawRoundedRect(ctx, 55, factBoxY, size - 110, factBoxH, 12, 'rgba(16, 185, 129, 0.09)', 'rgba(16, 185, 129, 0.35)', 1.5);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('✅ THE FACT-CHECK & GROUND TRUTH (SACHAI):', 80, factBoxY + 40);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '20px sans-serif';
  wrapText(ctx, reasoning, 80, factBoxY + 80, size - 160, 30, 6);

  // Sources text if available
  if (sources && sources.length > 0) {
    ctx.fillStyle = '#00f2fe';
    ctx.font = '15px monospace';
    const srcNames = sources.map((s) => (typeof s === 'string' ? s : s.title || s.url)).slice(0, 2).join(' • ');
    ctx.fillText(`🔗 Proof Sources: ${srcNames}`, 80, factBoxY + factBoxH - 25);
  }

  // 6. Bottom WhatsApp Defense Footer
  const footerY = 880;
  drawRoundedRect(ctx, 55, footerY, size - 110, 130, 14, 'rgba(0, 0, 0, 0.5)', 'rgba(0, 242, 254, 0.3)', 1.5);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('💬 Share in WhatsApp Groups to Stop Fake Rumors', 85, footerY + 45);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px sans-serif';
  ctx.fillText('Debunk viral phishing, fake government notices & forwarded scams with TruthLens AI.', 85, footerY + 82);

  // Instant trigger download
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = `TruthLens_FactCheck_${verdict}_${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, lineWidth) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth || 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawPill(ctx, x, y, width, height, text, bg, color) {
  drawRoundedRect(ctx, x, y, width, height, height / 2, bg, 'rgba(255,255,255,0.1)', 1);
  ctx.fillStyle = color;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + width / 2, y + height / 2 + 5);
  ctx.textAlign = 'left';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = (text || '').split(' ');
  let line = '';
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lineCount++;
      if (maxLines && lineCount >= maxLines - 1) {
        line += '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}