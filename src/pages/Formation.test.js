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
