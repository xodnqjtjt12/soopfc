import { PITCH_LAYOUTS } from './components/FormationBoard';
import { isPlanComplete } from './manualFormation';

// Render the saved slots directly so manual exchanges and locks are reflected.
export async function createFormationImage(plan, team, named) {
  if (!isPlanComplete(plan)) throw new Error('4쿼터를 모두 채운 뒤 이미지를 만들 수 있어요.');
  const canvas = document.createElement('canvas');
  canvas.width = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이 브라우저에서 이미지 생성을 지원하지 않아요.');
  const font = '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  const text = (value, x, y, size, color, weight = 400, align = 'left', maxWidth) => {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color; ctx.textAlign = align;
    if (maxWidth) ctx.fillText(value, x, y, maxWidth);
    else ctx.fillText(value, x, y);
  };
  const day = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const benchRows = Math.max(1, ...plan.quarters.map(q => Math.ceil(q.bench.length / 4)));
  const unavailableRows = Math.max(0, ...plan.quarters.map(q => Math.ceil((q.unavailable || []).length / 4)));
  const cardHeight = 820 + benchRows * 32 + (unavailableRows ? 50 + unavailableRows * 32 : 0);
  canvas.height = 250 + cardHeight * 2 + 24;
  ctx.fillStyle = '#f3f6f2'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  text('SOOP FC · MATCH DAY', 60, 60, 20, '#48735c', 700);
  text(`${team.toUpperCase()}팀 · 4쿼터 포메이션`, 60, 118, 42, '#20362c', 700);
  text('현재 편성 기준 · 검정 A팀 / 하늘색 B팀', 60, 158, 22, '#66796c');
  text(day, 1380, 62, 20, '#66796c', 400, 'right');
  plan.quarters.forEach((quarter, qi) => {
    const x = 48 + (qi % 2) * 684, y = 200 + Math.floor(qi / 2) * (cardHeight + 24);
    const width = 660, pitchX = x + 20, pitchY = y + 75, pitchW = 620, pitchH = 690;
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, width, cardHeight);
    text(`${qi + 1}Q`, x + 24, y + 47, 30, '#20362c', 700);
    text(quarter[team].formation, x + width - 24, y + 46, 25, '#66796c', 600, 'right');
    for (let row = 0; row < 8; row++) {
      ctx.fillStyle = row % 2 ? '#347a58' : '#2e7252';
      ctx.fillRect(pitchX, pitchY + row * pitchH / 8, pitchW, pitchH / 8 + 1);
    }
    ctx.strokeStyle = '#ffffff66'; ctx.lineWidth = 2;
    const inset = 20, lx = pitchX + inset, ly = pitchY + inset, lw = pitchW - inset * 2, lh = pitchH - inset * 2;
    ctx.strokeRect(lx, ly, lw, lh);
    ctx.beginPath(); ctx.moveTo(lx, ly + lh / 2); ctx.lineTo(lx + lw, ly + lh / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(lx + lw / 2, ly + lh / 2, lw * .13, 0, Math.PI * 2); ctx.stroke();
    [ly, ly + lh * .84].forEach(by => ctx.strokeRect(lx + lw * .21, by, lw * .58, lh * .16));
    [ly, ly + lh * .93].forEach(by => ctx.strokeRect(lx + lw * .36, by, lw * .28, lh * .07));
    const layout = PITCH_LAYOUTS[quarter[team].formation] || PITCH_LAYOUTS['4-3-3'];
    quarter[team].slots.forEach((slot, index) => {
      const [px, py] = layout[index], cx = pitchX + pitchW * px / 100, cy = pitchY + pitchH * py / 100;
      ctx.save(); ctx.translate(cx - 24, cy - 35);
      ctx.fillStyle = team === 'a' ? '#252a30' : '#87ceeb';
      ctx.beginPath(); [[11,0],[19,4],[29,4],[37,0],[48,13],[40,24],[37,19],[37,45],[11,45],[11,19],[8,24],[0,13]].forEach(([sx, sy], i) => i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy)); ctx.closePath(); ctx.fill();
      const player = plan.roster?.find(p => p.id === slot.playerId);
      text(String(player?.backNumber ?? '·'), 24, 31, 20, team === 'a' ? '#fff' : '#183b50', 700, 'center');
      ctx.restore();
      ctx.fillStyle = '#17452d'; ctx.fillRect(cx - 77, cy + 15, 154, 32);
      text(named(slot.playerId), cx, cy + 39, 22, '#fff', 700, 'center', 145);
      text(slot.position, cx, cy + 68, 17, '#e0eee4', 400, 'center', 150);
    });
    text('휴식 (전체 참석자)', x + 24, y + 802, 19, '#66796c', 600);
    if (!quarter.bench.length) text('없음 · 모두 출전', x + 235, y + 802, 19, '#66796c');
    quarter.bench.forEach((id, i) => text(named(id), x + 24 + (i % 4) * 154, y + 835 + Math.floor(i / 4) * 32, 19, '#20362c', 400, 'left', 145));
    if (quarter.unavailable?.length) {
      const start = y + 835 + benchRows * 32;
      text('이번 쿼터 참여 불가', x + 24, start, 19, '#8d6036', 600);
      quarter.unavailable.forEach((id, i) => text(named(id), x + 24 + (i % 4) * 154, start + 32 + Math.floor(i / 4) * 32, 19, '#66796c', 400, 'left', 145));
    }
  });
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('이미지 생성에 실패했어요. 다시 시도해 주세요.');
  return { blob, filename: `SOOPFC-${team.toUpperCase()}팀-4쿼터-${day.replace(/\D/g, '')}.png` };
}

export function downloadImageBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url;
  link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
