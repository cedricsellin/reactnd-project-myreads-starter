import React, {Component} from 'react'
import Book from './Book'

class Bookshelf extends Component {
    
    render () {

        return (
        <div className="bookshelf">
        <h2 className="bookshelf-title">{this.props.title}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
                {this.props.books.map( (e) => (<li key={e.id + e.shelf}><Book title={e.title} author={e.author} backgroundImage={e.backgroundImage} shelf={e.shelf} bookID={e.id} onChange={this.props.onChange} /></li>) )}
          </ol>
        </div>
      </div>)
    }

}


export default Bookshelf