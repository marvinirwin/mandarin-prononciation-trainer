import React from 'react';
import { render } from '@testing-library/react';
import App, {getPinyinTonePermutations, pinyinMap} from './App';

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('it permutes pinyin correctly', () => {
  const w = 'wǒmen'.normalize('NFD');
  const permutes = getPinyinTonePermutations(w);
  let target = 'wǒmen';
  expect(permutes[2].normalize()).toBe(target.normalize());

  const s = ''
  let pinyinMap1 = pinyinMap;
  let sentence = '于是 一切又重新开始 而这一来 我又忘记了它们'
      .split('')
      .map(char => pinyinMap1[char] ? pinyinMap1[char].pinyin : char)
      .join('');
  // const morethigns = new TranslationObject(sentence);
  // console.info(morethigns)
});
