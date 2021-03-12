import { useState, useEffect } from 'react';

function Timer() {
    const [timer, setTimer] = useState(0);

    const startTimer = () => {
        return setInterval(()=> {
            setTimer(timer => timer + 1)
        },1000);
    }

    useEffect(() => {
        const timerId = startTimer();
        return function cleanup() {
            clearInterval(timerId);
        }
    }, []);

    const formatTimer = () => {
       // const hours = Math.floor(timer/60)
        const mins = Math.floor(timer/60);
        const secs = timer - (mins * 60);
        return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    }

    return (
        <div className='timer'>
            {formatTimer()}
        </div>
    )
}

export default Timer;