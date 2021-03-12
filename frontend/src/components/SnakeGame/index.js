import {useEffect, useState} from "react";
import Sketch from 'react-p5';
import M from 'materialize-css/dist/js/materialize.min.js'
import 'materialize-css/dist/css/materialize.min.css'
import Snake from './Snake'
let food, s, scl = 20;

const SnakeGame = () => {
    const [score, setScore] = useState(0);
    useEffect(()=>{
        var elem = document.querySelector('.modal');
        M.Modal.init(elem);
    }, [])

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(460, 360).parent(canvasParentRef);;
         p5.frameRate(15)
         s = new Snake(p5, scl);
         pickLocation(p5)
	};

	const draw = (p5) => {
        if(!s) return;
        p5.background(220);
        if (s.death()) setScore(0)
        s.update();
        s.show()
        if (s.eat(food)) {
            setScore(score+1)
            pickLocation(p5)
        }
        p5.fill('red');
        p5.rect(food.x, food.y, scl, scl)
	};

    function pickLocation(p5) {
        let cols = p5.width/scl;
        let rows = p5.height/scl;
        food = p5.createVector(p5.floor(p5.random(cols)), p5.floor(p5.random(rows)))
        food.mult(scl)
    }

    function keyPressed(e) {
        if(!s) return
        const keyCode = e.key;
        const {x, y} = s.getDir();
        if (keyCode === 'ArrowUp') {
            if (y === 1) return;
            s.dir(0, -1)
        } else if (keyCode === 'ArrowLeft') {
            if (x === 1) return
            s.dir(-1,0)
        } else if (keyCode === 'ArrowRight') {
            if (x === -1) return
            s.dir(1,0)
        } else if (keyCode === 'ArrowDown') {
            if (y === -1) return
            s.dir(0, 1)
        }
    }

    return (
        <>
            <div id="modal1" className="modal">
                <div className="modal-content">
                    <Sketch setup={setup} keyPressed={keyPressed} draw={draw} />
                    <div className='snakeScoreWrapper'><div>Score:</div> <div className='snakeScore'>{score}</div></div>
                </div>
                <div className="modal-footer">
                    <div className="btn modal-close waves-effect waves-green btn-flat">Close</div>
                </div>
            </div>
            <i data-target="modal1" className="modal-trigger material-icons gameIcon">games</i>
        </>
    )
}



export default SnakeGame;