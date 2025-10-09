import { SeriesOptionsType } from 'highcharts'

import Chart from '@/components/shared/chart/chart'

const AreaExample: React.FC = () => {
    const data: SeriesOptionsType[] = [
        {
            type: 'area',
            name: 'Tokyo (Serie 1)',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
            color: 'var(--background-color-fifth)',
            marker: {
                fillColor: 'white',
                lineWidth: 2,
                lineColor: 'var(--text-color-fourth)'
            }
        },
        {
            type: 'area',
            name: 'London (Serie 2)',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8],
            color: 'var(--text-color-fourth)',
            marker: {
                fillColor: 'white',
                lineWidth: 2,
                lineColor: 'var(--text-color-fourth)'
            }
        }
    ]

    return (
        <Chart
            title="Monthly Average Temperature"
            type="area"
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

export default AreaExample
