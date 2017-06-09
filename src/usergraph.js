import React from "react";
import { Group } from '@vx/group';
import { scaleTime, scaleLinear } from '@vx/scale';
import { AreaClosed } from '@vx/shape';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { LinearGradient } from '@vx/gradient';
import { extent, max } from 'd3-array';

class UserGraph extends React.Component {
    constructor(props) {
        super(props)
        this.state = { data: [], height: 200, width: 800, hideChart: "#000000", chartTitle: "", textSize: 12, labelSize: 14 }

        this.updateDimensions = this.updateDimensions.bind(this)
    }

    /*to make it invisible at the start, apply a className to it that will make it so
      to make it update whenever the window is resized, you will have to give it a state. same with the above, it needs a state. otherwise it is static. somehow window
            retrigger has to udpdate the state, which would then cause a rerender 
      to make it autopopulate whenever a crypto is entered, you really just need to rerender, which just means you will have to update the state of it to be the data
       */

    updateDimensions() {
        let update_width;
        let update_height;
        let update_textSize;
        let update_labelSize;

        if (window.innerWidth > 1200) {
            update_width = 0.62 * window.innerWidth;
            update_height = Math.round(update_width / 3);
        } else if (window.innerWidth > 900) {
            update_width = 0.7 * window.innerWidth;
            update_height = Math.round(update_width / 3);
            update_textSize = 8;

        } else if (window.innerWidth > 600) {
            update_width = 0.8 * window.innerWidth;
            update_height = Math.round(update_width / 3);
            update_textSize = 8;
            update_labelSize = 10;
            
        } else {
            update_width = window.innerWidth;
            update_height = Math.round(update_width / 3);
            update_textSize = 4;
            update_labelSize = 10;

        }


        this.setState({ width: update_width, height: update_height, textSize: update_textSize, labelSize: update_labelSize });

    }


    componentDidMount() {
        this.updateDimensions();
        window.addEventListener('resize', this.updateDimensions)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions)
    }

    componentWillReceiveProps() {
        let copyOfData = this.state.data.slice();
        copyOfData = this.props.data;
                console.log(copyOfData);

        console.log(copyOfData.length);
        if (copyOfData.length < 1) {
            this.setState({
                data: copyOfData,
                chartTitle: "",
                hideChart: "#000000"
            })
        } else {
            this.setState({
                data: copyOfData,
                chartTitle: "Past 4 months of Portfolio Performance",
                hideChart: "#ffffff"

            })
        }
    }

    render() {
        const data = this.state.data;
        let width = this.state.width;
        let height = this.state.height;
        const x = d => new Date(d.date * 1000);
        const y = d => d.price;


        // Bounds
        const margin = {
            top: 20,
            bottom: 60,
            left: 80,
            right: 80,
        };
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

        const xScale = scaleTime({
            range: [0, xMax],
            domain: extent(data, x)
        });
        const yScale = scaleLinear({
            range: [yMax, 0],
            domain: [0, max(data, y)],
        });

        return (
            <div className="col-xs-12 text-center">
                <h2>{this.state.chartTitle}</h2>
                <svg width={width} height={height}>
                    <LinearGradient
                        id={'gradient'}
                        to='#015249'
                        from='#061D25'
                    />

                    <Group top={margin.top} left={margin.left}>

                        <AreaClosed
                            data={data}
                            xScale={xScale}
                            yScale={yScale}
                            x={x}
                            y={y}
                            fill={"url(#gradient)"}
                            stroke={""}
                        />

                        <AxisLeft
                            scale={yScale}
                            top={0}
                            left={0}
                            label={<text
                                fill={this.state.hideChart}
                                textAnchor="middle"
                                fontSize={this.state.labelSize}
                                fontFamily="Arial"
                                dx="-1em"
                            >
                                Portfolio Total in USD ($)
                                </text>}
                            stroke={this.state.hideChart}
                            tickTextFill={this.state.hideChart}
                            numTicks={this.state.textSize}
                            tickLabelComponent={(
                                <text
                                    fill={this.state.hideChart}
                                    textAnchor="end"
                                    fontSize={10}
                                    fontFamily="Arial"
                                />)}
                        />

                        <AxisBottom
                            scale={xScale}
                            top={yMax}
                            label={<text
                                fill={this.state.hideChart}
                                textAnchor="middle"
                                fontSize={this.state.labelSize}
                                fontFamily="Arial"
                            >
                                Timeline (2017)
                                </text>}
                            stroke={this.state.hideChart}
                            tickTextFill={this.state.hideChart}
                            numTicks={this.state.textSize}                            
                            tickLabelComponent={(
                                <text
                                    fill={this.state.hideChart}
                                    fontSize={11}
                                    textAnchor="middle"
                                />)}
                            stroke={this.state.hideChart}
                            tickTextFill={this.state.hideChart}
                            tickLabelComponent={(
                                <text
                                    fill={this.state.hideChart}
                                    fontSize={11}
                                    textAnchor="middle"
                                />)}
                        />

                    </Group>
                </svg>
            </div>
        )
    }
}

export default UserGraph;