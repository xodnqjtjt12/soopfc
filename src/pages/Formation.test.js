import React, { act } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Formation from './Formation';
import { generatePlan } from '../formationEngine';
import { createFormationImage, downloadImageBlob } from '../formationImage';

jest.mock('../firebaseConfig', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: (_db, path) => path,
  getDocs: async path => ({ docs: path === 'players' ? Array.from({ length: 26 }, (_, i) => ({ id: String(i), data: () => ({ name: `선수${i}`, backNumber: i + 1 }) })) : [] }),
  doc: jest.fn(), setDoc: jest.fn(), serverTimestamp: jest.fn(),
}));
jest.mock('../formationImage', () => ({ createFormationImage: jest.fn(), downloadImageBlob: jest.fn() }));
const roster = Array.from({ length: 26 }, (_, i) => ({ id: String(i), name: `선수${i}`, stats: [2, 2, 2, 2], statScale: 5, preferences: ['중앙미드필더', ''], goalkeeper: i < 2 }));
const plan = { ...generatePlan(roster), roster };
beforeEach(() => {
  localStorage.clear(); jest.clearAllMocks();
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
  createFormationImage.mockImplementation(async (_plan, team) => ({ blob: new Blob(['png']), filename: `${team}.png` }));
});
const renderPlan = async () => {
  localStorage.setItem('soopfc-formation-v1', JSON.stringify({ plan, selected: roster.map(p => p.id) }));
  await act(async () => { render(<Formation />); });
};
test('undo restores an exchange and the quarter where the edit happened', async () => {
  await renderPlan();
  const a = plan.quarters[0].a.slots[0], b = plan.quarters[0].b.slots[0];
  const aName = `A팀 골키퍼 선수${a.playerId}`, bName = `B팀 골키퍼 선수${b.playerId}`;
  fireEvent.click(await screen.findByRole('button', { name: aName, exact: true }));
  fireEvent.click(screen.getByRole('button', { name: bName, exact: true }));
  expect(screen.getByRole('button', { name: `A팀 골키퍼 선수${b.playerId}`, exact: true })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: '2Q' }));
  fireEvent.click(screen.getByRole('button', { name: /수정 되돌리기/ }));
  expect(screen.getByRole('tab', { name: '1Q' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: aName, exact: true })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /수정 되돌리기/ })).toBeDisabled();
});
test('preview switches teams and downloads only after save is clicked', async () => {
  await renderPlan();
  fireEvent.click(screen.getByRole('button', { name: '공유 이미지 보기' }));
  const dialog = screen.getByRole('dialog');
  await within(dialog).findByRole('img', { name: 'A팀 1~4쿼터 포메이션 공유 이미지' });
  expect(downloadImageBlob).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'B팀', exact: true }));
  await within(dialog).findByRole('img', { name: 'B팀 1~4쿼터 포메이션 공유 이미지' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'B팀 이미지 저장 ↓' }));
  expect(downloadImageBlob).toHaveBeenCalledWith(expect.any(Blob), 'b.png');
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(URL.revokeObjectURL).toHaveBeenCalled();
});
test('last roster adds only registered players and preserves current attendees without duplicates', async () => {
  localStorage.setItem('soopfc-formation-v1', JSON.stringify({ selected: ['0'], lastRoster: ['1', '1', 'missing'] }));
  await act(async () => { render(<Formation />); });
  await waitFor(() => expect(screen.getByRole('button', { name: '지난 명단 불러오기' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: '지난 명단 불러오기' }));
  expect(screen.getByRole('button', { name: '선수0 참석자 제외' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: '선수1 참석자 제외' })).toHaveLength(1);
  const saved = JSON.parse(localStorage.getItem('soopfc-formation-v1'));
  expect(saved.selected).toEqual(['0', '1']);
});
test('exception-only availability settings prevent a short-handed quarter', async () => {
  localStorage.setItem('soopfc-formation-v1', JSON.stringify({ selected: roster.slice(0, 22).map(p => p.id) }));
  await act(async () => { render(<Formation />); });
  fireEvent.click(screen.getByRole('button', { name: '선수0 출전 설정' }));
  fireEvent.click(screen.getByRole('button', { name: '선수0 1Q 출전 가능' }));
  expect(screen.getByRole('alert')).toHaveTextContent('1Q 1명 부족');
  expect(screen.getByRole('button', { name: '4쿼터 팀 짜기' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '선수0 1Q 출전 가능' }));
  expect(screen.getByRole('button', { name: '4쿼터 팀 짜기' })).toBeEnabled();
});
test('formation selection is undoable and match day view advances quarters without editing controls', async () => {
  await renderPlan();
  const original = screen.getByLabelText('A팀 포메이션').value;
  const target = original === '4-4-2' ? '4-3-3' : '4-4-2';
  fireEvent.change(screen.getByLabelText('A팀 포메이션'), { target: { value: target } });
  expect(screen.getByLabelText('A팀 포메이션')).toHaveValue(target);
  fireEvent.click(screen.getByRole('button', { name: /수정 되돌리기/ }));
  expect(screen.getByLabelText('A팀 포메이션')).toHaveValue(original);
  fireEvent.click(screen.getByRole('button', { name: '경기 당일 보기' }));
  expect(screen.queryByLabelText('A팀 포메이션')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '공유 이미지 보기' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '다음 쿼터 →' }));
  expect(screen.getByRole('heading', { name: '지금은 2쿼터' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '편집으로 돌아가기' }));
  expect(screen.getByLabelText('A팀 포메이션')).toBeInTheDocument();
});
test('guests join the attendee list without writing a member record', async () => {
  await act(async () => { render(<Formation />); });
  fireEvent.click(screen.getByRole('button', { name: '+ 용병 추가' }));
  fireEvent.change(screen.getByLabelText('용병 이름'), { target: { value: '테스트용병' } });
  fireEvent.click(screen.getByRole('button', { name: '오늘 참석자로 추가' }));
  expect(screen.getByRole('button', { name: '테스트용병 참석자 제외' })).toBeInTheDocument();
  const saved = JSON.parse(localStorage.getItem('soopfc-formation-v1'));
  expect(saved.guests[0].isGuest).toBe(true);
  expect(saved.profiles[saved.guests[0].id].stats).toEqual([2, 2, 2, 2]);
});
test('manual empty-slot selection and auto completion preserve the placed player', async () => {
  localStorage.setItem('soopfc-formation-v1', JSON.stringify({ selected: roster.map(p => p.id) }));
  await act(async () => { render(<Formation />); });
  fireEvent.click(screen.getByRole('button', { name: '직접 배치하기' }));
  expect(screen.getByRole('button', { name: '편성 확정·저장' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '공유 이미지 보기' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'A팀 골키퍼 빈자리', exact: true }));
  const picker = screen.getByRole('dialog');
  fireEvent.click(within(picker).getByRole('button', { name: '선수0', exact: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '이 쿼터 빈자리 자동 채우기' }));
  expect(screen.getByRole('button', { name: 'A팀 골키퍼 선수0', exact: true })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '나머지 쿼터 자동 완성' }));
  expect(screen.getByRole('button', { name: '편성 확정·저장' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '공유 이미지 보기' })).toBeEnabled();
});
