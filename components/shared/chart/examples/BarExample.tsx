import { SeriesOptionsType } from 'highcharts'

import Chart from '@/components/shared/chart/chart'

const BarExample: React.FC = () => {
    const data: SeriesOptionsType[] = [
        {
            type: 'column', // importante para Highcharts
            name: 'Tokyo (Serie 1)',
            data: [0, 7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
            color: 'var(--background-color-fifth)',
            //* estilos de dataLabels
            dataLabels: {
                enabled: true,
                align: 'center',
                y: 1
            }
        }
    ]

    return (
        <Chart
            title="Monthly Average Temperature"
            type="column"
            data={data}
            subtitle="Source: WorldClimate.com"
            xAxis={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }}
            yAxis={{
                title: {
                    text: 'Temperature (°C)'
                }
            }}
        />
    )
}

export default BarExample
