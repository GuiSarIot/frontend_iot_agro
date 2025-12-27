const GetProfileImage = (nameImage) => {
    if (!nameImage) {
        return '/api/get_file?folder=images/users&file=no_photo.jpg'
    }

    return `/api/get_file?folder=images/users&file=${nameImage}`
}

export default GetProfileImage
