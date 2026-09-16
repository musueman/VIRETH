import {expect,it} from 'vitest';
import content from './content.json';

it('keeps the lost Greenhollow estate on the southwest frontier before Ravenstone',()=>{
  const green=content.places.find(p=>p.name==='그린할로우');
  const gate=content.places.find(p=>p.name.includes('레이븐스톤'));
  const refuge=content.places.find(p=>p.name==='뉴할로우');
  expect(green.at[0]).toBeLessThan(gate.at[0]);
  expect(green.at[1]).toBeGreaterThan(gate.at[1]);
  expect(refuge.at[0]).toBeGreaterThan(gate.at[0]);
  expect(refuge.at[1]).toBeGreaterThan(gate.at[1]);
  const village=content.places.find(p=>p.name==='헤크가르가');
  expect(Math.hypot(village.at[0]-green.at[0],village.at[1]-green.at[1])).toBeLessThan(22);
});
