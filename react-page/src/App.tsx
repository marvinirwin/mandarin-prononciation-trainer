import React, {useState} from 'react';
import sampleSentences from './hsk-sample.json';
import './App.css';
import {Character, PinyinQuestion, Sentence} from "./Sentence";
import {CssBaseline, Drawer, List, ListItem, ListItemText, makeStyles, Paper} from "@material-ui/core";
import SampleScroller from './components/Sample-Scroller'

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


export enum Tone {
    One = '\u0304',
    Two = '\u0301',
    Three = '\u030c',
    Four = '\u0300'
}
export const tones: Set<string> = new Set([
    Tone.One,
    Tone.Two,
    Tone.Three,
    Tone.Four,
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

/*
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
*/

// For each sentence find a random tone and use that

const sentences: Sentence[] = sampleSentences
    .map(s => new Sentence(s))
    .filter(s => s.words.filter(w => w.pinyin).length)
    .sort((s1, s2) => {
        if (s1.sample.text.length > s2.sample.text.length) {
            return 1;
        } else if (s1.sample.text.length < s2.sample.text.length) {
            return -1;
        }
        return 0;
    });


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
}));

export interface PersistedData {
    answer: string
}

interface PersistMap {
    [key: string]: PersistedData
}

export class Persistor {
    private data: PersistMap

    constructor() {
        this.data = JSON.parse(window.localStorage.getItem('persist') || '{}');
    }

    read(k: string): PersistedData | undefined {
        return this.data[k];
    }

    write(k: string, v: PersistedData) {
        this.data[k] = v;
    }
}

export const PersistorContext = React.createContext(new Persistor());

export class QuestionGroup {
    questions: PinyinQuestion[];
    constructor(public name: string) {
        this.questions = [];
    }
    toneDisplay() {
        const counts = this.questions.reduce((acc, question: PinyinQuestion) => {
            if (question.word.tone) {
                acc[question.word.tone] += 1;
            }
            return acc;
        }, {[Tone.One]: 0, [Tone.Two]: 0, [Tone.Three]: 0, [Tone.Four]: 0});
        return `(${counts[Tone.One]}) (${counts[Tone.Two]}) (${counts[Tone.Three]}) (${counts[Tone.Four]})`;
    }
}

const unaccentedQuestionMap = new Map<string, QuestionGroup>();
const baseQuestionGroup: QuestionGroup = new QuestionGroup('')
const questionGroups: QuestionGroup[] = [];
sentences.forEach(s => {
    // Let's group by unaccented words
    for (let i = 0; i < s.pinyinQuestions.length; i++) {
        const pinyinQuestion = s.pinyinQuestions[i];
        baseQuestionGroup.questions.push(pinyinQuestion);
        const unaccented = removeTones(pinyinQuestion.word.pinyin as string);
        const g = unaccentedQuestionMap.get(unaccented);
        if (g) {
            g.questions.push(pinyinQuestion)
        } else {
            const g = new QuestionGroup(unaccented);
            g.questions.push(pinyinQuestion)
            unaccentedQuestionMap.set(unaccented, g);
            questionGroups.push(g);
        }
    }
});

function removeTones(w: string) {
    const n = w.normalize('NFD').split('');
    for (let i = 0; i < n.length; i++) {
        const nElement = n[i];
        if (tones.has(nElement)) {
            n.splice(i, 1);
            i--;
        }
    }
    return n.join('');
}

function App() {
    const classes = useStyles()

    const [activeGroup, setActiveGroup] = useState(questionGroups[0]);
    return <div className={classes.root}>
        <CssBaseline/>
        <Drawer
            anchor="left"
            variant="permanent"
            className={classes.drawer}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <List>
                {
                    questionGroups.map((g, i) => <ListItem button onClick={() => setActiveGroup(g)} key={i}>
                        <ListItemText primary={g.name} secondary={g.toneDisplay()}/>
                    </ListItem>)
                }
            </List>
        </Drawer>
        <main>
            <Paper>
                <SampleScroller questions={activeGroup.questions}/>
            </Paper>
        </main>
    </div>
}

export default App
