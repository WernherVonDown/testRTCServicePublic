import { useEffect, useState } from 'react';
import Preloader from '../Preloader'
import M from 'materialize-css/dist/js/materialize.min.js'
import classnames from 'classnames';
import {Chart} from '../Chart'

let openedCollabsiblesUser = {};
let openedCollabsiblesRoom = {};
const MOST_VIDEOS_ENABLED = 1;

function Result(props) {
    const [autoCollapse, setAutoCollapse] = useState(false);
    const [showChart, setShowChart] = useState(false)

    useEffect(() => {
        const elems = document.querySelectorAll('.tooltipped');
        M.Tooltip.init(elems);
    })

    useEffect(()=>{
        const elemsCol = document.querySelectorAll('.collapsible');
        M.Collapsible.init(elemsCol, {accordion: autoCollapse});
     //   console.log(instances)
    },[autoCollapse, props.videosEnabled])

    useEffect(() => {
        const elemsImg = document.querySelectorAll('.materialboxed');
        const instancesImg = M.Materialbox.init(elemsImg)
         console.log('===',instancesImg);
    }, [props.screenshots])

    function calcMustVideos(usersInRoom) {
        if (usersInRoom <= MOST_VIDEOS_ENABLED) {
            return usersInRoom ** 2;
        } else {
            const disabledVideoUsers =  usersInRoom - MOST_VIDEOS_ENABLED;
            return (MOST_VIDEOS_ENABLED ** 2) + MOST_VIDEOS_ENABLED * disabledVideoUsers;
        }
    }

    function calcCurrentRoomVideos(users) {
        let currentVideos = 0;
        users.forEach(({probeId, num}) => {
            currentVideos += num;
        });
        return currentVideos;
    }

    function renderImage(elementKey, img, i) {
       // M.Materialbox.init(e.target)
        return <div key={`img/${elementKey}${i}`} className='resultScreenshot'>
            <img className="materialboxed" width="200" src={'data:image/png;base64,'+img}/></div>
    }

    function renderUsers(roomKey, usersInRoom, {probeId, num}) {
        const elementKey = `${roomKey}/user${probeId}`;
        const wasOpenned = openedCollabsiblesUser[elementKey];
        const userMustSeeVideosCount = MOST_VIDEOS_ENABLED > usersInRoom ? usersInRoom : MOST_VIDEOS_ENABLED;
        return <li className={classnames({['active removeTransition']:wasOpenned})} 
                    onClick={(e)=>handleClickCollapsible(elementKey, e)} 
                    name={elementKey}
                     key={elementKey}>
                    <div className="collapsible-header">
                        <div className='resultUserName'>{'user'+(+probeId+1)}</div>
                        <div className='resultUserStat'>Videos: {`${num}/${userMustSeeVideosCount}`} 
                        {num === usersInRoom && <i className="material-icons doneIcon">done</i>}
                        {props.screenshots[elementKey] && <div className='resultUserStat'>{props.screenshots[elementKey].length}<i className='material-icons'>photo_library</i></div>}
                        </div>
                    </div>
                    <div className="collapsible-body">
                        {props.screenshots[elementKey] && <div className={'screenshotsWrapper'}>{props.screenshots[elementKey].map(renderImage.bind(this, elementKey))}</div>}
                    </div>
                </li>
        return <div key={`user${probeId}`}><div className='pageName'>{`user${probeId}`}</div><div><em>videos:</em> <b>{num}</b></div></div>
    }

    function getCollapsibleElemsValue(openedCollabsiblesObj, el) {
        const newVal = !openedCollabsiblesObj[el];
        if(autoCollapse) openedCollabsiblesObj = {};
        openedCollabsiblesObj[el] = newVal;
        return openedCollabsiblesObj
    }
    
    function handleClickCollapsible(el,e, isRoom) {
        e.stopPropagation()
        if (isRoom) {
            openedCollabsiblesRoom = getCollapsibleElemsValue(openedCollabsiblesRoom, el);
           // console.log(openedCollabsiblesRoom)
        } else {
            openedCollabsiblesUser = getCollapsibleElemsValue(openedCollabsiblesUser, el)
           // console.log(openedCollabsiblesUser)
        }
        // очищать в случае анмаунта
    }
    
    function renderSessions(sessionId) {
        const elementKey = `room${sessionId}`;
        const wasOpenned = openedCollabsiblesRoom[elementKey];
        const usersInRoom = props.videosEnabled[+sessionId];
        const numberOfUsersInRoom = usersInRoom.length;
        const mustBeVideos = calcMustVideos(numberOfUsersInRoom);
        const videosInRoom = calcCurrentRoomVideos(usersInRoom);
      //  console.log('usersInRoom', usersInRoom)

        return  <li className={classnames({['active removeTransition']:wasOpenned})}  
                    name={elementKey} 
                    onClick={(e)=>handleClickCollapsible(elementKey, e, true)} 
                    key={elementKey}>
                    <div className="collapsible-header">
                        <div className='resultRoomName'>{'room'+(+sessionId+1)}</div>
                        <div className='resultRoomStat'>users: {numberOfUsersInRoom}</div>
                        <div className='resultRoomStat'>videos: {`${videosInRoom}/${mustBeVideos}`}</div>
                        {videosInRoom === mustBeVideos && <i className="material-icons doneIcon">done_all</i>}
                    </div>
                    <div className="collapsible-body collapsible-bodyResult">
                        <ul className="collapsible expandable">
                            {usersInRoom.map(renderUsers.bind(this, `room${sessionId}`, numberOfUsersInRoom))}
                        </ul>
                    </div>
                </li>

        return <div key={`${sessionId}/${Date.now()}`} className='resultItem'>
                <div>{'room'+sessionId}</div>
                <div>{props.videosEnabled[sessionId].map(renderUsers)}</div>
            </div>
    }

    function renderResults () {
        //console.log('123',props.videosEnabled)
       // console.log('eee', Object.keys(props.videosEnabled))
        return <ul className="collapsible popout collapsibleResult">
                {Object.keys(props.videosEnabled).map(renderSessions)}
                </ul>
        return 
    }

    function onAutoColSwitchChange(e) {
        setAutoCollapse(e.target.checked)

    }

    function setShowChartState() {
        setShowChart(!showChart)
    }

    // const elemsImg = document.querySelectorAll('.materialboxed');
    // const instancesImg = M.Materialbox.init(elemsImg)
    // console.log('instancesImg', instancesImg)

    const chartButtomTooltip = showChart ? 'hide chart' : 'show chart';

    if (!Object.keys(props.videosEnabled).length) {
        
        return <div className='statDuringSession'>
            {/* <Chart chartData={chartData}/> */}
            <Preloader/>
        </div>}
    return (
        <div className='statDuringSession'>
            <div className='commonStat'>
                <div className='leftSide'>
                    <div className='statOption'>
                        videos: {props.allVideosCount}
                    </div>
                    <div className='statOption'>
                        max videos: {props.maxVideosCount}
                    </div>
                    <div className='statOption'>
                    <i className='material-icons chartIcon tooltipped' data-position="top" data-tooltip={chartButtomTooltip} onClick={setShowChartState}>insert_chart</i>
                    </div>
                </div>
                <div className='rightSide'>
                    <div className="switch switchAutoCollapse">
                        <label>
                        Auto callapse
                        <input type="checkbox" onChange={onAutoColSwitchChange}/>
                        <span className="lever"></span>
                        </label>
                    </div>
                </div>
             </div>
            <div className='result'>
            {showChart && <Chart chartData={props.chartData || []}/>}
                {renderResults()}
            </div>
        </div>
    );
}

export default Result;