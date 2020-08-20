import styled from "@emotion/styled"
import { graphql, StaticQuery } from "gatsby"
import React, { useState } from "react"
import tw from "twin.macro"

import Search from "./Search"

const SearchBar = () => {
  const [showSearch, setShowSearch] = useState(false)

  function hideSearch(event) {
    if (event.target.placeholder !== "Search") {
      setShowSearch(false)
    }
  }

  return (
    <SearchComponent>
      <h1
        className="hover:cursor-pointer text-orange-800 text-2xl my-10"
        onClick={() => setShowSearch(!showSearch)}
      >
        Search
      </h1>

      <SearchOverlay
        onClick={e => hideSearch(e)}
        onKeyPress={e => hideSearch(e)}
        role="presentation"
        showSearch={showSearch}
      >
        <StaticQuery
          query={graphql`
            query SearchIndexQuery {
              siteSearchIndex {
                index
              }
            }
          `}
          render={data => (
            <SearchContainer>
              {showSearch && (
                <Search searchIndex={data.siteSearchIndex.index} />
              )}
            </SearchContainer>
          )}
        />
      </SearchOverlay>
    </SearchComponent>
  )
}

const SearchComponent = tw.div`flex-grow flex`

const SearchContainer = tw.div`overflow-y-scroll h-screen w-full`

const SearchOverlay = styled.div`
  opacity: ${props => (props.showSearch ? 1 : 0)};
  display: ${props => (props.showSearch ? "flex" : "none")};
  transition: opacity 150ms linear 0s;
  background: rgba(255, 255, 255, 0.9);
  ${tw`fixed inset-0 bg-opacity-50 z-50 m-0 items-center justify-center h-screen w-screen`};
`

export default SearchBar
