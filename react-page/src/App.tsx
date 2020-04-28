import React, {Fragment} from 'react';
import sampleSentences from './hsk-sample.json';
import './App.css';
import hsk1 from './hsk-1.json'
import hsk2 from './hsk-2.json'
import hsk3 from './hsk-3.json'
import hsk4 from './hsk-4.json'


const getRandIndex = (w: Array<any>) => Math.floor(Math.random() * w.length)

interface Sample {
    id: string;
    file: string;
    user_id: string;
    text: string;
    length: string;
}

interface HskWord {
    id: number;
    hanzi: string;
    pinyin: string;
    translations: string[]
}

interface TranslationMap {
    [key: string]: HskWord
}

/*
class AudioTest {
    pinyinOptions: string[]
    answer: undefined | string
    correct: HskWord

    constructor(s: string) {

    }
}
*/


/*
const alphabet = 'abcefghijklmnopqrstuvwxyz'
*/

const tones: Set<string> = new Set([
    '\u0304', // tone 1
    '\u0301', // tone 2
    '\u030c', // tone 3
    '\u0300', // tone 4
]);

// @ts-ignore
/*
let f = (a, b) => [].concat(...a.map(a => b.map(b => [].concat(a, b))));
*/
// @ts-ignore
/*
let cartesian = (a, b, ...c) => b ? cartesian(f(a, b), ...c) : a;
*/

/**
 *
 * @param normalized
 * @param i
 */
function getPermutes(normalized: string, i: number): string[] {
    const perms: string[] = [];
    tones.forEach(t => {
        let start = normalized.substr(0, i);
        const end = normalized.substr(i + 1);
        start += t;
        perms.push(start + end);
    })
    return perms;
}

export function getPinyinTonePermutations(w: string): string[] {
    w = w.normalize('NFD');
    // Now look for tone marks
    const permutes = [];
    for (let i = 0; i < w.length; i++) {
        const wElement = w[i];
        const t = tones.has(wElement);
        if (t) {
            // Now create
            permutes.push(getPermutes(w, i))
        }
    }

    if (permutes.length > 1) {
        // @ts-ignore
        return permutes[0];
    }
    return permutes.flat();
}

export const pinyinMap: TranslationMap = [...hsk1, ...hsk2, ...hsk3, ...hsk4]
    // @ts-ignore
    .reduce((acc: TranslationMap, o: HskWord) => {
            if (o.hanzi.normalize().length === 1) {
                acc[o.hanzi] = o
            }
            return acc;
        },
        {}
    );

class TranslationObject {
    public permutations: string[];
    public word: string;
    public answer: string | undefined;
    public i: number;
    sentence: string;

    get sentenceArray() {
        return this.sentence.split(' ')
    }

    get permutationSentenceArray() {
        return this.permutations.map(word => {
            const s = this.sentenceArray;
            s[this.i] = word;
            return s;
        })
    }

    DisplayComponent(sentenceArray: string[]) {
        return <Fragment>
            {sentenceArray.map((w, i) => {
                if (i === this.i) {
                    return <span style={{color: 'red'}}>{w}</span>
                } else {
                    return <span>{w}</span>
                }
            })}
        </Fragment>
    }

    get Component() {
        return <div>
            <div>{this.sentence}</div>
            <br/>
            {this.permutations.map(p => <div key={p}> {p} </div>)}
            <br/>
            <div>{this.answer}</div>
        </div>
    }

    constructor(sentence: string, public file: string, public id: string) {
        this.sentence = sentence.normalize();
        const words = this.sentenceArray;

        function hasTone(randWord: string) {
            const n = randWord.normalize('NFD');
            for (let i = 0; i < n.length; i++) {
                const nElement = n[i];
                if (tones.has(nElement)) {
                    return true;
                }
            }
            return false;
        }

        for (let i = 0; i < 10; i++) {
            const rand = getRandIndex(words);
            const randWord = words[rand];

            if (hasTone(randWord)) {
                this.permutations = getPinyinTonePermutations(randWord)
                this.word = randWord;
                this.i = rand;
                return;
            }
        }

        this.word = '';
        this.permutations = [];
        this.i = -1;
    }

}


interface WithSentence extends Sample {
    potentialSounds: string[];
    correctAnswer: string;

}

// For each sentence find a random tone and use that
const sentences: TranslationObject[] = [];
sampleSentences.forEach(s => {
    const o = new TranslationObject(s.text.split('')
        .map(char => pinyinMap[char] ? pinyinMap[char].pinyin : char)
        .join(''), s.file, s.id);
    if (o.permutations.length) {
        sentences.push(o);
    }
});


function App() {
    return (
        <div className="App">
            {sentences.map((s) =>
                <div key={s.sentence}>
{/*
                    {s.Component}
*/}

                    <div>Correct answer: {s.DisplayComponent(s.sentenceArray)}</div>
                    <div>
                        <audio
                            controls
                            src={"sound-files/" + s.file}>
                            Your browser does not support the <code>audio</code> element.
                        </audio>
                    </div>
                    <div>
                        {s.permutationSentenceArray.map(p =>
                            <div>
                                {s.DisplayComponent(p)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
