import Gauges from "../../ui/Gauges";
import Graph from "../../ui/Graph";
import type { GaugeData, GraphData } from "../../../types/charts";

import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const gaugeData: GaugeData[] = [
        {
            name: "tes1",
            value: 50,
            maxValue: 100,
            color: "#8884d8"
        },
        {
            name: "tes2",
            value: 60,
            maxValue: 100,
            color: "#82ca9d"
        },
        {
            name: "tes3",
            value: 45,
            maxValue: 100,
            color: "#ffc658"
        },
        {
            name: "tes4",
            value: 85,
            maxValue: 100,
            color: "#ff7300"
        }
    ];

    const graphData: GraphData = {
        data: [
            { name: "Jan", tes1: 4000, tes2: 2400, tes3: 2000 },
            { name: "Feb", tes1: 3000, tes2: 1398, tes3: 1800 },
            { name: "Mar", tes1: 2000, tes2: 9800, tes3: 2200 },
            { name: "Apr", tes1: 2780, tes2: 3908, tes3: 2500 },
            { name: "May", tes1: 1890, tes2: 4800, tes3: 2100 },
            { name: "Jun", tes1: 2390, tes2: 3800, tes3: 2300 },
        ],
        dataKeys: ["tes1", "tes2", "tes3"],
        colors: ["#8884d8", "#82ca9d", "#ffc658"]
    };

    const content = [
        {
            item: <Gauges data={gaugeData} title="Ini Gauges" />, 
            className: styles.Gauges
        },
        {
            item: <Graph data={graphData} title="Ini Grafik" type="line" />,
            className: styles.Graph
        }
    ]

    return (
        <div className={styles.Dashboard}>
            {content.map((contentItem, index) => (
                <div key={index} className={contentItem.className}>
                    {contentItem.item}
                </div>
            ))}
        </div>
    );
};

export default Dashboard;