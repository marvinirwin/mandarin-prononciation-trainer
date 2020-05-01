import {PinyinQuestion} from "../Sentence";
import {useState} from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import React from 'react';

export default function({questions}: {questions: PinyinQuestion[]}) {
    const [limit, setLimit] = useState(20);
    return <InfiniteScroll
        dataLength={limit}
        next={() => setLimit(limit + 20)}
        hasMore={questions.length > limit}
        loader={<h4>Loading...</h4>}
    >
        {questions.slice(0, limit).map(question => question.Card())}
    </InfiniteScroll>
}