import React from 'react';
import {
  useRouter
} from 'next/router'

import Score from "../../components/Score";

function Exercise(props) {
  const router = useRouter();
  const {
    tuneId
  } = router.query;

    const initialAbcString = props.tuneBook.getTuneById(+tuneId).abc;

    return <Score abcString = {initialAbcString}/>;
}

export default Exercise;