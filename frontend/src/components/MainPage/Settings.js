import { useState } from 'react';
import 'materialize-css/dist/css/materialize.min.css'
import Timer from '../Timer'
import SnakeGame from '../SnakeGame'
import { type } from 'os';

const targetUrls = {
    test: 'https://test-braincert.staging.forasoft.com/',
    dev: 'https://dev-braincert.staging.forasoft.com/',
    preprod: 'http://preprod-braincert.staging.forasoft.com/',
    API: 'http://18.204.178.243/openRoom'
}
function Settings(props) {
    const [sessionSettings, setSessionSettings] = useState({
        size: '1',
        probes: '1',
        pageLoadTimeout: '5',
        screenshotInterval: '30',
        connectionCheckInterval: '5',
        duration: '5',
        rooms: 1,
        target: 'test',
        servers: 1,
        serversType: 't2.micro',
        isRegion: 28
    });

    const calcRooms = ({value, name}) => {
        const copySessionSettings = { ...sessionSettings };
        copySessionSettings[name] = value;
        const {size, probes} = copySessionSettings;
        const needIncrease = +probes > +size && probes % size ? 1 : 0;
        const numberOfRooms = Math.floor(probes / size) + needIncrease;
   // console.log(numberOfRooms, needIncrease, probes > size, {size, probes}, probes % size)
        return numberOfRooms || 1;
    }

    const calcSession = (e) => {
        const {size} = sessionSettings;
        const probes = e.target.value * size
        setSessionSettings({...sessionSettings, probes})
    }

    const changeHandler = async e => {  
        console.log(e.target.name, e.target.value)
        const rooms = e.target.attributes.calcrooms 
            ? calcRooms(e.target)
            : sessionSettings.rooms;
        setSessionSettings({...sessionSettings, rooms, [e.target.name]: e.target.value});
     }

     const sendSettings = () => {
         const sessionSettingsCopy = {...sessionSettings};
        Object.keys(sessionSettingsCopy).forEach(key => {
            if (key === 'target' || key === 'serversType') return; 
            sessionSettingsCopy[key] = key === 'duration' ? +sessionSettingsCopy[key] * 60 : +sessionSettingsCopy[key]
        })
        props.startSession(sessionSettingsCopy);
     }

     const stopSession = () => {
        props.stopSession();
     }

     const renderSettingsBottom = () => {
         console.log(props.isSessionOwner && props.sessionStarted)
        if(props.sessionStarted && props.isSessionOwner) {
            return <div className='settingsBottom'>
                <input onClick={stopSession} type='button' className='waves-effect red btn' value='stop'/>
                {props.startTimer && <Timer/>}
            </div>
        } else if(!props.showResult && props.isSessionOwner) {
            return <input onClick={sendSettings} type='button' className='waves-effect waves-light btn' value='start'/>
        }
        if((!props.isSessionOwner && !props.sessionStarted) || (props.isSessionOwner && props.showResult))
            return <div onClick={props.setShowResult} type='button' className='waves-effect waves-light btn backButton'><i className='material-icons'>keyboard_arrow_left</i>back</div>
        else return <div></div>
     }

    return (
        <div className='settingsPage'>
        <div className='settingsForm' id='settingsForm'>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Concurrent probes</div>
                <input type='number' className='inputNumber' name='probes' calcrooms='1' onChange={changeHandler} defaultValue='1' min='1' max='100'/>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Session size</div>
                <input type='number' className='inputNumber' name='size' calcrooms='1' onChange={changeHandler} defaultValue='1' min='1' max='10'/>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Rooms</div>
                <input type='number' className='inputNumber' value={sessionSettings.rooms} name='rooms' onChange={calcSession} min='1' max='10'/>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Page loading timeout</div>
                <input type='number' className='inputNumber' name='pageLoadTimeout' onChange={changeHandler} min='1' defaultValue='5' max='15'/>
                <div className='settingsSessionTitle'>sec</div>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Screenshot every</div>
                <input type='number' className='inputNumber' name='screenshotInterval' onChange={changeHandler} min='1' defaultValue='30' max='120'/>
                <div className='settingsSessionTitle'>sec</div>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Connection check every</div>
                <input type='number' className='inputNumber' name='connectionCheckInterval' onChange={changeHandler}  min='1' defaultValue='5' max='60'/> 
                <div className='settingsSessionTitle'>sec</div>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Servers</div>
                <input type='number' className='inputNumber' name='servers' onChange={changeHandler}  min='1' defaultValue='1' max={sessionSettings.probes}/>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Server type</div>
                <div className="input-field col s12 envOptions">
                <select onChange={changeHandler} name='serversType' className='browser-default'>
                <option value="t2.micro">t2.micro</option>
                <option value="t2.small">t2.small</option>
                <option value="t2.large">t2.large</option>
                </select>
            </div>
            </div>
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>Session duration</div>
                <input type='number' className='inputNumber' name='duration' onChange={changeHandler} min='1' defaultValue='5' max='10'/>
                <div className='settingsSessionTitle'> min </div>
            </div>
            <div className='settingsSession'>
            <div className='settingsSessionTitle'>Target</div>
            <div className="input-field col s12 envOptions">
                <select onChange={changeHandler} name='target' className='browser-default'>
                <option value="test">Testing</option>
                <option value="dev">Develop</option>
                <option value="preprod">Preprod</option>
                <option value="API">roomManager API</option>
                </select>
            </div>
            <div className='settingsSessionTitle'>{ targetUrls[sessionSettings.target] }</div>
            { sessionSettings.target === 'API' &&
            <div className='settingsSession'>
                <div className='settingsSessionTitle'>isRegion</div>
                <input type='number' className='inputNumber' name='isRegion' onChange={changeHandler}  min='1' defaultValue='28' max='130'/> 
            </div>
            }
        </div>
        </div>
            <div className='settingsStartButton'>
                {renderSettingsBottom()}
                <SnakeGame/>
            </div>

        </div>
    );
}

export default Settings;