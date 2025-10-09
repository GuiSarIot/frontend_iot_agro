import React from 'react'

import Highcharts, { Options } from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'

const PieExample: React.FC = () => {
    const options: Options = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Egg Yolk Composition'
        },
        subtitle: {
            text: 'Source:<a href="https://www.mdpi.com/2072-6643/11/3/684/htm" target="_blank" rel="noreferrer">MDPI</a>'
        },
        tooltip: {
            valueSuffix: '%'
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: [
                    {
                        enabled: true
                    },
                    {
                        enabled: true,
                        format: '{point.percentage:.1f}%',
                        style: {
                            fontSize: '1.2em',
                            textOutline: 'none',
                            opacity: 0.7
                        },
                        filter: {
                            operator: '>',
                            property: 'percentage',
                            value: 10
                        }
                    }
                ]
            }
        },
        series: [
            {
                type: 'pie',
                name: 'Percentage',
                data: [
                    { name: 'Water', y: 60 },
                    { name: 'Fat', sliced: true, selected: true, y: 26.71 },
                    { name: 'Carbohydrates', y: 1.09 },
                    { name: 'Protein', y: 15.5 },
                    { name: 'Ash', y: 1.68 }
                ]
            }
        ]
    }

    return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default PieExample
