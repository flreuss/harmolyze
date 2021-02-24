import React from 'react';
import {
  useRouter
} from 'next/router'

import Score from "../../components/Score";


function Notation(props) {
  const router = useRouter();
  const {
    tuneId
  } = router.query;

    // const initialAbcString = props.tuneBook.getTuneById(+tuneId).abc;
    const initialAbcString = props.tuneBook.getTuneById(0).abc;

    return <Score abcString = {initialAbcString}/>;
}

export default Notation;