import { Link } from "react-router-dom"

const Widget = ({content}) => {
    const contentPage = `${content}Page`;
    return (
        <div className="widgets">
            <Link to= {contentPage}>
                <h1>
                    {content}
                </h1>
            </Link>
        </div>
    )
}

export default Widget;