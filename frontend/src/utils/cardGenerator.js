/**
 * Utility to generate a high-resolution 1080x1080 WhatsApp Fact-Check Card image using HTML5 Canvas.
 * Styled in EeraFact's signature warm editorial palette.
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

  // Warm, distinctive palette
  const verdictColor = isFake ? '#C95C54' : isReal ? '#2F5D50' : isMisleading ? '#D99A3D' : '#6B7A6F';
  const verdictBg = isFake ? '#FBF0EF' : isReal ? '#EEF5F1' : isMisleading ? '#FDF6E9' : '#F1F4F1';
  const verdictBorder = isFake ? '#E8ADA9' : isReal ? '#98BCB0' : isMisleading ? '#ECC68F' : '#B8C7BC';

  // 1. Warm Ivory Canvas Background
  ctx.fillStyle = '#F4F1EA';
  ctx.fillRect(0, 0, size, size);

  // Soft Clay Card Container (Raised)
  drawClayCard(ctx, 40, 40, size - 80, size - 80, 28, '#FFFDF8', '#E5DFC8');

  // 2. Header Brand & Metadata
  ctx.fillStyle = '#2F5D50';
  ctx.beginPath();
  ctx.arc(88, 92, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFDF8';
  ctx.beginPath();
  ctx.arc(88, 92, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#242824';
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EeraFact', 120, 102);

  ctx.fillStyle = '#68706A';
  ctx.font = '500 16px "Inter", sans-serif';
  ctx.fillText('THINK. VERIFY. TRUST.', 270, 102);

  // Language Pill
  drawPill(ctx, size - 260, 75, 175, 36, `🌐 ${language_detected}`, '#F0ECE1', '#242824');

  // Divider
  ctx.strokeStyle = '#EAE4D3';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 140);
  ctx.lineTo(size - 80, 140);
  ctx.stroke();

  // 3. Verdict Banner Card (Claymorphic)
  const verdictText = isFake
    ? '🚨 FAKE — MISINFORMATION DETECTED'
    : isReal
    ? '✅ VERIFIED REAL & AUTHENTIC'
    : isMisleading
    ? '⚠️ MISLEADING / DISTORTED CONTEXT'
    : '🔍 UNVERIFIABLE CLAIM';

  drawClayCard(ctx, 80, 165, size - 160, 100, 20, verdictBg, verdictBorder);

  ctx.fillStyle = verdictColor;
  ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(verdictText, size / 2, 228);

  // Score Bar & Reliability badge
  ctx.textAlign = 'left';
  ctx.fillStyle = '#242824';
  ctx.font = '600 20px "Inter", sans-serif';
  ctx.fillText(`Credibility Index: ${confidence_score}%`, 90, 305);

  ctx.fillStyle = '#68706A';
  ctx.font = '500 15px "Inter", sans-serif';
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  ctx.textAlign = 'right';
  ctx.fillText(`Cross-Checked on ${dateStr}`, size - 90, 305);

  // 4. Viral Claim Under Review Box
  const claimBoxY = 330;
  const claimBoxH = 180;
  drawClayCard(ctx, 80, claimBoxY, size - 160, claimBoxH, 16, '#F8F6F0', '#E5DFC8');

  ctx.textAlign = 'left';
  ctx.fillStyle = '#C95C54';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VIRAL CLAIM UNDER REVIEW:', 105, claimBoxY + 36);

  ctx.fillStyle = '#242824';
  ctx.font = 'italic 18px "Inter", sans-serif';
  const cleanInput = input_content || 'Viral claim analyzed by EeraFact.';
  wrapText(ctx, `"${cleanInput}"`, 105, claimBoxY + 70, size - 210, 26, 4);

  // 5. Ground Truth & Reasoning Box
  const factBoxY = 535;
  const factBoxH = 320;
  drawClayCard(ctx, 80, factBoxY, size - 160, factBoxH, 18, '#F3F6F3', '#CCDCD3');

  ctx.fillStyle = '#2F5D50';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VERIFICATION FINDINGS & EVIDENCE (GROUND TRUTH):', 105, factBoxY + 38);

  ctx.fillStyle = '#242824';
  ctx.font = '19px "Inter", sans-serif';
  wrapText(ctx, reasoning, 105, factBoxY + 78, size - 210, 28, 6);

  // Verified Sources Note
  if (sources && sources.length > 0) {
    ctx.fillStyle = '#2F5D50';
    ctx.font = '600 14px "Inter", sans-serif';
    const srcNames = sources.map((s) => (typeof s === 'string' ? s : s.title || s.url)).slice(0, 2).join(' • ');
    ctx.fillText(`📚 Sources Consulted: ${srcNames}`, 105, factBoxY + factBoxH - 24);
  }

  // 6. WhatsApp Anti-Misinformation Defense Banner
  const footerY = 880;
  drawClayCard(ctx, 80, footerY, size - 160, 115, 18, '#242824', '#3E463F');

  ctx.fillStyle = '#FFFDF8';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Share Verified Truth. Stop Viral Rumors.', 110, footerY + 45);

  ctx.fillStyle = '#A8B9A5';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText('Verify text, URLs, images and audio notes instantly at EeraFact.', 110, footerY + 80);

  // Trigger Download
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = `EeraFact_Report_${verdict}_${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function drawClayCard(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
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

  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawPill(ctx, x, y, width, height, text, bg, color) {
  drawClayCard(ctx, x, y, width, height, height / 2, bg, '#E0DAC6');
  ctx.fillStyle = color;
  ctx.font = '600 14px "Inter", sans-serif';
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