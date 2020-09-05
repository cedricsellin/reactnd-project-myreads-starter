import React, {Component} from 'react';



class Book extends Component {
    shelfIndexToName = ['currentlyReading','wantToRead', 'read', 'none']

    componentDidMount() {

        //Setting the right selected value in the dropdown depending on the shelf
        var sel = document.getElementById(this.props.bookID)
        var selectedIndex = 1
        switch(this.props.shelf) {
            case this.shelfIndexToName[0]: 
                selectedIndex = 1;
                break;
            case this.shelfIndexToName[1]:
                selectedIndex = 2;
                break;
            case this.shelfIndexToName[2]:
                selectedIndex = 3;
                break;
            default:
                selectedIndex = 4;
                break;
        }
        sel.selectedIndex = selectedIndex
        console.log(`${this.props.shelf} done updating the selected index`)
    }
    render() {
        return (
            <div className="book">
                <div className="book-top">
                    <div className="book-cover" style={{ width: 128, height: 193, backgroundImage: `url(${this.props.backgroundImage})` }}></div>
                    <div className="book-shelf-changer">
                        <select id={this.props.bookID} onChange={(evt)=> {
                                var sel = document.getElementById(this.props.bookID)
                                //Need to remove one from the selectedIndex since the first one is disabled
                                this.props.onChange(this.props.bookID, this.shelfIndexToName[sel.selectedIndex-1])    
                            }}
                                >
                                <option value="move" disabled>Move to...</option>
                                <option value="currentlyReading">Currently Reading</option>
                                <option value="wantToRead">Want to Read</option>
                                <option value="read">Read</option>
                                <option value="none">None</option>
                        </select>
                    </div>
                </div>
                <div className="book-title">{this.props.title}</div>
                <div className="book-authors">{this.props.author}</div>
            </div>
        )

    }


}

export default Book