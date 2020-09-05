import React from 'react';
import * as BooksAPI from './BooksAPI'
import Bookshelf from './Bookshelf'
import './App.css';
import { Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { debounce } from 'lodash'
//TODO: CHECK HOW TEST IS USED!!!

class BooksApp extends React.Component {
  state = {
    /**
     * TODO: Instead of using this state variable to keep track of which page
     * we're on, use the URL in the browser's address bar. This will ensure that
     * users can use the browser's back and forward buttons to navigate between
     * pages, as well as provide a good URL they can bookmark and share.
     */
    'currentlyReading': [],
    'read': [],
    'wantToRead': [],
    'search': [],
    'searchQuery': ''
  }

  bookIDToShelf = {}

  constructor(props) {
    super(props)
    //TODO: LOOK AT THAT
    this.tmp = []
    this.tmp['currentlyReading'] = []
    this.tmp['wantToRead'] = []
    this.tmp['read'] = []
    this.tmp['none'] = []
    this.tmp['search'] = []

    this.startingANewSearchThrottled = debounce(this.startingANewSearch, 200)
  }

  onChangeOfShelf(bookID, newShelf) {

    console.log(`bookID ${bookID} moved to ${newShelf}`)
    //if not there then add else move 
    BooksAPI.update({ id: bookID }, newShelf).then((resp) => {
      console.log(resp)
      console.log('previous State:' + this.bookIDToShelf[bookID])
      var previousShelf = this.bookIDToShelf[bookID]

      this.setState((previousState) => {
        var movingBook = null

        // Remove book from current Shelf
        this.tmp[previousShelf] = previousState[previousShelf].filter((elem) => {
          if (elem.id === bookID) {
            console.log('found the book!!!')
            movingBook = elem
            return false
          } else {
            return true
          }
        })
        movingBook.shelf = newShelf
        //Adding the newBook to the new shelf
        this.tmp[newShelf].push(movingBook)

        if (newShelf === 'none') {
          console.log('removing book from the shelves')
          delete this.bookIDToShelf[bookID]
        } else {
          this.bookIDToShelf[movingBook.id] = newShelf
          console.log(`moving a book to the ${newShelf}`)
        }

        return (this.tmp)
      })

      //console.log(this.state)
    }
    ).catch((error) => {
      console.log("error" + error)
    })
  }

  parseServerResponseRow(serverRow) {
    var shelf = ''

    if (serverRow.imageLinks.smallThumbnail === undefined) {
      console.log('Book without a thumbnail image - removing from search results')
      return
    }

    //Shelf comes from the server if there isn't any then it is a search result
    shelf = (serverRow.shelf === undefined) ? 'search' : serverRow.shelf

    // Create the array if it doesn't exist
    if (this.tmp[shelf] === undefined)
      this.tmp[shelf] = []

    //Adding book to the database
    if (this.bookIDToShelf[serverRow.id] === undefined)
      this.bookIDToShelf[serverRow.id] = shelf
    else
      console.log('Book returned by the search already on a main shelf')

    //A book that is already on a shelf will be returned 
    this.tmp[shelf].push({
      author: (serverRow.authors === undefined) ? "N/A" : serverRow.authors.join(" & "),
      title: (serverRow.title === undefined) ? "N/A" : serverRow.title,
      //Keeping the id for reference in the future and as a unique identifier in the HTML
      id: serverRow.id,
      shelf: this.bookIDToShelf[serverRow.id],
      backgroundImage: serverRow.imageLinks.smallThumbnail
    })


  }


  parseServerResponse(serverResponse) {
    serverResponse.forEach((row) => { this.parseServerResponseRow(row); })
    //console.log(this)
    this.setState(this.tmp)

  }
  componentDidMount() {
    BooksAPI.getAll().then((resp) => {
      this.parseServerResponse(resp)
      //console.log(resp)
    })

  }

  cleanSearchResults() {

    //console.log(this.tmp['search'])

    this.tmp['search'].forEach((bookInSearchResult) => {
      //Cleaning the mappings only if it is a search result don't remove the existing books on shelves
      if (this.bookIDToShelf[bookInSearchResult.id] === 'search')
        delete this.bookIDToShelf[bookInSearchResult.id]
    })

    this.tmp['search'] = []
    this.setState(this.tmp)
  }


  startingANewSearch() {
    //Removing space from the search
    var text = document.getElementById('searchField').value.trim()
    //Saving the search Query in the state for a refresh...
    this.cleanSearchResults()
    //console.log(text)
    BooksAPI.search(text).then((res) => this.parseServerResponse(res)).catch((error) => console.log('There was an error in the search' + error))
    this.tmp['searchQuery'] = text

  }

  render() {
    return (
      <div className="app">
        <Route exact path='/' render={() =>
          (
            <div className="list-books">
              <div className="list-books-title">
                <h1>MyReads</h1>
              </div>
              <div className="list-books-content">
                <div>
                  <Bookshelf title='Currently Reading' key='currentlyReadingBookshelf' books={this.state.currentlyReading} value='currentlyReading' onChange={(bookID, newShelf) => this.onChangeOfShelf(bookID, newShelf)} />
                  <Bookshelf title='Want to Read' key='wantToReadBookshelf' books={this.state.wantToRead} value='wantToRead' onChange={(bookID, newShelf) => this.onChangeOfShelf(bookID, newShelf)} />
                  <Bookshelf title='Read' key='readBookshelf' books={this.state.read} value='read' onChange={(bookID, newShelf) => this.onChangeOfShelf(bookID, newShelf)} />
                </div>
              </div>
              <div className="open-search">
                <Link to='/search'><button>Add a book</button> </Link>
              </div>
            </div>
          )} />
        <Route path='/search' render={() =>
          (<div className="search-books">
            <div className="search-books-bar">
              {/* cleaning search results when clicking on back */}
              <Link to='/'><button className="close-search" onClick={() => this.cleanSearchResults()}>Close</button></Link>
              <div className="search-books-input-wrapper">
                {
/*      NOTES: The search from BooksAPI is limited to a particular set of search terms.
      You can find these search terms here:
      https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

      However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
      you don't find a specific author or title. Every search is limited by search terms.
    */}
                <input type="text" id='searchField' placeholder="Search by title or author" onChange={() => this.startingANewSearchThrottled()} />
              </div>
            </div>
            <div className="search-books-results">
              <ol className="books-grid">
                <Bookshelf key='searchBookshelf' title='Search Results' books={this.state.search} value='Search Results' onChange={(bookID, newShelf) => this.onChangeOfShelf(bookID, newShelf)} />
              </ol>
            </div>
          </div>)} />
      </div>
    )

  }
}

export default BooksApp
