---
title: "Add an 'edit post' button to your Gatsby blog"
tags: ["gatsby", "react", "git", "javascript"]
license: "public-domain"
slug: "gatsby-edit-button"
canonical_url: "https://haseebmajid.dev/blog/gatsby-edit-button/"
date: "2020-09-07"
published: true
cover_image: "images/cover.jpg"
---

In this article, we will look at how we can add an "edit post" button, to your Gatsby blog. When this button is clicked it will take the user to your markdown file, on github/gitlab that was used to generate the blog post they are currently viewing.

youtube: rALo_BzGKs8

## Setup

Before we add the edit button to a Gatsby blog, let's set up a simple Gatsby site using the `Gatsby blog starter`.
You can skip this step and add the button to an existing site.

```bash
npm -g install gatsby-cli
gatsby new my-blog-starter https://github.com/gatsbyjs/gatsby-starter-blog
```

If you don't use the start above, you will need to make sure you have the `gatsby-source-filesystem` plugin installed. To import our markdown files. Your `gatsby-config.js` looks like this:

```js:title=gatsby-config.js
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/content/blog`,
      name: `blog`,
    },
  },
```

Then make sure you also have the `gatsby-transformer-remark` plugin installed
and it should be in your `gatsby-config.js` like so:

```js:title=gatsby-config.js
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      // ...
    },
  },
```

## (Optional) Blog Post

Let's assume our `gatsby-node.js` file looks like this:

```js:title=gatsby-node.js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPost = path.resolve(`./src/templates/blog-post.js`);
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });
};
```

This is how we create a new blog post for each of our markdown files. You can read more about how
markdown works with [Gatsby here](https://www.gatsbyjs.com/docs/adding-markdown-pages/).

Also let's use a simple template file for your blogs posts. So our `blog-post.js` looks like this:

```jsx:title=src/templates/blog-post.js
import React from "react";
import { Link, graphql } from "gatsby";

// ...

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark;
  const siteTitle = data.site.siteMetadata.title;
  const { previous, next } = pageContext;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      // ...
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`;
```

## Edit Button

Ok, now we need two pieces of information the location of our project on git where our
markdown files are stored. In this example, it's here `https://gitlab.com/hmajid2301/articles`. We also need the path to the markdown file in the git repo. So we can combine
these two pieces of information together to get a URL to the markdown file on git.

First, we need a way to get the file path of the markdown file, we can do this with using our GraphQL query.
The same query we use to get other information such as title and contents. All we need to add is `fileAbsolutePath`
to the `markdownRemark` part of our query. This will return, as the name suggests, the absolute path to the file,
i.e. `/home/haseeb/projects/personal/articles/34. Gatsby edit button/source_code/content/blog/hello-world/index.md`.

```js{11}:title=src/templates/blog-post.js
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      fileAbsolutePath
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`;
```

Now we need a way to use this file path to link to this page on Gitlab. Since I know that
`articles/` is a git repo, we want to remove `/home/haseeb/projects/personal/articles`
from `/home/haseeb/projects/personal/articles/34. Gatsby edit button/source_code/content/blog/hello-world/index.md`.

Then assuming the git URL of our repo, where the markdown files exists, is `https://gitlab.com/hmajid2301/articles`. The path to our markdown file on git could be something like
`https://gitlab.com/hmajid2301/articles/-/blob/master/34. Gatsby edit button/source_code/content/blog/hello-world/index.md`.

So let's add logic to our `blog-post.js` file to generate this git URL. After we have
updated our GraphQL query, we can add the some logic to our code to workout the git URL path.
Let's create a new function called `getGitMarkdownUrl()`.

```jsx:title=src/templates/blog-post.js
const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark;
  const siteTitle = data.site.siteMetadata.title;
  const { previous, next } = pageContext;

  function getGitMarkdownUrl() {
    const pathConst = "/articles/";
    const gitURL = "https://gitlab.com/hmajid2301/articles";
    const sliceIndex =
      post.fileAbsolutePath.indexOf(pathConst) + pathConst.length;
    const markdownFileGitPath = post.fileAbsolutePath.slice(sliceIndex);
    const blogPostOnGit = `${gitURL}/-/blob/master/${markdownFileGitPath}`;
    return blogPostOnGit;
  }

  const gitMarkdownUrl = getGitMarkdownUrl();

  // ....
};
```

> Warn: Don't forget to change the `gitURL` variable in your project!

Where the following two lines remove everything before `/articles/`, so we get
`34. Gatsby edit button/source_code/content/blog/hello-world/index.md`.

```js
const sliceIndex = post.fileAbsolutePath.indexOf(pathConst) + pathConst.length;
const markdownFileGitPath = post.fileAbsolutePath.slice(sliceIndex);
```

Then we combine this with our git URL to end up with the path to the markdown file `https://gitlab.com/hmajid2301/articles/-/blob/master/34. Gatsby edit button/source_code/content/blog/hello-world/index.md`.

```js
const blogPostOnGit = `${gitURL}/-/blob/master/${markdownFileGitPath}`;
```

Finally, all we need to do is add the edit button and have it link to this `gitMarkdownUrl`. You can do something like
this below:

```jsx
<a href={gitMarkdownUrl} rel="noreferrer" target="_blank">
  EDIT THIS POST
</a>
```

If you want to make it look fancier, you can use `react-icons` to get a proper edit icon (as shown in the gif above).

That's it! That's all we needed to do when the user clicks on the edit button it'll take them to the git repo where
the markdown files exist. They can then perhaps fork the project make their edit and open a new merge or pull request
(GitLab vs GitHub) and add in the changes they want (if approved by you).

## Appendix

- [Source Code](https://gitlab.com/hmajid2301/articles/tree/master/34.%20Gatsby%20edit%20button/source_code)
- [Site in video](https://haseebmajid.dev/)
- [Source code](https://gitlab.com/hmajid2301/portfolio-site) for site in video
