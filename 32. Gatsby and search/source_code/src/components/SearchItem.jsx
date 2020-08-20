import { Link } from "gatsby"
import React from "react"
import Highlighter from "react-highlight-words"
import tw from "twin.macro"

const SearchItem = ({ path, title, query }) => (
  <SearchItemContainer>
    <SearchTitle>
      <Link
        className="hover:text-white hover:bg-blue-500 hover:p-1 rounded"
        to={path}
      >
        <Highlighter
          autoEscape
          highlightStyle={{ backgroundColor: "#ffd54f" }}
          searchWords={query.split(" ")}
          textToHighlight={title}
        />
      </Link>
    </SearchTitle>
    <ReadMore className="hover:text-blue-500 text-lg py-2" type="button">
      <Link to={path}>Read More</Link>
    </ReadMore>
  </SearchItemContainer>
)

const SearchItemContainer = tw.div`my-10`

const SearchTitle = tw.h2`text-2xl font-semibold`

const ReadMore = tw.button`hover:text-blue-500 text-lg py-2`

export default SearchItem
