import { Document, Page, View, StyleSheet, Image } from '@react-pdf/renderer'
import header from '@/images/pdfImages/header.jpg'

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFF'
    },

    initialPage: {
        position: 'relative',
        marginBottom: 10,
        height: '100%'
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        border: '1px solid #000',
    },

    imgHeader: {
        width: '100%',
        height: '100%',
    },


    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
    },



})


const PdfGenerator = () => {


    return (
        <Document>
            <Page size="A4" style={styles.page} orientation="landscape">
                <View style={styles.initialPage}>
                    <View style={styles.header} >
                        <Image style={styles.imgHeader} src={header} alt=""/>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

export default PdfGenerator
