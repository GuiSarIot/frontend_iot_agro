import { SeriesOptionsType } from 'highcharts'

import Chart from '@/components/shared/chart/chart'

const LinearExample: React.FC = () => {
    const data: SeriesOptionsType[] = [
        {
            type: 'line', // importante para Highcharts
            name: 'Tokyo (Serie 1)',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        },
        {
            type: 'line',
            name: 'London (Serie 2)',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }
    ]

    return (
        <Chart
            title="Monthly Average Temperature"
            type="line"
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

export default LinearExample
