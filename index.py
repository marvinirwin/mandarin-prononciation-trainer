import json
import os
import tarfile
from pathlib import Path
from shutil import copyfile

hsk_sample_file_path = './react-page/src/hsk-sample.json'

sound_file_location = './react-page/public/sound-files'

def load_json(path):
    with open(path) as f:
        return json.load(f)


def get_subset(n, get_func):
    data = load_json(os.path.expanduser('~/Downloads/primewords_md_2018_set1/set1_transcript.json'))
    small_data = []
    c = 0
    w = 0
    while c < n and w < len(data):
        text = data[w]['text']
        if get_func(text):
            small_data.append(data[w])
        c += 1
        w += 1
    return small_data


def is_percent(word, min_percent, word_set):
    letter_set = {}
    for w in word_set:
        for letter in w:
            letter_set[letter] = 1

    letters_in_hsk = list(filter(lambda x: x == ' ' or x in letter_set, word))

    l1 = len(letters_in_hsk)
    l2 = len(word)

    percent = l1 / l2 * 100
    print('%s is %d percent words in set' % (word, percent))
    if min_percent < percent:
        return True
    else:
        return False


def is_entirely(word, map):
    l = [word for c in word if c in map]
    return len(l) == len(word)


def index_words(data):
    indexed_by_word = {}
    for d in data:
        indexed_by_word[d['hanzi']] = d
    return indexed_by_word


def mergeDicts(*args: dict):
    dict = {}
    for arg in args:
        dict.update(arg)
    return dict


def save_hsk():
    json_ = [
        './react-page/src/hsk-1.json',
        './react-page/src/hsk-2.json',
        './react-page/src/hsk-3.json',
        './react-page/src/hsk-4.json'
    ]
    i = list(map(lambda x: index_words(load_json(x)), json_))
    all_words = mergeDicts(
        *i
    )

    characters_to_ignore = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
    for pop in characters_to_ignore:
        all_words.pop(pop, None)

    target_percent = 55
    sample = get_subset(1000, lambda w: is_percent(w, target_percent, all_words))
    print("Found %i sentences with %i percent desired words."
          % (len(sample), target_percent))
    with open(hsk_sample_file_path, 'w') as json_file:
        json.dump(sample, json_file, ensure_ascii=False)


def resolve_sound_file(base, filename):
    # The dir is the first 3 characters of the string
    first_dir = filename[0]
    second_dir = filename[0:2]
    p = os.path.join(base, first_dir, second_dir, filename)
    return p


def get_sound_files():
    with open('./hsk-sample.json') as f:
        sample = json.load(f)
    base = os.path.expanduser('~/Downloads/primewords_md_2018_set1/audio_files')
    Path(sound_file_location).mkdir(parents=True, exist_ok=True)
    for sentence in sample:
        copyfile(resolve_sound_file(base, sentence['file']), os.path.join('./react-page/public/sound-files', sentence['file']))


html_page = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HSK1</title>
</head>
<body>
<style>
body {{
    font-family: Tahoma, Helvetica, Arial, "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif;
}}
</style>
{body}
</body>
</html>
"""

text_sound = """
<h1>{sentence}</h1>
<audio 
    controls 
    src="{src}" > 
    Your browser does not support the <code>audio</code> element. 
    
</audio>
"""


def generate_html():
    sentences = load_json(hsk_sample_file_path)
    t = "<br/>".join(
        map(
            lambda s: text_sound.format(
                src=os.path.join(sound_file_location, s['file']),
                sentence=' '.join(s['text'])
            ),
            sentences
        )
    )
    open('index.html', 'w').write(
        html_page.format(body=t)
    )


save_hsk()

get_sound_files()

generate_html()
