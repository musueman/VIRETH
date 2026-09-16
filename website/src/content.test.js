import { describe, expect, it } from 'vitest';
import content from './content.json';
import geography from './geography-v63.json';

describe('public hub catalog', () => {
  it('links the complete approved catalog without duplicate identities', () => {
    for (const [key, count] of Object.entries({regions:20, places:166, people:100, stories:14, starts:8, guide:6})) {
      expect(content[key]).toHaveLength(count);
      expect(new Set(content[key].map(x=>x.id)).size).toBe(count);
    }
    content.places.forEach(p=>{expect(content.regions.some(r=>r.id===p.regionId)).toBe(true);expect(p.at).toHaveLength(2);});
    content.people.forEach(p=>{expect(content.regions.some(r=>r.id===p.regionId)).toBe(true);expect(p.image).toMatch(/char-c\d{3}\.webp$/);});
    content.starts.forEach(s=>s.documentIds.forEach(id=>expect(content.stories.some(x=>x.id===id)).toBe(true)));
  });
  it('keeps representative map coordinates and does not publish model instructions', () => {
    geography.centers.forEach(c=>expect(content.places.find(p=>p.id===c.placeId).at).toEqual(c.at));
    const text=JSON.stringify(content);
    expect(text).not.toMatch(/먼권역과숨은역사는단정|reader_inference|event_truth|현재 이해관계|ESTJ|ISTJ/);
    content.stories.forEach(s=>expect(s.html).not.toMatch(/<script|onerror=|javascript:/i));
  });
});
