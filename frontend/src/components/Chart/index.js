import React from "react";
import c3 from "c3";
import "c3/c3.css";

export const Chart = (props) => {
    React.useEffect(() => {
        if (props.chartData.length && props.chartData[0].length)
            c3.generate({
                bindto: "#chart",
                data: {
                    columns: [["users", ...props.chartData[0]]],
                    type: "line",
                },
                axis: {
                    x: {
                        type: "category",
                        categories: props.chartData[1],
                    },
                },
            });
    }, [props.chartData]);

    return <div id="chart" />;
};
