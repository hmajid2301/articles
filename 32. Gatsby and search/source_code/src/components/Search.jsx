import { Index } from "elasticlunr"
import React, { useState, useEffect } from "react"
import tw from "twin.macro"

import Input from "./Input"
import SearchItems from "./SearchItems"

const Search = ({ searchIndex }) => {
  const index = Index.load(searchIndex)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const searchInput = React.createRef()

  useEffect(() => {
    searchResults("blog")
    searchInput.current.focus()
  }, [])

  function searchResults(searchQuery) {
    const res = index.search(searchQuery, { expand: true }).map(({ ref }) => {
      return index.documentStore.getDoc(ref)
    })
    setResults(res)
  }

  return (
    <SearchContainer>
      <SearchInputContainer>
        <Input
          ref={searchInput}
          className="px-2"
          label="Search"
          onChange={event => {
            const searchQuery = event.target.value
            setQuery(searchQuery)
            searchResults(searchQuery)
          }}
          placeholder="Search"
          value={query}
        />
      </SearchInputContainer>
      <SearchItems query={query} results={results} />
    </SearchContainer>
  )
}

const SearchContainer = tw.div`max-w-screen-md mx-auto pt-8`

const SearchInputContainer = tw.div`flex w-full text-left h-12 text-lg focus-within:shadow-outline my-8`

export default Search
