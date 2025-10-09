import Highcharts, { Options, SeriesOptionsType } from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'

interface ChartProps {
    type: Options['chart']['type']
    title: string
    data: SeriesOptionsType[]         // Series de Highcharts
    subtitle?: string
    xAxis?: Options['xAxis']         // Opciones de X axis
    yAxis?: Options['yAxis']         // Opciones de Y axis
    toolTip?: Options['tooltip']     // Opciones de tooltip
    others?: Partial<Options>        // Cualquier otra opción de Highcharts
}

const Chart: React.FC<ChartProps> = ({
    type,
    title,
    data,
    subtitle,
    xAxis = {},
    yAxis = {},
    toolTip = {},
    others = {}
}) => {
    const options: Options = {
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

export default Chart
