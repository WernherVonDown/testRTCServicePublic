import { useEffect, useState } from "react";
import "materialize-css/dist/css/materialize.min.css";

function History(props) {
    const renderHistorySession = (item) => {
        const { target, size, probes, duration, servers } = item.settings;
        return (
            <div
                key={item.sessionId}
                onClick={() => props.requestSessionHistory(item.sessionId)}
                className="collection-item historyItem"
            >
                <div className="historyItemOptionsWrapper">
                    <div className="historyItemOption">{`target: ${target}`}</div>
                    <div className="historyItemOption">{`session size: ${size}`}</div>
                    <div className="historyItemOption">{`probes: ${probes}`}</div>
                    <div className="historyItemOption">{`duration: ${duration / 60}min`}</div>
                    <div className="historyItemOption">{`servers: ${servers}`}</div>
                </div>

                <span className="badge">
                    {new Date(+item.sessionId).toJSON()}
                </span>
            </div>
        );
    };
    if (!props.historySessions.length) return null;
    return (
        <div className="statDuringSession">
            <div className="collection">
                {props.historySessions.map(renderHistorySession)}
            </div>
        </div>
    );
}

export default History;
