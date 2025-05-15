import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


const Chart = ({ type, title, data, subtitle, xAxis = {}, yAxis = {}, toolTip = {}, others = {}}) => {
    const options = {
        chart: {
            type: type
        },
        title: {
            text: title
        },
        series: data,

        //* Optional props
        subtitle: {
            text: subtitle
        },
        xAxis: type === 'pie' ? undefined : xAxis,
        yAxis: type === 'pie' ? undefined : yAxis,
        tooltip: toolTip,
        ...others
    }

    return <HighchartsReact highcharts={Highcharts} options={options} />
}

Chart.propTypes = {
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            data: PropTypes.arrayOf(PropTypes.number)
        })
    ).isRequired,
    subtitle: PropTypes.string,
    xAxis: PropTypes.object,
    yAxis: PropTypes.object,
    toolTip: PropTypes.object,
    others: PropTypes.object
}

export default Chart