// @vitest-environment jsdom
import React from 'react';
import {cleanup, render} from '@testing-library/react';
import {afterEach, expect, it} from 'vitest';
import {WelcomeCharacters} from './WelcomeCharacters.jsx';

afterEach(cleanup);
it('renders the two cutouts as non-draggable decoration outside the reading order', () => {
  const {container} = render(<WelcomeCharacters/>);
  const images = [...container.querySelectorAll('img')];
  expect(images).toHaveLength(2);
  for (const image of images) {
    expect(image.alt).toBe('');
    expect(image.draggable).toBe(false);
    expect(image.closest('[aria-hidden="true"]')).not.toBeNull();
  }
  expect(images[0].src).toContain('duran-welcome-transparent');
  expect(images[1].src).toContain('maren-welcome-transparent-flipped');
});
